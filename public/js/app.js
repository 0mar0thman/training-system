import { api } from './api.js';
import { ui } from './ui.js';

document.addEventListener("DOMContentLoaded", () => {

    // ========== Page Detection ==========
    const path = window.location.pathname;
    const isClients = path === '/' || path === '/clients' || !!document.getElementById('companies-table-body');
    const isTrainees = path === '/trainees' || !!document.getElementById('trainees-table-body');
    const isCourses = path === '/courses' || !!document.getElementById('courses-grid');
    const isCertificates = path === '/certificates' || !!document.getElementById('certificates-table-body');

    // ========== Clients Page ==========
    async function initClients() {
        const stats = await api.getDashboardStats();
        if (stats.success) ui.updateDashboardStats(stats.stats);
        await loadCompanies();
        setupExcelUpload();
        setupCompanyCRUD();

        const tableSearch = document.getElementById('table-search');
        if (tableSearch) {
            tableSearch.addEventListener('input', () => {
                const q = tableSearch.value.toLowerCase();
                document.querySelectorAll('#companies-table-body tr').forEach(tr => {
                    tr.style.display = tr.innerText.toLowerCase().includes(q) ? '' : 'none';
                });
            });
        }
    }

    async function loadCompanies() {
        const r = await api.getCompanies();
        if (r.success) ui.renderCompaniesTable(r.companies);
    }

    function setupCompanyCRUD() {
        const addBtn = document.getElementById('btn-add-company');
        if (addBtn) addBtn.onclick = () => window.openCompanyModal();

        window.openCompanyModal = (company = null) => {
            const editing = !!company;
            if (typeof company === 'string') company = JSON.parse(company.replace(/&quot;/g, '"'));
            openModal({
                title: editing ? 'تعديل الشركة' : 'إضافة شركة جديدة',
                icon: 'building-2',
                fields: [
                    { id: 'c-name', label: 'اسم الشركة *', type: 'text', value: company?.name || '', required: true, placeholder: 'اسم الشركة' },
                    { id: 'c-contact', label: 'الشخص المسؤول', type: 'text', value: company?.contactPerson || '', placeholder: 'اسم المسؤول' },
                    { id: 'c-email', label: 'البريد الإلكتروني', type: 'email', value: company?.email || '', placeholder: 'email@example.com' },
                    { id: 'c-phone', label: 'رقم الهاتف', type: 'text', value: company?.phone || '', placeholder: '+966...' },
                    { id: 'c-address', label: 'العنوان', type: 'text', value: company?.address || '', placeholder: 'عنوان الشركة' },
                ],
                submitLabel: editing ? 'حفظ التغييرات' : 'إضافة الشركة',
                onSubmit: async () => {
                    const name = document.getElementById('c-name').value.trim();
                    if (!name) { ui.showToast('اسم الشركة مطلوب', 'warning'); return false; }
                    const data = {
                        name,
                        contactPerson: document.getElementById('c-contact').value.trim() || null,
                        email: document.getElementById('c-email').value.trim() || null,
                        phone: document.getElementById('c-phone').value.trim() || null,
                        address: document.getElementById('c-address').value.trim() || null,
                    };
                    const r = editing ? await api.updateCompany(company.id, data) : await api.createCompany(data);
                    if (r.success) {
                        ui.showToast(editing ? 'تم تعديل الشركة بنجاح' : 'تم إضافة الشركة بنجاح', 'success');
                        await loadCompanies();
                        return true;
                    } else { ui.showToast(r.message || 'حدث خطأ', 'error'); return false; }
                }
            });
        };

        window.deleteCompany = (id, name) => {
            ui.showConfirm(`هل تريد حذف شركة "${name}"؟ سيؤدي ذلك لحذف جميع البيانات المرتبطة بها.`, async () => {
                const r = await api.deleteCompany(id);
                if (r.success) { ui.showToast('تم حذف الشركة', 'success'); await loadCompanies(); }
                else ui.showToast(r.message || 'فشل الحذف', 'error');
            });
        };

        // ===== دالة إضافة فاتورة للشركة من صفحة العملاء =====
        window.openInvoiceModalForCompany = (companyRaw) => {
            let company = null;
            try {
                company = typeof companyRaw === 'string' ? JSON.parse(companyRaw.replace(/&quot;/g, '"')) : companyRaw;
            } catch (e) {}
            if (!company) {
                ui.showToast('Company data not found.', 'error');
                return;
            }

            let modal = document.getElementById('company-invoice-modal');
            if (modal) modal.remove();

            modal = document.createElement('div');
            modal.id = 'company-invoice-modal';
            modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-[9990] flex items-center justify-center p-4';
            modal.innerHTML = `
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                    <div class="flex items-center gap-3 p-6 border-b border-gray-100">
                        <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <i data-lucide="file-plus" class="w-5 h-5 text-emerald-600"></i>
                        </div>
                        <h3 class="text-lg font-bold text-gray-900">Add Invoice for ${company.name}</h3>
                        <button id="comp-inv-modal-close" class="ml-auto p-1 rounded-lg hover:bg-gray-100 text-gray-400"><i data-lucide="x" class="w-5 h-5"></i></button>
                    </div>
                    <form id="company-invoice-form" class="p-6 space-y-4">
                        <div><label class="block text-xs font-bold text-gray-600 mb-1">Invoice Number (PO)</label>
                            <input id="comp-inv-po" type="text" placeholder="PO-2024-001" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"></div>
                        <div><label class="block text-xs font-bold text-gray-600 mb-1">Invoice Amount *</label>
                            <input id="comp-inv-amount" type="number" min="0" step="0.01" required placeholder="0.00" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"></div>
                        <div><label class="block text-xs font-bold text-gray-600 mb-1">Invoice Date *</label>
                            <input id="comp-inv-date" type="date" value="${new Date().toISOString().split('T')[0]}" required class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"></div>
                        <div class="flex gap-3 pt-2">
                            <button type="button" id="comp-inv-cancel" class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button type="submit" class="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors">Save Invoice</button>
                        </div>
                    </form>
                </div>`;
            document.body.appendChild(modal);
            if (window.lucide) lucide.createIcons();

            const close = () => modal.remove();
            document.getElementById('comp-inv-modal-close').onclick = close;
            document.getElementById('comp-inv-cancel').onclick = close;
            modal.onclick = (e) => { if (e.target === modal) close(); };

            document.getElementById('company-invoice-form').onsubmit = async (e) => {
                e.preventDefault();
                const data = {
                    poNumber: document.getElementById('comp-inv-po').value.trim() || null,
                    amount: parseFloat(document.getElementById('comp-inv-amount').value),
                    issuedAt: new Date(document.getElementById('comp-inv-date').value).toISOString(),
                    companyId: company.id,
                    paymentStatus: 'PENDING',
                };
                if (!data.amount || !data.issuedAt) {
                    ui.showToast('Amount and Invoice Date are required fields', 'warning');
                    return;
                }
                const r = await api.createInvoice(data);
                if (r.success) {
                    ui.showToast('Invoice created successfully', 'success');
                    close();
                } else ui.showToast(r.message || 'An error occurred', 'error');
            };
        };
    }

    // ========== Trainees Page ==========
    async function initTrainees() {
        const stats = await api.getDashboardStats();
        if (stats.success) ui.updateTraineesStats(stats.stats);
        const companies = await api.getCompanies();
        window._companiesList = companies.success ? companies.companies : [];
        await loadTrainees();
        setupTraineeCRUD();

        const tableSearch = document.getElementById('table-search');
        if (tableSearch) {
            tableSearch.addEventListener('input', () => {
                const q = tableSearch.value.toLowerCase();
                document.querySelectorAll('#trainees-table-body tr').forEach(tr => {
                    tr.style.display = tr.innerText.toLowerCase().includes(q) ? '' : 'none';
                });
            });
        }
    }

    async function loadTrainees() {
        const r = await api.getTrainees();
        if (r.success) ui.renderTraineesTable(r.trainees);
    }

    function setupTraineeCRUD() {
        const addBtn = document.getElementById('btn-add-trainee');
        if (addBtn) addBtn.onclick = () => window.openTraineeModal();

        window.openTraineeModal = (traineeRaw = null) => {
            let trainee = null;
            if (traineeRaw) {
                try { trainee = typeof traineeRaw === 'string' ? JSON.parse(traineeRaw.replace(/&quot;/g, '"')) : traineeRaw; }
                catch (e) { trainee = null; }
            }
            const editing = !!trainee;
            const companyOptions = (window._companiesList || []).map(c =>
                `<option value="${c.id}" ${trainee?.companyId === c.id ? 'selected' : ''}>${c.name}</option>`
            ).join('');

            openModal({
                title: editing ? 'تعديل بيانات المتدرب' : 'إضافة متدرب جديد',
                icon: 'user-plus',
                fields: [
                    { id: 't-name', label: 'الاسم الكامل *', type: 'text', value: trainee?.fullName || '', required: true, placeholder: 'الاسم الكامل' },
                    { id: 't-idno', label: 'رقم الهوية', type: 'text', value: trainee?.idNo || '', placeholder: 'رقم الهوية الوطنية' },
                    { id: 't-email', label: 'البريد الإلكتروني', type: 'email', value: trainee?.email || '', placeholder: 'email@example.com' },
                    { id: 't-phone', label: 'رقم الهاتف', type: 'text', value: trainee?.phone || '', placeholder: '+966...' },
                    { id: 't-company', label: 'الشركة *', type: 'select', options: companyOptions, required: true },
                ],
                submitLabel: editing ? 'حفظ التغييرات' : 'إضافة المتدرب',
                onSubmit: async () => {
                    const fullName = document.getElementById('t-name').value.trim();
                    const companyId = document.getElementById('t-company').value;
                    if (!fullName) { ui.showToast('الاسم الكامل مطلوب', 'warning'); return false; }
                    if (!companyId) { ui.showToast('يجب اختيار الشركة', 'warning'); return false; }
                    const data = {
                        fullName,
                        idNo: document.getElementById('t-idno').value.trim() || null,
                        email: document.getElementById('t-email').value.trim() || null,
                        phone: document.getElementById('t-phone').value.trim() || null,
                        companyId
                    };
                    const r = editing ? await api.updateTrainee(trainee.id, data) : await api.createTrainee(data);
                    if (r.success) {
                        ui.showToast(editing ? 'تم تعديل المتدرب' : 'تم إضافة المتدرب', 'success');
                        await loadTrainees(); return true;
                    } else { ui.showToast(r.message || 'حدث خطأ', 'error'); return false; }
                }
            });
        };

        window.deleteTrainee = (id, name) => {
            ui.showConfirm(`هل تريد حذف المتدرب "${name}"؟`, async () => {
                const r = await api.deleteTrainee(id);
                if (r.success) { ui.showToast('تم حذف المتدرب', 'success'); await loadTrainees(); }
                else ui.showToast(r.message || 'فشل الحذف', 'error');
            });
        };
    }

    // ========== Courses Page ==========
    async function initCourses() {
        const stats = await api.getCourseStats();
        if (stats.success) ui.updateCourseStats(stats.stats);
        const companies = await api.getCompanies();
        window._companiesList = companies.success ? companies.companies : [];
        await loadCourses();
        setupCourseCRUD();
    }

    async function loadCourses() {
        const r = await api.getCourses();
        if (r.success) ui.renderCoursesGrid(r.courses);
    }

    function setupCourseCRUD() {
        const addBtn = document.getElementById('btn-add-course');
        if (addBtn) addBtn.onclick = () => window.openCourseModal();

        window.openCourseModal = (courseRaw = null) => {
            let course = null;
            if (courseRaw) {
                try { course = typeof courseRaw === 'string' ? JSON.parse(courseRaw.replace(/&quot;/g, '"')) : courseRaw; }
                catch (e) { course = null; }
            }
            const editing = !!course;
            const companyOptions = (window._companiesList || []).map(c =>
                `<option value="${c.id}" ${course?.companyId === c.id ? 'selected' : ''}>${c.name}</option>`
            ).join('');
            const startDateVal = course?.startDate ? new Date(course.startDate).toISOString().split('T')[0] : '';

            openModal({
                title: editing ? 'تعديل الكورس' : 'إضافة كورس جديد',
                icon: 'graduation-cap',
                fields: [
                    { id: 'co-name', label: 'اسم الكورس *', type: 'text', value: course?.courseName || '', required: true, placeholder: 'اسم الكورس' },
                    { id: 'co-event', label: 'اسم الحدث', type: 'text', value: course?.eventName || '', placeholder: 'اسم الحدث' },
                    { id: 'co-company', label: 'الشركة *', type: 'select', options: companyOptions, required: true },
                    { id: 'co-date', label: 'تاريخ البدء *', type: 'date', value: startDateVal, required: true },
                    { id: 'co-venue', label: 'المكان', type: 'text', value: course?.venue || '', placeholder: 'مكان الكورس' },
                ],
                submitLabel: editing ? 'حفظ التغييرات' : 'إضافة الكورس',
                onSubmit: async () => {
                    const courseName = document.getElementById('co-name').value.trim();
                    const companyId = document.getElementById('co-company').value;
                    const startDate = document.getElementById('co-date').value;
                    if (!courseName) { ui.showToast('اسم الكورس مطلوب', 'warning'); return false; }
                    if (!companyId) { ui.showToast('يجب اختيار الشركة', 'warning'); return false; }
                    if (!startDate) { ui.showToast('تاريخ البدء مطلوب', 'warning'); return false; }
                    const data = {
                        courseName,
                        eventName: document.getElementById('co-event').value.trim() || courseName,
                        companyId,
                        startDate: new Date(startDate).toISOString(),
                        venue: document.getElementById('co-venue').value.trim() || null,
                    };
                    const r = editing ? await api.updateCourse(course.id, data) : await api.createCourse(data);
                    if (r.success) {
                        ui.showToast(editing ? 'تم تعديل الكورس' : 'تم إضافة الكورس', 'success');
                        await loadCourses(); return true;
                    } else { ui.showToast(r.message || 'حدث خطأ', 'error'); return false; }
                }
            });
        };

        window.deleteCourse = (id, name) => {
            ui.showConfirm(`هل تريد حذف كورس "${name}"؟`, async () => {
                const r = await api.deleteCourse(id);
                if (r.success) { ui.showToast('تم حذف الكورس', 'success'); await loadCourses(); }
                else ui.showToast(r.message || 'فشل الحذف', 'error');
            });
        };
    }

    // ========== Generic Modal Builder ==========
    function openModal({ title, icon, fields, submitLabel, onSubmit }) {
        let modal = document.getElementById('generic-modal');
        if (modal) modal.remove();

        const fieldsHTML = fields.map(f => {
            if (f.type === 'select') {
                return `<div><label class="block text-xs font-bold text-gray-600 mb-1">${f.label}</label>
                    <select id="${f.id}" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ab8038]/30 focus:border-[#ab8038] bg-white">
                        <option value="">-- اختر --</option>${f.options}
                    </select></div>`;
            }
            return `<div><label class="block text-xs font-bold text-gray-600 mb-1">${f.label}</label>
                <input id="${f.id}" type="${f.type}" value="${f.value || ''}" placeholder="${f.placeholder || ''}" ${f.required ? 'required' : ''}
                    class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ab8038]/30 focus:border-[#ab8038] transition-all"></div>`;
        }).join('');

        modal = document.createElement('div');
        modal.id = 'generic-modal';
        modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-[9990] flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div class="flex items-center gap-3 p-6 border-b border-gray-100">
                    <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                        <i data-lucide="${icon}" class="w-5 h-5 text-[#ab8038]"></i>
                    </div>
                    <h3 class="text-lg font-bold text-gray-900">${title}</h3>
                    <button id="modal-close-x" class="ml-auto p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>
                <form id="generic-modal-form" class="p-6 space-y-4">
                    ${fieldsHTML}
                    <div id="modal-err" class="hidden text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-lg border border-rose-100"></div>
                    <div class="flex gap-3 pt-2">
                        <button type="button" id="modal-cancel" class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">إلغاء</button>
                        <button type="submit" id="modal-submit" class="flex-1 px-4 py-2.5 bg-[#ab8038] hover:bg-[#96702f] text-white rounded-xl text-sm font-bold shadow-sm transition-colors">${submitLabel}</button>
                    </div>
                </form>
            </div>`;
        document.body.appendChild(modal);
        if (window.lucide) lucide.createIcons();

        const close = () => modal.remove();
        document.getElementById('modal-close-x').onclick = close;
        document.getElementById('modal-cancel').onclick = close;
        modal.onclick = (e) => { if (e.target === modal) close(); };

        document.getElementById('generic-modal-form').onsubmit = async (e) => {
            e.preventDefault();
            const btn = document.getElementById('modal-submit');
            btn.disabled = true;
            btn.textContent = 'جارٍ الحفظ...';
            const ok = await onSubmit();
            if (ok) { close(); }
            else { btn.disabled = false; btn.textContent = submitLabel; }
        };
    }

    // ========== Excel Upload Modal ==========
    function setupExcelUpload() {
        const btnOpen = document.getElementById('btn-open-upload');
        const modal = document.getElementById('upload-modal');
        const btnClose = document.getElementById('btn-close-upload');
        const btnCancel = document.getElementById('btn-cancel-modal');
        const form = document.getElementById('modal-upload-form');
        const fileInput = document.getElementById('excel-file-input');
        const selectedName = document.getElementById('selected-file-name');
        const status = document.getElementById('upload-status');

        if (!btnOpen || !modal) return;

        btnOpen.onclick = () => { modal.classList.remove('hidden'); if (status) status.classList.add('hidden'); };
        const close = () => modal.classList.add('hidden');
        if (btnClose) btnClose.onclick = close;
        if (btnCancel) btnCancel.onclick = close;
        modal.onclick = (e) => { if (e.target === modal) close(); };

        if (fileInput) {
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file && selectedName) {
                    selectedName.classList.remove('hidden');
                    selectedName.querySelector('span').textContent = file.name;
                }
            };
        }

        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const file = fileInput?.files[0];
                if (!file) {
                    if (status) { status.className = 'text-xs p-3 rounded-lg text-center font-semibold bg-amber-50 text-amber-700 border border-amber-100'; status.classList.remove('hidden'); status.textContent = '⚠️ Please select an Excel file first.'; }
                    return;
                }
                if (status) { status.className = 'text-xs p-3 rounded-lg text-center font-semibold bg-blue-50 text-blue-700 border border-blue-100'; status.classList.remove('hidden'); status.textContent = '⏳ Uploading and processing...'; }
                const result = await api.uploadExcel(file);
                if (result.success) {
                    if (status) { status.className = 'text-xs p-3 rounded-lg text-center font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100'; status.textContent = `✅ ${result.message}`; }
                    setTimeout(() => { close(); window.location.reload(); }, 2000);
                } else {
                    if (status) { status.className = 'text-xs p-3 rounded-lg text-center font-semibold bg-rose-50 text-rose-700 border border-rose-100'; status.textContent = `❌ ${result.message || 'Unknown error'}`; }
                }
            };
        }
    }

    // ========== Certificates Page ==========
    async function initCertificates() {
        const r = await api.getTrainees();

        if (r.success) {
            ui.renderCertificatesTable(r.trainees);

            const searchInput = document.getElementById('certificates-search');
            if (searchInput) {
                searchInput.addEventListener('input', () => {
                    const q = searchInput.value.toLowerCase().trim();
                    const filtered = r.trainees.filter(t => {
                        const name = (t.fullName || "").toLowerCase();
                        const idNo = (t.idNo || "").toLowerCase();
                        const company = (t.companyName || "").toLowerCase();
                        const course = (t.courseName || "").toLowerCase();
                        return name.includes(q) || idNo.includes(q) || company.includes(q) || course.includes(q);
                    });
                    ui.renderCertificatesTable(filtered);
                });
            }
        }

        // ===== دالة توليد وطباعة الشهادة =====
        window.downloadSingleCert = async function(traineeId, traineeName) {
            try {
                ui.showToast(`⏳ جاري توليد الشهادة للمتدرب: ${traineeName}...`, 'info');

                const trainee = r.trainees.find(t => t.id === traineeId);
                if (!trainee) {
                    ui.showToast('لم يتم العثور على بيانات المتدرب', 'error');
                    return;
                }

                const existingPdfBytes = await fetch('/assets/Mas_Certificate.pdf').then(res => res.arrayBuffer());

                const { PDFDocument, rgb } = window.PDFLib;
                const pdfDoc = await PDFDocument.load(existingPdfBytes);
                const pages = pdfDoc.getPages();
                const firstPage = pages[0];

                const { height } = firstPage.getSize();
                const textColor = rgb(0.2, 0.2, 0.2);

                firstPage.drawText(traineeName, {
                    x: 350,
                    y: height - 300,
                    size: 24,
                    color: textColor
                });

                firstPage.drawText(trainee.courseName || 'N/A', {
                    x: 350,
                    y: height - 380,
                    size: 18,
                    color: textColor
                });

                const displayDate = trainee.createdAt ? new Date(trainee.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
                firstPage.drawText(displayDate, {
                    x: 200,
                    y: height - 480,
                    size: 14,
                    color: textColor
                });

                const certNum = trainee.idNo ? `MAS-${trainee.idNo}` : `MAS-${trainee.id.substring(0,6)}`;
                firstPage.drawText(certNum, {
                    x: 550,
                    y: height - 480,
                    size: 14,
                    color: textColor
                });

                const pdfBytes = await pdfDoc.save();
                const blob = new Blob([pdfBytes], { type: "application/pdf" });
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = `MAS_Certificate_${traineeName}.pdf`;
                link.click();

                ui.showToast('✅ تم تنزيل الشهادة بنجاح!', 'success');

            } catch (error) {
                console.error("Error generating PDF:", error);
                ui.showToast('❌ حدث خطأ أثناء توليد الشهادة', 'error');
            }
        };
    }

    // ========== Init ==========
    if (isClients) initClients();
    else if (isTrainees) initTrainees();
    else if (isCourses) initCourses();
    else if (isCertificates) initCertificates();
    else {
        if (document.getElementById('stat-total-companies')) initClients();
        else if (document.getElementById('stat-total-trainees')) initTrainees();
        else if (document.getElementById('stat-ongoing-courses')) initCourses();
    }

    if (window.lucide) lucide.createIcons();
});