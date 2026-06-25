document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // ── Set today's date in the welcome banner ──────────────────────────────
    const dateEl = document.getElementById('today-date');
    if (dateEl) {
        const now = new Date();
        dateEl.textContent = now.toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    // ── Dummy Recent Activity Data ──────────────────────────────────────────
    const activityData = [
        {
            eventType: 'Invoice Paid',
            description: 'Acme Corp paid $4,500.00',
            date: 'Today, 9:14 AM',
            status: 'Paid',
            statusStyle: 'bg-emerald-50 text-emerald-600 border border-emerald-100'
        },
        {
            eventType: 'New Enrollment',
            description: 'Ahmed Abdelwahab — Advanced Safety Proc.',
            date: 'Today, 8:02 AM',
            status: 'Active',
            statusStyle: 'bg-emerald-50 text-emerald-600 border border-emerald-100'
        },
        {
            eventType: 'Certificate Issued',
            description: 'Sara Al-Mutairi — Project Mgmt Prof.',
            date: 'Yesterday',
            status: 'Issued',
            statusStyle: 'bg-emerald-50 text-emerald-600 border border-emerald-100'
        },
        {
            eventType: 'Invoice Overdue',
            description: 'Global Tech Solutions — $12,800.00 unpaid',
            date: 'Nov 14, 2023',
            status: 'Overdue',
            statusStyle: 'bg-rose-50 text-rose-600 border border-rose-100'
        },
        {
            eventType: 'Pending Review',
            description: 'Fatima Zahra certificate pending admin approval',
            date: 'Nov 10, 2023',
            status: 'Pending',
            statusStyle: 'bg-amber-50 text-amber-600 border border-amber-100'
        }
    ];

    // ── Render the activity table ───────────────────────────────────────────
    const tbody = document.getElementById('activity-table-body');
    if (tbody) {
        tbody.innerHTML = activityData.map(row => `
            <tr class="hover:bg-gray-50/50 transition-colors">
                <td class="px-6 py-4 font-semibold text-gray-800 text-sm">${row.eventType}</td>
                <td class="px-6 py-4 text-gray-500 text-sm max-w-[220px]">${row.description}</td>
                <td class="px-6 py-4 text-gray-400 text-sm whitespace-nowrap">${row.date}</td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${row.statusStyle}">
                        ${row.status}
                    </span>
                </td>
            </tr>
        `).join('');

        // Re-initialize icons after DOM injection
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
});
