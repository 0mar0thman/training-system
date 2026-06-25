const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove any hardcoded "active" classes from HTML sidebar links
    content = content.replace(/class="([^"]*)sidebar-item\s+active\s+([^"]*)"/g, 'class="$1sidebar-item $2"');
    content = content.replace(/class="([^"]*)sidebar-item\s+([^"]*)\bactive\b([^"]*)"/g, 'class="$1sidebar-item $2 $3"');
    
    // Some links also have font-semibold hardcoded on the active element. We should standardize.
    // I'll leave the script to handle it, but it's cleaner to just let the script do everything.
    
    // Inject script tag before </body> if it doesn't exist
    if (!content.includes('js/sidebar.js')) {
        content = content.replace('</body>', '    <script src="js/sidebar.js"></script>\n</body>');
    }

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file} with sidebar script.`);
});
