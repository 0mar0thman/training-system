import { api } from './api.js';
import { ui } from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('invoices-table-body');
    if (!tbody) return;

    let invoicesList = [];
    let companiesList = [];
    let currentPage = 1;
    let currentFilters = { status: [], companyId: "" };
    let currentFilteredInvoices = [];
    const ITEMS_PER_PAGE = 10;

    // Load companies for modal
    const cResult = await api.getCompanies();
    if (cResult.success) companiesList = cResult.companies;

    // ========== Toast ==========
    function showToast(msg, type = 'success') {
        let c = document.getElementById('toast-container');
        if (!c) { c = document.createElement('div'); c.id = 'toast-container'; c.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col gap-2'; document.body.appendChild(c); }
        const t = document.createElement('div');
        const clr = { success: 'bg-emerald-600', error: 'bg-rose-600', warning: 'bg-amber-500' }[type] || 'bg-gray-800';
        t.className = `flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${clr} transition-all opacity-0 translate-y-2`;
        t.textContent = msg;
        c.appendChild(t);
        requestAnimationFrame(() => t.classList.remove('opacity-0', 'translate-y-2'));
        setTimeout(() => { t.classList.add('opacity-0', 'translate-y-2'); setTimeout(() => t.remove(), 300); }, 3500);
    }

    // ========== Confirm ==========
    function showConfirm(msg, cb) {
        let ov = document.createElement('div');
        ov.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] flex items-center justify-center p-4';
        ov.innerHTML = `<div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                    <i data-lucide="alert-triangle" class="w-5 h-5 text-rose-500"></i>
                </div>
                <div>
                    <h3 class="font-bold text-gray-900">تأكيد الحذف</h3>
                    <p class="text-xs text-gray-500">هذا الإجراء لا يمكن التراجع عنه</p>
                </div>
            </div>
            <p class="text-sm text-gray-700 mb-6">${msg}</p>
            <div class="flex gap-3">
                <button id="cv-cancel" class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">إلغاء</button>
                <button id="cv-ok" class="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm">حذف</button>
            </div></div>`;
        document.body.appendChild(ov);
        if (window.lucide) lucide.createIcons();
        document.getElementById('cv-cancel').onclick = () => ov.remove();
        document.getElementById('cv-ok').onclick = () => { ov.remove(); cb(); };
        ov.onclick = (e) => { if (e.target === ov) ov.remove(); };
    }

    function setupSearch() {
        const searchInput = document.querySelector('input[placeholder="Search invoices..."]');
        if (searchInput) searchInput.addEventListener('input', () => renderPage(1));
    }

    function setupFilters() {
        const filterBtn = document.getElementById('btn-filter-invoices');
        const filterPanel = document.getElementById('filter-panel');
        const applyBtn = document.getElementById('btn-apply-filters');
        const closeBtn = document.getElementById('btn-close-filter');
        const clearBtn = document.getElementById('btn-clear-filters');
        const statusContainer = document.getElementById('status-filter-options');
        const companySelect = document.getElementById('company-filter-select');

        if (!filterBtn || !filterPanel) return;

        const statuses = ['PAID', 'PENDING', 'OVERDUE', 'PARTIALLY_PAID', 'CANCELLED'];
        statusContainer.innerHTML = statuses.map(s => `
            <label class="flex items-center gap-2.5 text-sm font-medium text-gray-700 cursor-pointer">
                <input type="checkbox" value="${s}" class="filter-status-cb rounded border-gray-300 text-[#ab8038] focus:ring-[#ab8038]/30">
                <span>${s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ')}</span>
            </label>
        `).join('');

        companySelect.innerHTML = `<option value="">All Companies</option>` +
            companiesList.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

        const openFilter = () => filterPanel.classList.remove('hidden');
        const closeFilter = () => filterPanel.classList.add('hidden');

        filterBtn.addEventListener('click', openFilter);
        closeBtn.addEventListener('click', closeFilter);
        filterPanel.addEventListener('click', (e) => { if (e.target === filterPanel) closeFilter(); });

        applyBtn.addEventListener('click', () => {
            const selectedStatuses = Array.from(document.querySelectorAll('.filter-status-cb:checked')).map(cb => cb.value);
            currentFilters.status = selectedStatuses;
            currentFilters.companyId = companySelect.value;
            closeFilter();
            renderPage(1);
        });

        clearBtn.addEventListener('click', () => {
            document.querySelectorAll('.filter-status-cb').forEach(cb => cb.checked = false);
            companySelect.value = '';
            currentFilters = { status: [], companyId: "" };
            closeFilter();
            renderPage(1);
        });
    }

    function setupExport() {
        const exportBtn = document.getElementById('btn-export-invoices');
        if (!exportBtn) return;

        exportBtn.onclick = () => {
            if (currentFilteredInvoices.length === 0) {
                showToast('No invoices to export based on current filters.', 'warning');
                return;
            }

            let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
            csvContent += "Invoice ID,Company,Course,Date Issued,Total Amount,Status\n";

            currentFilteredInvoices.forEach((inv) => {
                const po = `"${inv.poNumber || 'N/A'}"`;
                const company = `"${inv.company?.name || 'N/A'}"`;
                const course = `"${inv.course?.courseName || 'General Request'}"`;
                const date = new Date(inv.issuedAt).toLocaleDateString('en-US');
                const amount = inv.amount;
                const status = inv.paymentStatus;
                csvContent += `${po},${company},${course},${date},${amount},${status}\n`;
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `Invoices_Export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('Invoices exported successfully!', 'success');
        };
    }

    // ========== Load Invoices & Update Widgets ==========
    async function loadInvoices() {
        const result = await api.getInvoices();
        if (result.success) {
            invoicesList = result.invoices || [];
            renderPage(1);
            updateStatsCards(invoicesList);
        } else {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-rose-500">An error occurred while loading invoices.</td></tr>`;
        }
    }

    function renderPage(page) {
        const searchInput = document.querySelector('input[placeholder="Search invoices..."]');
        const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
        let filteredData = invoicesList;

        if (query) {
            filteredData = filteredData.filter(inv =>
                (inv.poNumber || "").toLowerCase().includes(query) ||
                (inv.company?.name || "").toLowerCase().includes(query) ||
                (inv.paymentStatus || "").toLowerCase().replace('_', ' ').includes(query)
            );
        }

        if (currentFilters.status.length > 0) {
            filteredData = filteredData.filter(inv => currentFilters.status.includes(inv.paymentStatus));
        }
        if (currentFilters.companyId) {
            filteredData = filteredData.filter(inv => inv.companyId === currentFilters.companyId);
        }

        currentFilteredInvoices = filteredData;

        currentPage = page;
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const paginatedItems = filteredData.slice(start, end);

        renderTable(paginatedItems);
        ui.renderPagination({
            containerId: "pagination-container",
            currentPage: page,
            totalItems: filteredData.length,
            itemsPerPage: ITEMS_PER_PAGE,
            onPageClick: renderPage,
        });
    }

    // ========== Update Stats Cards Dynamically ==========
    function updateStatsCards(invoices) {
        let totalOutstanding = 0;
        let pendingCount = 0;
        let pendingAmount = 0;
        let overdueCount = 0;
        let overdueAmount = 0;
        let paidCount = 0;
        let paidAmount = 0;
        let partiallyPaidCount = 0;
        let partiallyPaidAmount = 0;
        let cancelledCount = 0;
        let cancelledAmount = 0;

        invoices.forEach((inv) => {
            const amount = parseFloat(inv.amount) || 0;

            if (inv.paymentStatus === "PENDING" || inv.paymentStatus === "OVERDUE") {
                totalOutstanding += amount;
            }

            if (inv.paymentStatus === "PENDING") {
                pendingCount++;
                pendingAmount += amount;
            }

            if (inv.paymentStatus === "OVERDUE") {
                overdueCount++;
                overdueAmount += amount;
            }

            if (inv.paymentStatus === "PAID") {
                paidCount++;
                paidAmount += amount;
            }

            if (inv.paymentStatus === "PARTIALLY_PAID") {
                partiallyPaidCount++;
                partiallyPaidAmount += amount;
            }

            if (inv.paymentStatus === "CANCELLED") {
                cancelledCount++;
                cancelledAmount += amount;
            }
        });

        const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

        document.querySelectorAll("main .grid > div").forEach((card) => {
            const titleEl = card.querySelector("h3");
            if (!titleEl) return;

            const title = titleEl.textContent.trim();
            const valueEl = card.querySelector("p.text-\\[32px\\]");
            const subTextEl = card.querySelectorAll("p")[1];

            const totalOutstandingEl = document.getElementById("stat-total-outstanding");
            if (totalOutstandingEl) totalOutstandingEl.textContent = formatter.format(totalOutstanding);

            if (title === "PENDING INVOICES" && valueEl) {
                valueEl.textContent = pendingCount;
                if (subTextEl) {
                    subTextEl.textContent = `Total amount: ${formatter.format(pendingAmount)}`;
                }
            } else if (title === "OVERDUE INVOICES" && valueEl) {
                valueEl.textContent = overdueCount;
                if (subTextEl) {
                    subTextEl.textContent = `Total amount: ${formatter.format(overdueAmount)}`;
                }
            } else if (title === "PAID INVOICES" && valueEl) {
                valueEl.textContent = paidCount;
                if (subTextEl) {
                    subTextEl.textContent = `Total amount: ${formatter.format(paidAmount)}`;
                }
            } else if (title === "PARTIALLY PAID" && valueEl) {
                valueEl.textContent = partiallyPaidCount;
                if (subTextEl) {
                    subTextEl.textContent = `Total amount: ${formatter.format(partiallyPaidAmount)}`;
                }
            } else if (title === "CANCELLED" && valueEl) {
                valueEl.textContent = cancelledCount;
                if (subTextEl) {
                    subTextEl.textContent = `Total amount: ${formatter.format(cancelledAmount)}`;
                }
            }
        });

        if (window.lucide) lucide.createIcons();
    }

  // ========== Render Table ==========
    function renderTable(data) {
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center py-12 text-gray-400">
                <div class="flex flex-col items-center gap-2">
                    <i data-lucide="file-text" class="w-8 h-8 text-gray-300"></i>
                    <span>No invoices found.</span>
                </div></td></tr>`;
            if (window.lucide) lucide.createIcons();
            return;
        }

        tbody.innerHTML = data.map(inv => {
            const badgeMap = {
                'PAID': 'bg-emerald-50 text-emerald-600 border-emerald-100',
                'PENDING': 'bg-gray-100 text-gray-600 border-gray-200',
                'INVOICED': 'bg-blue-50 text-blue-600 border-blue-100', // ضفنا الحالة الجديدة هنا
                'PARTIALLY_PAID': 'bg-amber-50 text-amber-600 border-amber-100',
                'OVERDUE': 'bg-rose-50 text-rose-600 border-rose-100',
                'CANCELLED': 'bg-gray-100 text-gray-400 border-gray-200'
            };
            const labelMap = { PAID: 'Paid', PENDING: 'Pending', INVOICED: 'Invoiced', PARTIALLY_PAID: 'Partially Paid', OVERDUE: 'Overdue', CANCELLED: 'Cancelled' };
            const badge = badgeMap[inv.paymentStatus] || 'bg-gray-100 text-gray-500';
            const label = labelMap[inv.paymentStatus] || inv.paymentStatus;
            const date = new Date(inv.issuedAt).toLocaleDateString('en-US');
            const amount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(inv.amount);
            
            return `
                <tr class="hover:bg-gray-50/50 transition-colors group">
                    <td class="px-6 py-4 text-sm font-bold text-gray-900">${inv.poNumber || 'N/A'}</td>
                    <td class="px-6 py-4">
                        <p class="font-bold text-gray-900 leading-tight">${inv.company?.name || 'N/A'}</p>
                        <p class="text-[11px] text-gray-500">${inv.course ? inv.course.courseName : 'General Request'}</p>
                    </td>
                    <td class="px-6 py-4 text-gray-500 text-sm">${date}</td>
                    <td class="px-6 py-4 font-bold text-gray-900">${amount}</td>
                    <td class="px-6 py-4">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border ${badge}">${label.replace('_', ' ')}</span>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onclick="window.downloadInvoicePDF(${JSON.stringify(inv).replace(/"/g, '&quot;')})" title="Download PDF" class="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                                <i data-lucide="file-down" class="w-4 h-4"></i>
                            </button>
                            <button onclick="window.openInvoiceModal(${JSON.stringify(inv).replace(/"/g, '&quot;')})" title="Edit" class="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors">
                                <i data-lucide="pencil" class="w-4 h-4"></i>
                            </button>
                            <button onclick="window.deleteInvoice('${inv.id}', '${(inv.poNumber || 'this invoice').replace(/'/g, '')}')" title="Delete" class="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
        }).join('');
        if (window.lucide) lucide.createIcons();
    }

