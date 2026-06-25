const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace hrefs with clean URLs
    content = content.replace(/href="dashboard\.html"/g, 'href="/dashboard"');
    content = content.replace(/href="index\.html"/g, 'href="/clients"');
    content = content.replace(/href="trainees\.html"/g, 'href="/trainees"');
    content = content.replace(/href="courses\.html"/g, 'href="/courses"');
    content = content.replace(/href="certificates\.html"/g, 'href="/certificates"');
    content = content.replace(/href="invoices\.html"/g, 'href="/invoices"');
    content = content.replace(/href="reports\.html"/g, 'href="/reports"');
    content = content.replace(/href="settings\.html"/g, 'href="/settings"');

    fs.writeFileSync(filePath, content);
});
console.log('Successfully updated HTML routes to clean URLs.');
