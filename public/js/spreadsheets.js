import { api } from './api.js';

let currentSheetId = null;
let currentHeaders = [];
let currentRows = [];

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
    const ov = document.createElement('div');
    ov.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] flex items-center justify-center p-4';
    ov.innerHTML = `<div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <h3 class="font-bold text-gray-900 mb-2">تأكيد</h3>
        <p class="text-sm text-gray-600 mb-6">${msg}</p>
        <div class="flex gap-3">
            <button id="sc-cancel" class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">إلغاء</button>
            <button id="sc-ok" class="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold">تأكيد</button>
        </div></div>`;
    document.body.appendChild(ov);
    document.getElementById('sc-cancel').onclick = () => ov.remove();
    document.getElementById('sc-ok').onclick = () => { ov.remove(); cb(); };
    ov.onclick = e => { if (e.target === ov) ov.remove(); };
}

// ========== Load all sheets ==========
async function loadSheets() {
    const grid = document.getElementById('sheets-grid');
    grid.innerHTML = `<div class="col-span-full flex items-center justify-center gap-2 py-12 text-gray-400"><i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Loading sheets...</div>`;
    if (window.lucide) lucide.createIcons();

    const r = await api.getSheets();
    if (!r.success || r.sheets.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-gray-400">
            <div class="flex flex-col items-center gap-3">
                <i data-lucide="table-2" class="w-10 h-10 text-gray-300"></i>
                <p class="font-semibold">لا توجد ملفات إكسيل مرفوعة</p>
                <p class="text-xs">ارفع ملف إكسيل بأي شكل وسيظهر هنا</p>
                <button onclick="document.getElementById('upload-modal').classList.remove('hidden')" class="mt-2 px-4 py-2 bg-[#ab8038] text-white rounded-lg text-xs font-bold hover:bg-[#96702f] transition-colors">رفع ملف الآن</button>
            </div></div>`;
        if (window.lucide) lucide.createIcons();
        return;
    }

    grid.innerHTML = r.sheets.map(s => `
        <div class="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6 hover:shadow-md transition-all cursor-pointer group" onclick="openSheet('${s.id}')">
            <div class="flex items-start justify-between mb-4">
                <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <i data-lucide="table-2" class="w-6 h-6 text-emerald-600"></i>
                </div>
                <button onclick="event.stopPropagation(); deleteSheet('${s.id}', '${s.fileName.replace(/'/g,'')}')" 
                    class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-all">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
            <h3 class="font-bold text-gray-900 truncate mb-1">${s.fileName}</h3>
            <div class="flex items-center gap-3 text-xs text-gray-500">
                <span class="flex items-center gap-1"><i data-lucide="rows" class="w-3 h-3"></i> ${s.rowCount} rows</span>
                <span class="flex items-center gap-1"><i data-lucide="columns" class="w-3 h-3"></i> ${s.headers?.length || 0} columns</span>
            </div>
            <p class="text-[10px] text-gray-400 mt-3">${new Date(s.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
        </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
}

// ========== Open a specific sheet ==========
window.openSheet = async (id) => {
    const r = await api.getSheetById(id);
    if (!r.success || !r.sheet) { showToast('فشل تحميل الجدول', 'error'); return; }

    currentSheetId = id;
    currentHeaders = r.sheet.headers;
    currentRows = r.sheet.rows;

    document.getElementById('sheets-list-section').classList.add('hidden');
    const viewer = document.getElementById('sheet-viewer');
    viewer.classList.remove('hidden');
    document.getElementById('viewer-title').textContent = r.sheet.fileName;
    document.getElementById('viewer-meta').textContent = `${currentRows.length} rows · ${currentHeaders.length} columns · Uploaded ${new Date(r.sheet.createdAt).toLocaleDateString()}`;

    renderSheetTable(currentRows);
};

// ========== Render sheet table ==========
function renderSheetTable(rows) {
    const thead = document.getElementById('sheet-thead');
    const tbody = document.getElementById('sheet-tbody');

    thead.innerHTML = `<tr class="text-gray-400 text-[10px] font-extrabold uppercase tracking-widest">
        <th class="px-4 py-3 w-10">#</th>
        ${currentHeaders.map(h => `<th class="px-4 py-3 whitespace-nowrap">${h}</th>`).join('')}
        <th class="px-4 py-3 text-right">Actions</th>
    </tr>`;

    if (rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${currentHeaders.length + 2}" class="text-center py-10 text-gray-400">لا توجد صفوف. أضف صفاً جديداً.</td></tr>`;
        return;
    }

    tbody.innerHTML = rows.map((row, idx) => {
        const realIdx = currentRows.indexOf(row);
        return `<tr class="hover:bg-gray-50/60 transition-colors group" data-row-index="${realIdx}">
            <td class="px-4 py-3 text-gray-400 text-xs font-semibold">${realIdx + 1}</td>
            ${currentHeaders.map(h => `<td class="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate" title="${String(row[h] || '')}">${row[h] || '—'}</td>`).join('')}
            <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="openRowModal(${realIdx})" class="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors">
                        <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                    </button>
                    <button onclick="deleteRow(${realIdx})" class="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

// ========== Row Search ==========
document.getElementById('row-search')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = currentRows.filter(row =>
        Object.values(row).some(v => String(v || '').toLowerCase().includes(q))
    );
    renderSheetTable(filtered);
});

document.getElementById('sheet-search')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    if (currentSheetId) {
        const filtered = currentRows.filter(row =>
            Object.values(row).some(v => String(v || '').toLowerCase().includes(q))
        );
        renderSheetTable(filtered);
    }
});

// ========== Open Row Modal (Add/Edit) ==========
window.openRowModal = (rowIndex = null) => {
    const editing = rowIndex !== null;
    const rowData = editing ? currentRows[rowIndex] : {};

    let modal = document.getElementById('row-modal');
    if (modal) modal.remove();

    const fieldsHTML = currentHeaders.map(h => `
        <div>
            <label class="block text-xs font-bold text-gray-600 mb-1">${h}</label>
            <input id="rf-${h.replace(/\s+/g,'_')}" type="text" value="${String(rowData[h] || '').replace(/"/g, '&quot;')}" placeholder="${h}"
                class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ab8038]/30 focus:border-[#ab8038]">
        </div>`).join('');

    modal = document.createElement('div');
    modal.id = 'row-modal';
    modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-[9990] flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
            <div class="flex items-center gap-3 p-6 border-b border-gray-100 shrink-0">
                <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <i data-lucide="${editing ? 'pencil' : 'plus'}" class="w-5 h-5 text-[#ab8038]"></i>
                </div>
                <h3 class="text-lg font-bold text-gray-900">${editing ? 'تعديل الصف' : 'إضافة صف جديد'}</h3>
                <button id="row-modal-close" class="ml-auto p-1 rounded-lg hover:bg-gray-100 text-gray-400"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>
            <form id="row-form" class="p-6 space-y-3 overflow-y-auto flex-1">
                ${fieldsHTML}
                <div class="flex gap-3 pt-3 sticky bottom-0 bg-white pb-1">
                    <button type="button" id="row-cancel" class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">إلغاء</button>
                    <button type="submit" class="flex-1 px-4 py-2.5 bg-[#ab8038] hover:bg-[#96702f] text-white rounded-xl text-sm font-bold shadow-sm transition-colors">${editing ? 'حفظ' : 'إضافة'}</button>
                </div>
            </form>
        </div>`;
    document.body.appendChild(modal);
    if (window.lucide) lucide.createIcons();

    const close = () => modal.remove();
    document.getElementById('row-modal-close').onclick = close;
    document.getElementById('row-cancel').onclick = close;
    modal.onclick = e => { if (e.target === modal) close(); };

    document.getElementById('row-form').onsubmit = async (e) => {
        e.preventDefault();
        const newRow = {};
        currentHeaders.forEach(h => {
            newRow[h] = document.getElementById(`rf-${h.replace(/\s+/g,'_')}`)?.value || '';
        });

        let r;
        if (editing) {
            r = await api.updateSheetRow(currentSheetId, rowIndex, newRow);
            if (r.success) { currentRows[rowIndex] = newRow; showToast('تم تعديل الصف', 'success'); }
        } else {
            r = await api.addSheetRow(currentSheetId, newRow);
            if (r.success) { currentRows.push(newRow); showToast('تم إضافة الصف', 'success'); }
        }

        if (r.success) { close(); renderSheetTable(currentRows); }
        else showToast(r.message || 'حدث خطأ', 'error');
    };
};

// ========== Delete Row ==========
window.deleteRow = (rowIndex) => {
    showConfirm(`هل تريد حذف الصف رقم ${rowIndex + 1}؟`, async () => {
        const r = await api.deleteSheetRow(currentSheetId, rowIndex);
        if (r.success) {
            currentRows.splice(rowIndex, 1);
            showToast('تم حذف الصف', 'success');
            renderSheetTable(currentRows);
        } else showToast(r.message || 'فشل الحذف', 'error');
    });
};

// ========== Delete entire sheet ==========
window.deleteSheet = (id, name) => {
    showConfirm(`هل تريد حذف ملف "${name}" بالكامل؟`, async () => {
        const r = await api.deleteSheet(id);
        if (r.success) { showToast('تم حذف الملف', 'success'); await loadSheets(); }
        else showToast(r.message || 'فشل الحذف', 'error');
    });
};

// ========== Back to list ==========
document.getElementById('btn-back-to-list')?.addEventListener('click', () => {
    currentSheetId = null; currentHeaders = []; currentRows = [];
    document.getElementById('sheet-viewer').classList.add('hidden');
    document.getElementById('sheets-list-section').classList.remove('hidden');
    loadSheets();
});

// ========== Add Row button ==========
document.getElementById('btn-add-row')?.addEventListener('click', () => window.openRowModal());

// ========== Upload Modal ==========
const uploadModal = document.getElementById('upload-modal');
document.getElementById('btn-upload-new')?.addEventListener('click', () => uploadModal.classList.remove('hidden'));
document.getElementById('btn-close-upload')?.addEventListener('click', () => uploadModal.classList.add('hidden'));
document.getElementById('btn-cancel-modal')?.addEventListener('click', () => uploadModal.classList.add('hidden'));
uploadModal?.addEventListener('click', e => { if (e.target === uploadModal) uploadModal.classList.add('hidden'); });

const fileInput = document.getElementById('excel-file-input');
const selectedName = document.getElementById('selected-file-name');
const statusDiv = document.getElementById('upload-status');

fileInput?.addEventListener('change', e => {
    const f = e.target.files[0];
    if (f && selectedName) { selectedName.classList.remove('hidden'); selectedName.querySelector('span').textContent = f.name; }
});

document.getElementById('modal-upload-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = fileInput?.files[0];
    if (!file) { statusDiv.className = 'text-xs p-3 rounded-lg text-center font-semibold bg-amber-50 text-amber-700 border border-amber-100'; statusDiv.classList.remove('hidden'); statusDiv.textContent = '⚠️ الرجاء اختيار ملف'; return; }
    statusDiv.className = 'text-xs p-3 rounded-lg text-center font-semibold bg-blue-50 text-blue-700 border border-blue-100'; statusDiv.classList.remove('hidden'); statusDiv.textContent = '⏳ جارٍ الرفع والمعالجة...';
    const r = await api.uploadExcel(file);
    if (r.success) {
        statusDiv.className = 'text-xs p-3 rounded-lg text-center font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100';
        statusDiv.textContent = `✅ ${r.message}`;
        setTimeout(() => { uploadModal.classList.add('hidden'); loadSheets(); }, 1800);
    } else {
        statusDiv.className = 'text-xs p-3 rounded-lg text-center font-semibold bg-rose-50 text-rose-700 border border-rose-100';
        statusDiv.textContent = `❌ ${r.message || 'حدث خطأ'}`;
    }
});

// ========== Init ==========
loadSheets();
if (window.lucide) lucide.createIcons();