// ========== Download PDF Function ==========
    window.downloadInvoicePDF = function(inv) {
        const date = new Date(inv.issuedAt).toLocaleDateString('en-US');
        const amount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(inv.amount);
        
        // تصميم الفاتورة اللي هيطلع في الـ PDF
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Invoice - ${inv.poNumber || 'N/A'}</title>
                <style>
                    body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
                    .company-name { font-size: 24px; font-weight: bold; color: #ab8038; }
                    .invoice-title { font-size: 28px; font-weight: bold; color: #333; }
                    .details { margin-bottom: 40px; display: flex; justify-content: space-between; }
                    .details-col { display: flex; flex-direction: column; gap: 5px; }
                    .total { font-size: 20px; font-weight: bold; margin-top: 30px; border-top: 2px solid #eee; padding-top: 10px; text-align: right; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background-color: #f9fafb; font-weight: bold; color: #555; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="company-name">TMS Central</div>
                    <div class="invoice-title">INVOICE</div>
                </div>
                
                <div class="details">
                    <div class="details-col">
                        <strong>Billed To:</strong>
                        <span>${inv.company?.name || 'N/A'}</span>
                    </div>
                    <div class="details-col" style="text-align: right;">
                        <strong>Invoice Number:</strong> <span>${inv.poNumber || 'N/A'}</span><br>
                        <strong>Date:</strong> <span>${date}</span><br>
                        <strong>Status:</strong> <span>${inv.paymentStatus.replace('_', ' ')}</span>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${inv.course ? inv.course.courseName : 'General Request'}</td>
                            <td style="text-align: right;">${amount}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="total">
                    Total Amount: ${amount}
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    // ========== Open Modal ==========
    window.openInvoiceModal = (invRaw = null) => {
        let inv = null;
        if (invRaw) {
            try { inv = typeof invRaw === 'string' ? JSON.parse(invRaw.replace(/&quot;/g, '"')) : invRaw; }
            catch(e) {}
        }
        const editing = !!inv;
        let modal = document.getElementById('invoice-modal');
        if (modal) modal.remove();

        const companyOptions = companiesList.map(c =>
            `<option value="${c.id}" ${inv?.companyId === c.id ? 'selected' : ''}>${c.name}</option>`
        ).join('');
        const statusOptions = ['PAID','PENDING','PARTIALLY_PAID','OVERDUE','CANCELLED'].map(s =>
            `<option value="${s}" ${editing ? (inv.paymentStatus === s ? 'selected' : '') : (s === 'PAID' ? 'selected' : '')}>${{PENDING:'Pending',PAID:'Paid',PARTIALLY_PAID:'Partially Paid',OVERDUE:'Overdue',CANCELLED:'Cancelled'}[s]}</option>`
        ).join('');

        modal = document.createElement('div');
        modal.id = 'invoice-modal';
        modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-[9990] flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div class="flex items-center gap-3 p-6 border-b border-gray-100">
                    <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                        <i data-lucide="file-text" class="w-5 h-5 text-[#ab8038]"></i>
                    </div>
                    <h3 class="text-lg font-bold text-gray-900">${editing ? 'Edit Invoice' : 'Create New Invoice'}</h3>
                    <button id="inv-modal-close" class="ml-auto p-1 rounded-lg hover:bg-gray-100 text-gray-400"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>
                <form id="invoice-form" class="p-6 space-y-4">
                    <div><label class="block text-xs font-bold text-gray-600 mb-1">Purchase Order (PO) Number</label>
                        <input id="inv-po" type="text" value="${inv?.poNumber || ''}" placeholder="PO-2024-001" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ab8038]/30 focus:border-[#ab8038]"></div>
                    <div><label class="block text-xs font-bold text-gray-600 mb-1">Company *</label>
                        <select id="inv-company" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ab8038]/30 bg-white">
                            <option value="">-- Select Company --</option>${companyOptions}</select></div>
                    <div><label class="block text-xs font-bold text-gray-600 mb-1">Total Amount *</label>
                        <input id="inv-amount" type="number" min="0" step="0.01" value="${inv?.amount || ''}" placeholder="0.00" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ab8038]/30 focus:border-[#ab8038]"></div>
                    <div><label class="block text-xs font-bold text-gray-600 mb-1">Payment Status</label>
                        <select id="inv-status" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ab8038]/30 bg-white">${statusOptions}</select></div>
                    <div class="flex gap-3 pt-2">
                        <button type="button" id="inv-cancel" class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button type="submit" class="flex-1 px-4 py-2.5 bg-[#ab8038] hover:bg-[#96702f] text-white rounded-xl text-sm font-bold shadow-sm transition-colors">${editing ? 'Save Changes' : 'Create Invoice'}</button>
                    </div>
                </form>
            </div>`;
        document.body.appendChild(modal);
        if (window.lucide) lucide.createIcons();

        const close = () => modal.remove();
        document.getElementById('inv-modal-close').onclick = close;
        document.getElementById('inv-cancel').onclick = close;
        modal.onclick = (e) => { if (e.target === modal) close(); };

        document.getElementById('invoice-form').onsubmit = async (e) => {
            e.preventDefault();
            const companyId = document.getElementById('inv-company').value;
            const amount = document.getElementById('inv-amount').value;
            if (!companyId) { showToast('Company must be selected', 'warning'); return; }
            if (!amount || parseFloat(amount) < 0) { showToast('A valid amount is required', 'warning'); return; }
            const data = {
                poNumber: document.getElementById('inv-po').value.trim() || null,
                companyId,
                amount: parseFloat(amount),
                paymentStatus: document.getElementById('inv-status').value
            };
            const r = editing ? await api.updateInvoice(inv.id, data) : await api.createInvoice(data);
            if (r.success) { showToast(editing ? 'Invoice updated' : 'Invoice created', 'success'); close(); await loadInvoices(); }
            else showToast(r.message || 'An error occurred', 'error');
        };
    };

    // ========== Delete Invoice ==========
    window.deleteInvoice = (id, label) => {
        showConfirm(`Are you sure you want to delete invoice "${label}"?`, async () => {
            const r = await api.deleteInvoice(id);
            if (r.success) { showToast('Invoice deleted', 'success'); await loadInvoices(); }
            else showToast(r.message || 'Deletion failed', 'error');
        });
    };

    // ========== Bind Add Invoice buttons ==========
    function bindActionButtons() {
        document.querySelectorAll("button").forEach((btn) => {
            if (btn.textContent.includes("Generate New Invoice")) {
                btn.onclick = (e) => {
                    e.preventDefault();
                    window.openInvoiceModal();
                };
            }
        });

        const addBtn = document.querySelector('[data-action="add-invoice"], .btn-add-invoice');
        if (addBtn) {
            addBtn.onclick = (e) => {
                e.preventDefault();
                window.openInvoiceModal();
            };
        }
    }

    bindActionButtons();
    setupSearch();
    setupFilters();
    setupExport();
    await loadInvoices();
});