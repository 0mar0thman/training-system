/**
 * migrate-sidebar.js
 * ------------------
 * One-time migration: removes hardcoded <aside> blocks from all app HTML pages
 * and replaces them with #sidebar-container + inject-sidebar.js script tag.
 *
 * Run: node migrate-sidebar.js
 */

const fs   = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// Pages that use the sidebar (auth pages deliberately excluded)
const targetFiles = [
    'index.html',
    'dashboard.html',
    'trainees.html',
    'courses.html',
    'certificates.html',
    'invoices.html',
    'reports.html',
    'settings.html'
];

// Regex that matches the full <aside ...> ... </aside> block (DOTALL)
const ASIDE_REGEX = /<aside\b[^>]*>[\s\S]*?<\/aside>/;

// The placeholder that replaces the aside
const SIDEBAR_PLACEHOLDER = `<div id="sidebar-container" class="w-64 shrink-0"></div>`;

// Script tag to inject (placed before </body>)
const INJECT_SCRIPT = `    <script src="/js/inject-sidebar.js"></script>`;

let filesUpdated = 0;
let filesSkipped = 0;

targetFiles.forEach(file => {
    const filePath = path.join(publicDir, file);

    if (!fs.existsSync(filePath)) {
        console.warn(`  SKIP  ${file} — file not found`);
        filesSkipped++;
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // ── 1. Replace <aside> block ─────────────────────────────────────────
    if (!ASIDE_REGEX.test(content)) {
        // Check if already migrated (has the container)
        if (content.includes('id="sidebar-container"')) {
            console.log(`  SKIP  ${file} — already migrated`);
            filesSkipped++;
        } else {
            console.warn(`  WARN  ${file} — no <aside> found and not yet migrated`);
            filesSkipped++;
        }
        return;
    }

    content = content.replace(ASIDE_REGEX, SIDEBAR_PLACEHOLDER);

    // ── 2. Remove old sidebar.js / inject-sidebar.js script tags (avoid dupes) ──
    content = content.replace(/\s*<script src="js\/sidebar\.js"><\/script>/g, '');
    content = content.replace(/\s*<script src="\/js\/inject-sidebar\.js"><\/script>/g, '');
    content = content.replace(/\s*<script src="js\/inject-sidebar\.js"><\/script>/g, '');

    // ── 3. Inject the new script tag just before </body> ─────────────────
    if (!content.includes('inject-sidebar.js')) {
        content = content.replace('</body>', `${INJECT_SCRIPT}\n</body>`);
    }

    fs.writeFileSync(filePath, content);
    console.log(`  OK    ${file}`);
    filesUpdated++;
});

console.log(`\nDone. Updated: ${filesUpdated} | Skipped: ${filesSkipped}`);
