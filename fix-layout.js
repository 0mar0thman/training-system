const fs   = require('fs');
const path = require('path');

const pages = [
    'index.html', 'dashboard.html', 'trainees.html', 'courses.html',
    'certificates.html', 'invoices.html', 'reports.html', 'settings.html'
];

const OLD = '<div id="sidebar-container" class="w-64 shrink-0"></div>';
const NEW = '<div id="sidebar-container" class="w-64 fixed h-full z-20"></div>';

pages.forEach(file => {
    const fp = path.join(__dirname, 'public', file);
    if (!fs.existsSync(fp)) { console.log(`SKIP ${file} — not found`); return; }

    const original = fs.readFileSync(fp, 'utf8');
    if (!original.includes(OLD)) {
        // already fixed or different format — try to patch via partial match
        if (original.includes('id="sidebar-container"')) {
            const patched = original.replace(
                /(<div id="sidebar-container")[^>]*(><\/div>)/,
                '$1 class="w-64 fixed h-full z-20"$2'
            );
            fs.writeFileSync(fp, patched);
            console.log(`PATCH ${file}`);
        } else {
            console.log(`SKIP  ${file} — sidebar-container not found`);
        }
        return;
    }

    fs.writeFileSync(fp, original.replaceAll(OLD, NEW));
    console.log(`OK    ${file}`);
});

console.log('\nDone.');
