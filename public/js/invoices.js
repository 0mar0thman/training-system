import { api } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('invoices-table-body');
    if (!tbody) return;

    let invoicesList = [];
    let companiesList = [];

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
            <h3 class="font-bold text-gray-900 mb-2">تأكيد الحذف</h3>
            <p class="text-sm text-gray-600 mb-6">${msg}</p>
            <div class="flex gap-3">
                <button id="cv-cancel" class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">إلغاء</button>
                <button id="cv-ok" class="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold">حذف</button>
            </div></div>`;
        document.body.appendChild(ov);
        document.getElementById('cv-cancel').onclick = () => ov.remove();
        document.getElementById('cv-ok').onclick = () => { ov.remove(); cb(); };
        ov.onclick = (e) => { if (e.target === ov) ov.remove(); };
    }

    // ========== Load Invoices ==========
    async function loadInvoices() {
        const result = await api.getInvoices();
        if (result.success) { invoicesList = result.invoices; renderTable(invoicesList); }
        else tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-rose-500">حدث خطأ أثناء تحميل الفواتير.</td></tr>`;
    }

    // ========== Render Table ==========
    function renderTable(data) {
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center py-12 text-gray-400">
                <div class="flex flex-col items-center gap-2">
                    <i data-lucide="file-text" class="w-8 h-8 text-gray-300"></i>
                    <span>لا توجد فواتير مسجلة حالياً</span>
                </div></td></tr>`;
            if (window.lucide) lucide.createIcons();
            return;
        }

        tbody.innerHTML = data.map(inv => {
            const badgeMap = {
                'PAID': 'bg-emerald-50 text-emerald-600 border-emerald-100',
                'PENDING': 'bg-gray-100 text-gray-600 border-gray-200',
                'PARTIALLY_PAID': 'bg-amber-50 text-amber-600 border-amber-100',
                'OVERDUE': 'bg-rose-50 text-rose-600 border-rose-100',
                'CANCELLED': 'bg-gray-100 text-gray-400 border-gray-200'
            };
            const labelMap = { PAID: 'مدفوعة', PENDING: 'معلقة', PARTIALLY_PAID: 'مدفوعة جزئياً', OVERDUE: 'متأخرة', CANCELLED: 'ملغاة' };
            const badge = badgeMap[inv.paymentStatus] || 'bg-gray-100 text-gray-500';
            const label = labelMap[inv.paymentStatus] || inv.paymentStatus;
            const date = new Date(inv.issuedAt).toLocaleDateString('ar-SA');
            const amount = new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(inv.amount);
            return `
                <tr class="hover:bg-gray-50/50 transition-colors group">
                    <td class="px-6 py-4 text-sm font-bold text-gray-900">${inv.poNumber || 'بدون رقم'}</td>
                    <td class="px-6 py-4">
                        <p class="font-bold text-gray-900 leading-tight">${inv.company?.name || 'N/A'}</p>
                        <p class="text-[11px] text-gray-500">${inv.course ? inv.course.courseName : 'طلب عام'}</p>
                    </td>
                    <td class="px-6 py-4 text-gray-500 text-sm">${date}</td>
                    <td class="px-6 py-4 text-gray-400 text-sm">—</td>
                    <td class="px-6 py-4 font-bold text-gray-900">${amount}</td>
                    <td class="px-6 py-4 font-bold text-gray-900">${amount}</td>
                    <td class="px-6 py-4">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border ${badge}">${label}</span>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onclick="window.openInvoiceModal(${JSON.stringify(inv).replace(/"/g, '&quot;')})" title="تعديل" class="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors">
                                <i data-lucide="pencil" class="w-4 h-4"></i>
                            </button>
                            <button onclick="window.deleteInvoice('${inv.id}', '${(inv.poNumber || 'هذه الفاتورة').replace(/'/g, '')}')" title="حذف" class="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
        }).join('');
        if (window.lucide) lucide.createIcons();
    }

    // ========== Open Modal ==========
    window.openInvoiceModal = (invRaw = null) => {
        let inv = null;
        if (invRaw) { try { inv = typeof invRaw === 'string' ? JSON.parse(invRaw.replace(/&quot;/g, '"')) : invRaw; } catch(e) {} }
        const editing = !!inv;
        let modal = document.getElementById('invoice-modal');
        if (modal) modal.remove();

        const companyOptions = companiesList.map(c =>
            `<option value="${c.id}" ${inv?.companyId === c.id ? 'selected' : ''}>${c.name}</option>`
        ).join('');
        const statusOptions = ['PENDING','PAID','PARTIALLY_PAID','OVERDUE','CANCELLED'].map(s =>
            `<option value="${s}" ${inv?.paymentStatus === s ? 'selected' : ''}>${{PENDING:'معلقة',PAID:'مدفوعة',PARTIALLY_PAID:'مدفوعة جزئياً',OVERDUE:'متأخرة',CANCELLED:'ملغاة'}[s]}</option>`
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
                    <h3 class="text-lg font-bold text-gray-900">${editing ? 'تعديل الفاتورة' : 'إنشاء فاتورة جديدة'}</h3>
                    <button id="inv-modal-close" class="ml-auto p-1 rounded-lg hover:bg-gray-100 text-gray-400"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>
                <form id="invoice-form" class="p-6 space-y-4">
                    <div><label class="block text-xs font-bold text-gray-600 mb-1">رقم أمر الشراء (PO)</label>
                        <input id="inv-po" type="text" value="${inv?.poNumber || ''}" placeholder="PO-2024-001" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ab8038]/30 focus:border-[#ab8038]"></div>
                    <div><label class="block text-xs font-bold text-gray-600 mb-1">الشركة *</label>
                        <select id="inv-company" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ab8038]/30 bg-white">
                            <option value="">-- اختر الشركة --</option>${companyOptions}</select></div>
                    <div><label class="block text-xs font-bold text-gray-600 mb-1">المبلغ الإجمالي *</label>
                        <input id="inv-amount" type="number" min="0" step="0.01" value="${inv?.amount || ''}" placeholder="0.00" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ab8038]/30 focus:border-[#ab8038]"></div>
                    <div><label class="block text-xs font-bold text-gray-600 mb-1">حالة الدفع</label>
                        <select id="inv-status" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ab8038]/30 bg-white">${statusOptions}</select></div>
                    <div class="flex gap-3 pt-2">
                        <button type="button" id="inv-cancel" class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">إلغاء</button>
                        <button type="submit" class="flex-1 px-4 py-2.5 bg-[#ab8038] hover:bg-[#96702f] text-white rounded-xl text-sm font-bold shadow-sm transition-colors">${editing ? 'حفظ التغييرات' : 'إنشاء الفاتورة'}</button>
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
            if (!companyId) { showToast('يجب اختيار الشركة', 'warning'); return; }
            if (!amount || parseFloat(amount) < 0) { showToast('يجب إدخال مبلغ صحيح', 'warning'); return; }
            const data = {
                poNumber: document.getElementById('inv-po').value.trim() || null,
                companyId,
                amount: parseFloat(amount),
                paymentStatus: document.getElementById('inv-status').value
            };
            const r = editing ? await api.updateInvoice(inv.id, data) : await api.createInvoice(data);
            if (r.success) { showToast(editing ? 'تم تعديل الفاتورة' : 'تم إنشاء الفاتورة', 'success'); close(); await loadInvoices(); }
            else showToast(r.message || 'حدث خطأ', 'error');
        };
    };

    // ========== Delete Invoice ==========
    window.deleteInvoice = (id, label) => {
        showConfirm(`هل تريد حذف الفاتورة "${label}"؟`, async () => {
            const r = await api.deleteInvoice(id);
            if (r.success) { showToast('تم حذف الفاتورة', 'success'); await loadInvoices(); }
            else showToast(r.message || 'فشل الحذف', 'error');
        });
    };

    // ========== Add Invoice button ==========
    const addBtn = document.querySelector('[data-action="add-invoice"], .btn-add-invoice');
    if (addBtn) addBtn.onclick = () => window.openInvoiceModal();

    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Generate New Invoice')) {
            btn.onclick = () => window.openInvoiceModal();
        }
    });

    await loadInvoices();
});