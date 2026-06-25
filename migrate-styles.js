/**
 * migrate-styles.js
 * -----------------
 * Removes all inline <style>...</style> blocks from app HTML pages
 * and adds <link rel="stylesheet" href="/css/styles.css"> to <head>.
 *
 * Auth pages (login, register) have unique animation styles — their
 * <style> blocks are also removed since orb styles are now in styles.css.
 *
 * Run: node migrate-styles.js
 */

const fs   = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

const allPages = [
    'index.html',
    'dashboard.html',
    'trainees.html',
    'courses.html',
    'certificates.html',
    'invoices.html',
    'reports.html',
    'settings.html',
    'login.html',
    'register.html',
];

// The link tag to inject (after the last existing <link> in <head>)
const STYLES_LINK = '    <link rel="stylesheet" href="/css/styles.css">';

// Regex to match any <style>...</style> block (including multiline)
const STYLE_BLOCK_REGEX = /\n?\s*<style>[\s\S]*?<\/style>/g;

let updated = 0;
let skipped = 0;

allPages.forEach(file => {
    const fp = path.join(publicDir, file);
    if (!fs.existsSync(fp)) {
        console.log(`SKIP  ${file} — not found`);
        skipped++;
        return;
    }

    let content = fs.readFileSync(fp, 'utf8');

    // ── 1. Remove all inline <style> blocks ─────────────────────────────
    const stripped = content.replace(STYLE_BLOCK_REGEX, '');

    // ── 2. Inject <link> if not already present ──────────────────────────
    let result = stripped;
    if (!result.includes('/css/styles.css')) {
        // Insert just before the closing </head>
        result = result.replace('</head>', `${STYLES_LINK}\n</head>`);
    }

    if (result === content) {
        console.log(`SKIP  ${file} — no changes needed`);
        skipped++;
        return;
    }

    fs.writeFileSync(fp, result);
    console.log(`OK    ${file}`);
    updated++;
});

console.log(`\nDone. Updated: ${updated} | Skipped: ${skipped}`);
