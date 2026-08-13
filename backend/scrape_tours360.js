/**
 * Connects shops to their 360° virtual tours on platform360.uz.
 *
 * The public listing at /ru/locations renders every tour as a .brand-card with
 * its name, category and city. This reads that page, matches each tour against
 * the shop catalogue by name, and writes the tour URL onto the matching shops.
 *
 * Only exact name matches (after normalisation) are written. Near-misses are
 * printed for a human to confirm and never applied — the shortlist contains
 * pairs like "Grohe" against "Hansgrohe", which are different companies, and a
 * wrong tour on a shop page is worse than no tour.
 *
 * A tour is written to *every* shop row of that name. This catalogue
 * cross-lists by duplicating rows — Porcelanosa exists three times, once per
 * category — and they are all the same physical showroom, so they all get it.
 *
 * Idempotent: re-running rewrites the same values.
 *
 *   node backend/scrape_tours360.js          # apply exact matches
 *   node backend/scrape_tours360.js --dry    # show what would change
 */
require('dotenv').config();
const { Shop, Category, sequelize } = require('./models');

const DRY = process.argv.includes('--dry');
const LISTING = 'https://platform360.uz/ru/locations';

// Matches one .brand-card anchor: url, name, category, city.
const CARD = new RegExp(
    'href="(https://platform360\\.uz/ru/locations/[^"]+)"[^>]*class="brand-card[^"]*"\\s*>' +
    '(?:(?!<\\/a>).)*?brand-card__name">([^<]*)<' +
    '(?:(?!<\\/a>).)*?brand-card__category"><span>([^<]*)<\\/span><span>([^<]*)<\\/span>',
    'gs'
);

const decode = s => String(s).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
// Fold case, strip punctuation and collapse whitespace so "Lider stone" and
// "Lider Stone" compare equal, without being loose enough to merge brands.
const norm = s => decode(s).toLowerCase()
    .replace(/[''`’]/g, '')
    .replace(/[^a-z0-9а-яё]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

async function fetchListing() {
    const res = await fetch(LISTING, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; topin.uz tour linker)' }
    });
    if (!res.ok) throw new Error(`${LISTING} responded ${res.status}`);
    return res.text();
}

function parseTours(html) {
    const out = [];
    for (const m of html.matchAll(CARD)) {
        out.push({ url: m[1], name: decode(m[2]).trim(), category: decode(m[3]).trim(), city: decode(m[4]).trim() });
    }
    return out;
}

async function run() {
    console.log(`${DRY ? '[dry run] ' : ''}Linking 360° tours from ${LISTING}\n`);

    const tours = parseTours(await fetchListing());
    if (!tours.length) {
        // The selector is tied to platform360's markup; if they restyle the
        // listing this is where it shows up, and silence would be worse.
        throw new Error('No tours parsed — the listing markup has probably changed.');
    }
    console.log(`  tours found: ${tours.length}`);

    const shops = await Shop.findAll({ include: [{ model: Category }] });
    const byName = new Map();
    for (const s of shops) {
        const k = norm(s.name);
        if (!byName.has(k)) byName.set(k, []);
        byName.get(k).push(s);
    }

    const applied = [], review = [], unmatched = [];

    for (const tour of tours) {
        const key = norm(tour.name);
        const hit = byName.get(key);

        if (hit) {
            for (const shop of hit) {
                if (shop.tour360Url === tour.url) continue;
                applied.push(`${shop.name} (#${shop.id}, ${shop.Category ? shop.Category.slug : '—'})`);
                if (!DRY) await shop.update({ tour360Url: tour.url });
            }
            continue;
        }

        // Not applied — only surfaced. One name containing the other is a hint,
        // not evidence.
        const near = shops.filter(s => {
            const k = norm(s.name);
            return (k.includes(key) || key.includes(k)) && Math.min(k.length, key.length) >= 4;
        });
        if (near.length) review.push(`${tour.name}  ~  ${[...new Set(near.map(s => s.name))].join(' / ')}`);
        else unmatched.push(tour.name);
    }

    console.log(`  linked: ${applied.length} shop rows`);
    applied.forEach(a => console.log(`     ${a}`));

    if (review.length) {
        console.log(`\n  Needs a human — similar names, NOT linked:`);
        review.forEach(r => console.log(`     ${r}`));
        console.log(`     (set these by hand in the admin if they are the same business)`);
    }

    console.log(`\n  No shop in the catalogue: ${unmatched.length} tours`);

    const total = await Shop.count({ where: { tour360Url: { [require('sequelize').Op.ne]: null } } });
    console.log(`\n  shops with a tour now: ${DRY ? '(unchanged in dry run)' : total}`);
    console.log(DRY ? '\nDry run complete, nothing written.' : '\nDone.');
    await sequelize.close();
}

run().catch(err => { console.error('Scrape failed:', err.message); process.exit(1); });
