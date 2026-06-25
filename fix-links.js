const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Fix Dashboard link
    content = content.replace(/<a href="index\.html"([^>]*?>\s*<i data-lucide="layout-dashboard".*?<\/a>)/gs, '<a href="dashboard.html"$1');

    // Fix Settings link
    content = content.replace(/<a href="#"([^>]*?>\s*<i data-lucide="settings".*?<\/a>)/gs, '<a href="settings.html"$1');

    // Remove static active classes so the JS handles it perfectly, or let JS remove it.
    // I'll let JS handle the dynamic application.

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
