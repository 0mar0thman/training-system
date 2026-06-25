document.addEventListener('DOMContentLoaded', () => {
    // 1. Get current pathname
    let currentPath = window.location.pathname;
    
    // Default root URL to /dashboard or /clients to ensure an active state
    if (!currentPath || currentPath === '/' || currentPath === '/index.html') {
        currentPath = '/clients'; // The main default page
    }

    // 2. Query all sidebar links
    const sidebarItems = document.querySelectorAll('.sidebar-item');

    sidebarItems.forEach(item => {
        let href = item.getAttribute('href');
        if (!href) return;

        // Ensure href starts with / for reliable comparison
        if (!href.startsWith('/')) {
            href = '/' + href;
        }

        // 3. Apply active state cleanly
        if (href === currentPath || (currentPath === '/dashboard' && href === '/clients')) {
            // Dashboard and Clients & Companies currently point to the same index file,
            // so we'll strictly highlight the exact match. 
            // Actually, let's keep it strictly exact match:
        }
        
        if (href === currentPath) {
            // Add active class and font weight
            item.classList.add('active', 'font-semibold');
            
            // Remove inactive classes
            item.classList.remove('text-gray-400', 'hover:bg-[#131b2b]', 'hover:text-gray-100', 'font-medium', 'text-gray-300');
        } else {
            // Ensure inactive classes are present
            item.classList.remove('active', 'font-semibold');
            item.classList.add('text-gray-400', 'hover:bg-[#131b2b]', 'hover:text-gray-100', 'font-medium');
        }
    });
});
