/**
 * Populates frontend/uploads/ for local development.
 *
 * The database stores image and model paths as relative URLs (/uploads/...), but
 * the files themselves are not in git. This walks every path referenced by the
 * local database, satisfies what it can from the dated dumps at the repo root,
 * and downloads the remainder from production.
 *
 * Run after scrape_admin.js:
 *   node backend/utils/mirrorUploads.js
 *   node backend/utils/mirrorUploads.js --ar      also fetch GLB/USDZ/ZIP models
 *
 * Read-only against production: GETs static files, never touches its database.
 */

const fs = require('fs');
const path = require('path');
const { Shop, ShopImage, Product } = require('../models');

const ORIGIN = 'https://topin.uz';
const UPLOADS_DIR = path.join(__dirname, '../../frontend');
const CONCURRENCY = 8;

// Dated dumps committed at the repo root; they cover only part of the current set.
const DUMP_DIRS = [
    path.join(__dirname, '../../houz_shops_2026-06-27_13_10'),
    path.join(__dirname, '../../houz_shops_gallery_2026-06-27_13_10')
];

const AR_EXTENSIONS = ['.glb', '.usdz', '.zip'];

function collectPaths(rows, ...fields) {
    const found = [];
    for (const row of rows) {
        for (const field of fields) {
            const value = row[field];
            if (!value) continue;

            if (field === 'images') {
                // Stored as a JSON array inside a single TEXT column.
                try {
                    const parsed = JSON.parse(value);
                    if (Array.isArray(parsed)) found.push(...parsed);
                } catch (e) { /* not valid JSON — skip */ }
            } else {
                found.push(value);
            }
        }
    }
    return found.filter(p => typeof p === 'string' && p.startsWith('/uploads/'));
}

function buildDumpIndex() {
    const index = new Map();
    for (const dir of DUMP_DIRS) {
        if (!fs.existsSync(dir)) continue;
        for (const name of fs.readdirSync(dir)) {
            if (!index.has(name)) index.set(name, path.join(dir, name));
        }
    }
    return index;
}

async function fetchOne(urlPath, dumpIndex, stats) {
    const target = path.join(UPLOADS_DIR, urlPath);

    if (fs.existsSync(target)) { stats.present++; return; }

    fs.mkdirSync(path.dirname(target), { recursive: true });

    const filename = path.basename(urlPath);
    const fromDump = dumpIndex.get(filename);
    if (fromDump) {
        fs.copyFileSync(fromDump, target);
        stats.copied++;
        return;
    }

    try {
        const res = await fetch(ORIGIN + urlPath);
        if (!res.ok) { stats.missing.push(`${res.status} ${urlPath}`); return; }

        const body = Buffer.from(await res.arrayBuffer());

        // A missing /uploads/ path falls through to the SPA catch-all, which
        // answers 200 with index.html. Saving that would leave an HTML file
        // wearing a .glb extension, which fails much later and confusingly.
        if (body.subarray(0, 15).toString() === '<!DOCTYPE html>') {
            stats.missing.push(`GONE ${urlPath} (server returned the HTML fallback)`);
            return;
        }

        fs.writeFileSync(target, body);
        stats.downloaded++;
    } catch (err) {
        stats.missing.push(`ERR ${urlPath} (${err.message})`);
    }
}

async function run() {
    const includeAr = process.argv.includes('--ar');

    const [shops, shopImages, products] = await Promise.all([
        Shop.findAll({ attributes: ['logoUrl', 'bannerUrl'], raw: true }),
        ShopImage.findAll({ attributes: ['url'], raw: true }),
        Product.findAll({ attributes: ['imageUrl', 'images', 'glbUrl', 'usdzUrl', 'zipUrl'], raw: true })
    ]);

    let paths = [
        ...collectPaths(shops, 'logoUrl', 'bannerUrl'),
        ...collectPaths(shopImages, 'url'),
        ...collectPaths(products, 'imageUrl', 'images', 'glbUrl', 'usdzUrl', 'zipUrl')
    ];

    const arPaths = paths.filter(p => AR_EXTENSIONS.includes(path.extname(p).toLowerCase()));
    if (!includeAr) {
        paths = paths.filter(p => !AR_EXTENSIONS.includes(path.extname(p).toLowerCase()));
    }

    const queue = [...new Set(paths)];
    console.log(`${queue.length} unique files referenced by the local database.`);
    if (!includeAr && arPaths.length > 0) {
        console.log(`Skipping ${new Set(arPaths).size} AR models (they are large) — pass --ar to include them.`);
    }

    const dumpIndex = buildDumpIndex();
    console.log(`${dumpIndex.size} files available in the local dumps.\n`);

    const stats = { present: 0, copied: 0, downloaded: 0, missing: [] };
    let cursor = 0;
    let lastReport = 0;

    await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
        while (cursor < queue.length) {
            const item = queue[cursor++];
            await fetchOne(item, dumpIndex, stats);

            const done = stats.present + stats.copied + stats.downloaded + stats.missing.length;
            if (done - lastReport >= 100) {
                lastReport = done;
                console.log(`  ${done}/${queue.length}...`);
            }
        }
    }));

    console.log('\nDone.');
    console.log(`  already present: ${stats.present}`);
    console.log(`  copied from dumps: ${stats.copied}`);
    console.log(`  downloaded: ${stats.downloaded}`);
    console.log(`  unavailable: ${stats.missing.length}`);

    if (stats.missing.length > 0) {
        console.log('\nUnavailable (these render as broken images locally):');
        for (const m of stats.missing.slice(0, 20)) console.log(`  ${m}`);
        if (stats.missing.length > 20) console.log(`  ...and ${stats.missing.length - 20} more`);
    }

    process.exit(0);
}

run().catch(err => { console.error('mirrorUploads failed:', err); process.exit(1); });
