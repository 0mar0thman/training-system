/**
 * inject-sidebar.js
 * -----------------
 * Fetches /components/sidebar.html once, injects it into #sidebar-container,
 * filters links based on user role, applies active states,
 * then re-initialises Lucide icons so the SVGs render correctly.
 */
(function injectSidebar() {
    // ── Authentication Check ───────────────────────────────────────
    const currentPath = window.location.pathname;
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('user_role') || 'ADMIN';

    if (!token && currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login';
        return;
    }

    const container = document.getElementById('sidebar-container');
    if (!container) return;

    fetch('/components/sidebar.html')
        .then(res => {
            if (!res.ok) throw new Error(`Could not load sidebar: ${res.status}`);
            return res.text();
        })
        .then(html => {
            container.innerHTML = html;

            // ── Dynamic user role display inside sidebar header ──
            const headerDiv = container.querySelector('aside > div:first-child');
            if (headerDiv) {
                const roleBadge = document.createElement('span');
                roleBadge.className = 'text-[9px] bg-[#ab8038]/20 text-[#ab8038] px-2 py-0.5 rounded font-bold uppercase mt-1 block w-max';
                roleBadge.textContent = userRole;
                headerDiv.appendChild(roleBadge);
            }

            // ── Filter sidebar links based on roles ──
            const roleVisibility = {
                'ADMIN': ['/dashboard', '/clients', '/trainees', '/courses', '/certificates', '/invoices', '/reports', '/settings'],
                'FINANCE': ['/dashboard', '/invoices', '/reports', '/settings'],
                'SALES': ['/dashboard', '/clients', '/trainees', '/courses', '/settings'],
                'TRAINER': ['/dashboard', '/courses', '/settings'],
                'SUPERVISOR': ['/dashboard', '/trainees', '/courses', '/certificates', '/settings']
            };

            const allowedPaths = roleVisibility[userRole] || roleVisibility['ADMIN'];

            container.querySelectorAll('.sidebar-item[data-path]').forEach(link => {
                const linkPath = link.getAttribute('data-path');

                if (!allowedPaths.includes(linkPath)) {
                    link.remove();
                    return;
                }

                if (linkPath === currentPath) {
                    link.classList.add('active', 'font-semibold');
                    link.classList.remove(
                        'text-gray-400', 'hover:bg-[#131b2b]',
                        'hover:text-gray-100', 'font-medium'
                    );
                } else {
                    link.classList.remove('active', 'font-semibold');
                    link.classList.add(
                        'text-gray-400', 'hover:bg-[#131b2b]',
                        'hover:text-gray-100', 'font-medium'
                    );
                }
            });

            // Add Logout Button at the bottom
            const nav = container.querySelector('nav');
            if (nav) {
                const logoutBtn = document.createElement('button');
                logoutBtn.className = 'w-full flex items-center gap-3 px-4 py-3 rounded-md text-red-400 hover:bg-red-950/20 hover:text-red-300 text-sm font-medium transition-colors mt-auto text-left';
                logoutBtn.innerHTML = '<i data-lucide="log-out" class="w-4 h-4"></i> Logout';
                logoutBtn.addEventListener('click', () => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user_role');
                    localStorage.removeItem('user_name');
                    window.location.href = '/login';
                });
                nav.appendChild(logoutBtn);
            }

            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            } else {
                window.addEventListener('load', () => {
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                });
            }
        })
        .catch(err => {
            console.error('[inject-sidebar]', err);
        });
})();