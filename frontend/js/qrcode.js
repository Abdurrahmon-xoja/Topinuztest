/* ─── Minimal QR encoder ───────────────────────────────────────────────────
 * Byte mode, error-correction level M, versions 1-10 (up to 216 bytes) —
 * comfortably more than a product URL needs.
 *
 * Vendored rather than pulled from a CDN: the only thing we encode is the page
 * the visitor is already on, and sending that to a third-party QR service to
 * get a picture back would leak browsing data for no reason. It also keeps the
 * feature working when a CDN is blocked, which matters for .uz traffic.
 *
 * Exposes window.qrMatrix(text) -> boolean[size][size], true = dark module.
 * ───────────────────────────────────────────────────────────────────────── */
(function () {
    'use strict';

    // ── Galois field GF(256), primitive polynomial 0x11D ────────────────────
    const EXP = new Uint8Array(512);
    const LOG = new Uint8Array(256);
    (function initGF() {
        let x = 1;
        for (let i = 0; i < 255; i++) {
            EXP[i] = x;
            LOG[x] = i;
            x <<= 1;
            if (x & 0x100) x ^= 0x11d;
        }
        for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
    })();

    const gfMul = (a, b) => (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]];

    // Generator polynomial for `degree` error-correction codewords.
    function rsGenerator(degree) {
        let poly = [1];
        for (let d = 0; d < degree; d++) {
            const next = new Array(poly.length + 1).fill(0);
            for (let i = 0; i < poly.length; i++) {
                next[i] ^= poly[i];
                next[i + 1] ^= gfMul(poly[i], EXP[d]);
            }
            poly = next;
        }
        return poly;
    }

    function rsEncode(data, ecLen) {
        const gen = rsGenerator(ecLen);
        const rem = new Array(ecLen).fill(0);
        for (const byte of data) {
            const factor = byte ^ rem[0];
            rem.shift();
            rem.push(0);
            for (let i = 0; i < ecLen; i++) rem[i] ^= gfMul(gen[i + 1], factor);
        }
        return rem;
    }

    // ── Version tables, error-correction level M ────────────────────────────
    // [ total data codewords, EC codewords per block, block layout ]
    // Block layout is [count, dataLen] pairs; two pairs where the spec splits a
    // version into short and long blocks.
    const VERSIONS = {
        1:  { data: 16,  ec: 10, blocks: [[1, 16]] },
        2:  { data: 28,  ec: 16, blocks: [[1, 28]] },
        3:  { data: 44,  ec: 26, blocks: [[1, 44]] },
        4:  { data: 64,  ec: 18, blocks: [[2, 32]] },
        5:  { data: 86,  ec: 24, blocks: [[2, 43]] },
        6:  { data: 108, ec: 16, blocks: [[4, 27]] },
        7:  { data: 124, ec: 18, blocks: [[4, 31]] },
        8:  { data: 154, ec: 22, blocks: [[2, 38], [2, 39]] },
        9:  { data: 182, ec: 22, blocks: [[3, 36], [2, 37]] },
        10: { data: 216, ec: 26, blocks: [[4, 43], [1, 44]] }
    };

    // Centre coordinates of the alignment patterns, per version.
    const ALIGN = {
        1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30],
        6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50]
    };

    function pickVersion(byteLen) {
        for (let v = 1; v <= 10; v++) {
            // Mode indicator (4 bits) + character count + payload must fit.
            const countBits = v < 10 ? 8 : 16;
            if (VERSIONS[v].data * 8 >= 4 + countBits + byteLen * 8) return v;
        }
        return null;
    }

    // ── Bit stream ──────────────────────────────────────────────────────────
    function buildCodewords(bytes, version) {
        const cfg = VERSIONS[version];
        const bits = [];
        const push = (value, len) => {
            for (let i = len - 1; i >= 0; i--) bits.push((value >> i) & 1);
        };

        push(0b0100, 4);                          // byte mode
        push(bytes.length, version < 10 ? 8 : 16); // character count
        for (const b of bytes) push(b, 8);

        // Terminator, then pad to a byte boundary.
        const capacity = cfg.data * 8;
        push(0, Math.min(4, capacity - bits.length));
        while (bits.length % 8 !== 0) bits.push(0);

        const codewords = [];
        for (let i = 0; i < bits.length; i += 8) {
            let byte = 0;
            for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
            codewords.push(byte);
        }
        // Alternating pad bytes defined by the spec.
        const PAD = [0xec, 0x11];
        for (let i = 0; codewords.length < cfg.data; i++) codewords.push(PAD[i % 2]);

        // Split into blocks, compute EC per block, then interleave.
        const dataBlocks = [];
        const ecBlocks = [];
        let pos = 0;
        for (const [count, len] of cfg.blocks) {
            for (let i = 0; i < count; i++) {
                const block = codewords.slice(pos, pos + len);
                pos += len;
                dataBlocks.push(block);
                ecBlocks.push(rsEncode(block, cfg.ec));
            }
        }

        const out = [];
        const maxData = Math.max(...dataBlocks.map(b => b.length));
        for (let i = 0; i < maxData; i++) {
            for (const block of dataBlocks) if (i < block.length) out.push(block[i]);
        }
        for (let i = 0; i < cfg.ec; i++) {
            for (const block of ecBlocks) out.push(block[i]);
        }
        return out;
    }

    // ── Matrix construction ─────────────────────────────────────────────────
    function buildMatrix(version, codewords, mask) {
        const size = version * 4 + 17;
        const m = Array.from({ length: size }, () => new Array(size).fill(null));
        const reserved = Array.from({ length: size }, () => new Array(size).fill(false));

        const setF = (r, c, v) => {
            if (r < 0 || c < 0 || r >= size || c >= size) return;
            m[r][c] = v;
            reserved[r][c] = true;
        };

        // Finder patterns plus their separators.
        const finder = (row, col) => {
            for (let r = -1; r <= 7; r++) {
                for (let c = -1; c <= 7; c++) {
                    const inRing = (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
                                   (c >= 0 && c <= 6 && (r === 0 || r === 6));
                    const inCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
                    setF(row + r, col + c, inRing || inCore ? 1 : 0);
                }
            }
        };
        finder(0, 0);
        finder(0, size - 7);
        finder(size - 7, 0);

        // Timing patterns.
        for (let i = 8; i < size - 8; i++) {
            setF(6, i, i % 2 === 0 ? 1 : 0);
            setF(i, 6, i % 2 === 0 ? 1 : 0);
        }

        // Alignment patterns, skipping those that collide with a finder.
        const centres = ALIGN[version];
        for (const r of centres) {
            for (const c of centres) {
                if ((r <= 8 && c <= 8) || (r <= 8 && c >= size - 9) || (r >= size - 9 && c <= 8)) continue;
                for (let dr = -2; dr <= 2; dr++) {
                    for (let dc = -2; dc <= 2; dc++) {
                        const ring = Math.max(Math.abs(dr), Math.abs(dc));
                        setF(r + dr, c + dc, ring === 1 ? 0 : 1);
                    }
                }
            }
        }

        setF(size - 8, 8, 1); // the always-dark module

        // Reserve the format areas before laying data.
        for (let i = 0; i < 9; i++) {
            if (m[8][i] === null) setF(8, i, 0);
            if (m[i][8] === null) setF(i, 8, 0);
        }
        for (let i = 0; i < 8; i++) {
            if (m[8][size - 1 - i] === null) setF(8, size - 1 - i, 0);
            if (m[size - 1 - i][8] === null) setF(size - 1 - i, 8, 0);
        }
        // Version information, versions 7 and up.
        if (version >= 7) {
            for (let i = 0; i < 6; i++) {
                for (let j = 0; j < 3; j++) {
                    setF(size - 11 + j, i, 0);
                    setF(i, size - 11 + j, 0);
                }
            }
        }

        // Data placement: two-column zigzag from the bottom-right, skipping
        // column 6 (the vertical timing pattern).
        let bitIndex = 0;
        const totalBits = codewords.length * 8;
        const bitAt = (i) => i < totalBits ? (codewords[i >> 3] >> (7 - (i & 7))) & 1 : 0;

        for (let right = size - 1; right > 0; right -= 2) {
            if (right === 6) right = 5;
            for (let vert = 0; vert < size; vert++) {
                for (let j = 0; j < 2; j++) {
                    const col = right - j;
                    const upward = ((right + 1) & 2) === 0;
                    const row = upward ? size - 1 - vert : vert;
                    if (reserved[row][col]) continue;
                    let bit = bitAt(bitIndex++);
                    if (maskFn(mask, row, col)) bit ^= 1;
                    m[row][col] = bit;
                }
            }
        }

        placeFormat(m, size, mask);
        if (version >= 7) placeVersion(m, size, version);
        return m;
    }

    function maskFn(mask, r, c) {
        switch (mask) {
            case 0: return (r + c) % 2 === 0;
            case 1: return r % 2 === 0;
            case 2: return c % 3 === 0;
            case 3: return (r + c) % 3 === 0;
            case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
            case 5: return ((r * c) % 2) + ((r * c) % 3) === 0;
            case 6: return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
            case 7: return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
        }
        return false;
    }

    // 15-bit BCH format information; 0b00 is EC level M.
    function placeFormat(m, size, mask) {
        const data = (0b00 << 3) | mask;
        let rem = data;
        for (let i = 0; i < 10; i++) rem = (rem << 1) ^ (((rem >> 9) & 1) * 0x537);
        const bits = ((data << 10) | rem) ^ 0x5412;

        const get = (i) => (bits >> i) & 1;

        // First copy: bits 0-5 run *down* column 8, round the corner at (8,8),
        // then leftward along row 8. Orientation matters — transposing these
        // two runs produces a QR that looks plausible and decodes as nothing.
        for (let i = 0; i <= 5; i++) m[i][8] = get(i);
        m[7][8] = get(6);
        m[8][8] = get(7);
        m[8][7] = get(8);
        for (let i = 9; i <= 14; i++) m[8][14 - i] = get(i);

        // Second copy: bits 0-7 along row 8 from the right edge, bits 8-14 up
        // column 8 from the bottom edge.
        for (let i = 0; i <= 7; i++) m[8][size - 1 - i] = get(i);
        for (let i = 8; i <= 14; i++) m[size - 15 + i][8] = get(i);
        m[size - 8][8] = 1;
    }

    // 18-bit BCH version information, versions 7 and up.
    function placeVersion(m, size, version) {
        let rem = version;
        for (let i = 0; i < 12; i++) rem = (rem << 1) ^ (((rem >> 11) & 1) * 0x1f25);
        const bits = (version << 12) | rem;
        for (let i = 0; i < 18; i++) {
            const bit = (bits >> i) & 1;
            const a = Math.floor(i / 3);
            const b = (i % 3) + size - 11;
            m[b][a] = bit;
            m[a][b] = bit;
        }
    }

    // ── Mask selection ──────────────────────────────────────────────────────
    function penalty(m, size) {
        let score = 0;

        // Rule 1 — runs of five or more same-coloured modules.
        for (let i = 0; i < size; i++) {
            for (const horizontal of [true, false]) {
                let run = 1;
                for (let j = 1; j < size; j++) {
                    const cur = horizontal ? m[i][j] : m[j][i];
                    const prev = horizontal ? m[i][j - 1] : m[j - 1][i];
                    if (cur === prev) {
                        run++;
                    } else {
                        if (run >= 5) score += run - 2;
                        run = 1;
                    }
                }
                if (run >= 5) score += run - 2;
            }
        }

        // Rule 2 — 2x2 blocks of one colour.
        for (let r = 0; r < size - 1; r++) {
            for (let c = 0; c < size - 1; c++) {
                const v = m[r][c];
                if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) score += 3;
            }
        }

        // Rule 3 — finder-like 1:1:3:1:1 patterns.
        const A = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
        const B = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
        const matches = (get, start) => {
            let a = true, b = true;
            for (let k = 0; k < 11; k++) {
                const v = get(start + k);
                if (v !== A[k]) a = false;
                if (v !== B[k]) b = false;
            }
            return a || b;
        };
        for (let i = 0; i < size; i++) {
            for (let j = 0; j + 11 <= size; j++) {
                if (matches(k => m[i][k], j)) score += 40;
                if (matches(k => m[k][i], j)) score += 40;
            }
        }

        // Rule 4 — deviation from an even split of dark and light.
        let dark = 0;
        for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) dark += m[r][c];
        const percent = (dark * 100) / (size * size);
        score += Math.floor(Math.abs(percent - 50) / 5) * 10;

        return score;
    }

    /**
     * Encode `text` and return the module matrix.
     * @returns {boolean[][]} matrix[row][col], true where the module is dark.
     */
    window.qrMatrix = function qrMatrix(text) {
        const bytes = Array.from(new TextEncoder().encode(String(text)));
        const version = pickVersion(bytes.length);
        if (!version) throw new Error('QR: text too long (max 216 bytes)');

        const codewords = buildCodewords(bytes, version);
        const size = version * 4 + 17;

        let best = null;
        let bestScore = Infinity;
        for (let mask = 0; mask < 8; mask++) {
            const candidate = buildMatrix(version, codewords, mask);
            const score = penalty(candidate, size);
            if (score < bestScore) {
                bestScore = score;
                best = candidate;
            }
        }
        return best.map(row => row.map(v => v === 1));
    };
})();
