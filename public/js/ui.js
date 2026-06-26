import { api } from './api.js';

// ========== Notification System ==========
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col gap-2';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const colors = {
        success: 'bg-emerald-600 text-white',
        error: 'bg-rose-600 text-white',
        warning: 'bg-amber-500 text-white',
        info: 'bg-blue-600 text-white'
    };
    const icons = {
        success: 'check-circle',
        error: 'x-circle',
        warning: 'alert-triangle',
        info: 'info'
    };

    toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold ${colors[type]} transition-all duration-300 translate-y-4 opacity-0`;
    toast.innerHTML = `<i data-lucide="${icons[type]}" class="w-4 h-4 shrink-0"></i><span>${message}</span>`;
    container.appendChild(toast);

    if (window.lucide) lucide.createIcons();

    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
    });

    setTimeout(() => {
        toast.classList.add('translate-y-4', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ========== Confirm Dialog ==========
function showConfirm(message, onConfirm) {
    let overlay = document.getElementById('confirm-overlay');
    if (overlay) overlay.remove();

    overlay = document.createElement('div');
    overlay.id = 'confirm-overlay';
    overlay.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] flex items-center justify-center p-4';
    overlay.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                    <i data-lucide="alert-triangle" class="w-5 h-5 text-rose-500"></i>
                </div>
                <div>
                    <h3 class="font-bold text-gray-900">تأكيد الحذف</h3>
                    <p class="text-xs text-gray-500">هذا الإجراء لا يمكن التراجع عنه</p>
                </div>
            </div>
            <p class="text-sm text-gray-700 mb-6">${message}</p>
            <div class="flex gap-3">
                <button id="confirm-cancel" class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">إلغاء</button>
                <button id="confirm-ok" class="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm">حذف</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    if (window.lucide) lucide.createIcons();

    document.getElementById('confirm-cancel').onclick = () => overlay.remove();
    document.getElementById('confirm-ok').onclick = () => { overlay.remove(); onConfirm(); };
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

export const ui = {
    showToast,
    showConfirm,

    // ========== Pagination Renderer ==========
    renderPagination({ containerId, currentPage, totalItems, itemsPerPage, onPageClick }) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);

        if (totalPages <= 1) {
            container.innerHTML = `<span class="text-gray-500">Showing ${totalItems} entries</span>`;
            return;
        }

        let paginationHTML = `
            <span class="text-gray-500">Showing ${startItem} to ${endItem} of ${totalItems} entries</span>
            <div class="flex gap-1">
        `;

        paginationHTML += `
            <button data-page="${currentPage - 1}" class="page-btn px-3 py-1.5 border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50 font-medium ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}" ${currentPage === 1 ? 'disabled' : ''}>
                Previous
            </button>
        `;

        const pageNumbers = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
        } else {
            pageNumbers.push(1);
            if (currentPage > 3) pageNumbers.push('...');
            
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 3) end = 4;
            if (currentPage >= totalPages - 2) start = totalPages - 3;

            for (let i = start; i <= end; i++) pageNumbers.push(i);

            if (currentPage < totalPages - 2) pageNumbers.push('...');
            pageNumbers.push(totalPages);
        }

        pageNumbers.forEach(num => {
            if (num === '...') {
                paginationHTML += `<span class="px-3 py-1.5 text-gray-400">...</span>`;
            } else {
                paginationHTML += `
                    <button data-page="${num}" class="page-btn px-3 py-1.5 border ${num === currentPage ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-700 hover:bg-gray-50'} rounded-md font-medium">
                        ${num}
                    </button>
                `;
            }
        });

        paginationHTML += `
            <button data-page="${currentPage + 1}" class="page-btn px-3 py-1.5 border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50 font-medium ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}" ${currentPage === totalPages ? 'disabled' : ''}>
                Next
            </button>
        `;

        paginationHTML += `</div>`;
        container.innerHTML = paginationHTML;

        container.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', () => onPageClick(parseInt(btn.dataset.page)));
        });
    },

    // ========== Dashboard Stats ==========
    updateDashboardStats(stats) {
        if (!stats) return;
        const elements = {
            'stat-total-companies': stats.companies,
            'stat-active-courses': stats.courses,
            'stat-total-trainees': stats.trainees
        };
        for (const [id, value] of Object.entries(elements)) {
            const el = document.getElementById(id);
            if (el) el.innerText = value || 0;
        }
    },

    updateTraineesStats(stats) {
        if (!stats) return;
        const elements = {
            'stat-total-trainees': stats.trainees,
            'stat-active-courses': stats.courses,
            'stat-pending-certificates': stats.pendingCertificates || 0,
            'stat-unpaid-invoices': stats.pendingInvoices || 0
        };
        for (const [id, value] of Object.entries(elements)) {
            const el = document.getElementById(id);
            if (el) el.innerText = value || 0;
        }
    },

    // ========== Companies Table ==========
    renderCompaniesTable(companies) {
        const tbody = document.getElementById('companies-table-body');
        if (!tbody) return;

        if (!companies || companies.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-12 text-gray-400 text-sm">
                        <div class="flex flex-col items-center gap-2">
                            <i data-lucide="building-2" class="w-8 h-8 text-gray-300"></i>
                            <span>No companies registered yet.</span>
                            <button onclick="window.openCompanyModal()" class="mt-2 px-4 py-2 bg-[#ab8038] text-white rounded-lg text-xs font-bold hover:bg-[#96702f] transition-colors">+ Add Company</button>
                        </div>
                    </td>
                </tr>
            `;
            if (window.lucide) lucide.createIcons();
            return;
        }

        tbody.innerHTML = companies.map(c => `
            <tr class="hover:bg-gray-50/80 transition-colors group">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-[#ab8038]/10 flex items-center justify-center shrink-0">
                            <span class="text-[#ab8038] font-bold text-xs">${(c.name || 'N')[0].toUpperCase()}</span>
                        </div>
                        <span class="font-bold text-gray-900">${c.name || 'N/A'}</span>
                    </div>
                </td>
                <td class="px-6 py-4 font-semibold text-gray-700">${c._count?.trainees || 0} Trainees</td>
                <td class="px-6 py-4 text-gray-500">${c.contactPerson || '—'}</td>
                <td class="px-6 py-4 text-gray-500">${c.email || c.phone || '—'}</td>
                <td class="px-6 py-4 text-gray-700">${c._count?.courses || 0}</td>
                <td class="px-6 py-4">
                    <button onclick="window.openInvoiceModalForCompany(${JSON.stringify(c).replace(/"/g, '&quot;')})" class="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md text-xs font-bold border border-emerald-100 transition-colors">
                        <i data-lucide="file-plus" class="w-3.5 h-3.5"></i>
                        Add Invoice
                    </button>
                </td>
                <td class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="window.openCompanyModal(${JSON.stringify(c).replace(/"/g, '&quot;')})" title="تعديل" class="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors">
                            <i data-lucide="pencil" class="w-4 h-4"></i>
                        </button>
                        <button onclick="window.deleteCompany('${c.id}', '${c.name}')" title="حذف" class="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        if (window.lucide) lucide.createIcons();
    },

    // ========== Trainees Table ==========
    renderTraineesTable(trainees) {
        const tbody = document.getElementById('trainees-table-body');
        if (!tbody) return;

        if (trainees) {
            const unpaidCount = trainees.filter(t => (t.paymentStatus || 'PENDING').toUpperCase() !== 'PAID').length;
            const unpaidEl = document.getElementById('stat-unpaid-invoices');
            if (unpaidEl) unpaidEl.innerText = unpaidCount;

            const pendingCertEl = document.getElementById('stat-pending-certificates');
            if (pendingCertEl) pendingCertEl.innerText = '0';
        }

        if (!trainees || trainees.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-12 text-gray-400 text-sm">
                        <div class="flex flex-col items-center gap-2">
                            <i data-lucide="users" class="w-8 h-8 text-gray-300"></i>
                            <span>No trainees found.</span>
                            <button onclick="window.openTraineeModal()" class="mt-2 px-4 py-2 bg-[#ab8038] text-white rounded-lg text-xs font-bold hover:bg-[#96702f] transition-colors">+ Add Trainee</button>
                        </div>
                    </td>
                </tr>
            `;
            if (window.lucide) lucide.createIcons();
            return;
        }

        tbody.innerHTML = trainees.map((t, index) => {
            const traineeId = (t.idNo && t.idNo !== 'N/A') ? t.idNo : `TR-${String(index + 1).padStart(4, '0')}`;
            const traineeName = t.fullName || 'Unknown Trainee';
            const companyName = t.companyName || 'N/A';
            const courseName = t.courseName || 'Not enrolled';

            let attendance = t.attendanceStatus || 'REGISTERED';
            if (attendance === 'Not enrolled') attendance = 'REGISTERED';
            const attendanceDisplay = attendance.charAt(0) + attendance.slice(1).toLowerCase();

            const attendanceStyle = attendance === 'ABSENT'
                ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/10'
                : attendance === 'LATE'
                    ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10'
                    : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10';
            const attendanceDot = attendance === 'ABSENT' ? 'bg-rose-500' : attendance === 'LATE' ? 'bg-amber-500' : 'bg-emerald-500';

            const paymentStatus = t.paymentStatus || 'PENDING';
            const paymentDisplay = paymentStatus.toUpperCase() === 'PAID' ? 'Paid' : (paymentStatus.toUpperCase() === 'PENDING' ? 'Pending' : 'Unpaid');
            const paymentStyle = paymentStatus.toUpperCase() === 'PAID'
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10'
                : 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/10';

            const rawCompanyId = t.raw?.companyId || '';
            const tData = JSON.stringify({ id: t.id, fullName: t.fullName, idNo: t.idNo, email: t.raw?.email || '', phone: t.raw?.phone || '', companyId: rawCompanyId }).replace(/"/g, '&quot;');

            return `
                <tr class="hover:bg-gray-50/60 transition-colors border-b border-gray-100 group">
                    <td class="px-6 py-4 text-gray-400 font-semibold whitespace-nowrap">${traineeId}</td>
                    <td class="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">${traineeName}</td>
                    <td class="px-6 py-4 text-gray-600 whitespace-nowrap">${companyName}</td>
                    <td class="px-6 py-4 text-gray-700 font-medium whitespace-nowrap">${courseName}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${attendanceStyle}">
                            <span class="w-1.5 h-1.5 rounded-full ${attendanceDot}"></span>
                            ${attendanceDisplay}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${paymentStyle}">
                            ${paymentDisplay}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');

        if (window.lucide) lucide.createIcons();

        if (typeof window.renderCertificatesWithData === 'function') {
            window.renderCertificatesWithData(trainees);
        }
    },

    // ========== Certificates Table ==========
    renderCertificatesTable(data) {
        const tbody = document.getElementById('certificates-table-body');
        if (!tbody) return;

        const totalEl = document.getElementById('stat-total-certs');
        if (totalEl) totalEl.innerText = data.length.toLocaleString();

        const pendingCount = data.filter(t => (t.paymentStatus || 'PENDING').toUpperCase() !== 'PAID').length;
        const pendingEl = document.getElementById('stat-pending-certs');
        if (pendingEl) pendingEl.innerText = pendingCount;

        const expiredEl = document.getElementById('stat-expired-certs');
        if (expiredEl) expiredEl.innerText = '0';

        if (!data || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-12 text-gray-400 text-sm">
                        <div class="flex flex-col items-center gap-2">
                            <i data-lucide="award" class="w-8 h-8 text-gray-300"></i>
                            <span>No certificates found.</span>
                        </div>
                    </td>
                </tr>
            `;
            if (window.lucide) lucide.createIcons();
            return;
        }

        tbody.innerHTML = data.map((t, index) => {
            const certId = (t.idNo && t.idNo !== 'N/A') ? t.idNo : `MAS-${String(index + 1).padStart(4, '0')}`;
            const traineeName = t.fullName || 'Unknown Trainee';
            const companyName = t.companyName || 'N/A';
            const courseName = t.courseName || 'Not enrolled';

            const rowDateStr = t.createdAt || t.timestamp || t.date || (t.raw ? t.raw.timestamp || t.raw.createdAt : '') || '';
            let displayDate = "Not Issued Yet";
            if (rowDateStr) {
                const d = new Date(rowDateStr);
                if (!isNaN(d)) displayDate = d.toLocaleDateString();
            }

            const paymentStatus = (t.paymentStatus || 'PENDING').toUpperCase();
            let statusStyle = "";
            let statusText = "";

            if (paymentStatus === "PAID") {
                statusStyle = "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10";
                statusText = "Issued";
            } else {
                statusStyle = "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10";
                statusText = "Pending";
            }

            return `
                <tr class="hover:bg-gray-50/50 transition-colors border-b border-gray-100 group">
                    <td class="px-6 py-4">
                        <input type="checkbox" value="${t.id}" class="cert-checkbox rounded border-gray-300 text-[#ab8038] focus:ring-[#ab8038]/30 cursor-pointer w-4 h-4">
                    </td>
                    <td class="px-6 py-4 text-gray-500 font-semibold whitespace-nowrap">${certId}</td>
                    <td class="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">${traineeName}</td>
                    <td class="px-6 py-4 text-gray-600 whitespace-nowrap">${companyName}</td>
                    <td class="px-6 py-4 text-gray-700 font-medium whitespace-nowrap">${courseName}</td>
                    <td class="px-6 py-4 text-gray-500 whitespace-nowrap">${displayDate}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${statusStyle}">
                            ${statusText}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-right whitespace-nowrap">
                        <button onclick="window.downloadSingleCert('${t.id}', '${traineeName.replace(/'/g, "\\'")}')"
                            class="p-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:text-[#ab8038] transition-colors shadow-sm inline-flex items-center gap-1.5 text-xs font-semibold"
                            title="تحميل الشهادة">
                            <i data-lucide="download" class="w-3.5 h-3.5"></i> Download
                        </button>
                    </td>
                </tr>
            `;
        }).join("");

        if (window.lucide) lucide.createIcons();

        const selectAll = document.getElementById("select-all-certs");
        const bulkContainer = document.getElementById("bulk-actions-container");
        const selectedCountEl = document.getElementById("selected-count");

        if (selectAll) {
            const updateBulkBar = () => {
                const checked = document.querySelectorAll(".cert-checkbox:checked");
                if (checked.length > 0) {
                    bulkContainer.style.display = "inline-flex";
                    selectedCountEl.innerText = `${checked.length} Selected`;
                } else {
                    bulkContainer.style.display = "none";
                }
                selectAll.checked = (checked.length === document.querySelectorAll(".cert-checkbox").length && checked.length > 0);
            };

            const newSelectAll = selectAll.cloneNode(true);
            selectAll.parentNode.replaceChild(newSelectAll, selectAll);
            newSelectAll.addEventListener("change", () => {
                document.querySelectorAll(".cert-checkbox").forEach(cb => cb.checked = newSelectAll.checked);
                updateBulkBar();
            });

            document.querySelectorAll(".cert-checkbox").forEach(cb => {
                cb.addEventListener("change", updateBulkBar);
            });
        }
    },

    // ========== Courses Grid ==========
    renderCoursesGrid(courses) {
        const grid = document.getElementById('courses-grid');
        if (!grid) return;

        if (!courses || courses.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-12 text-gray-400">
                    <div class="flex flex-col items-center gap-2">
                        <i data-lucide="graduation-cap" class="w-8 h-8 text-gray-300"></i>
                        <span>No courses available.</span>
                        <button onclick="window.openCourseModal()" class="mt-2 px-4 py-2 bg-[#ab8038] text-white rounded-lg text-xs font-bold hover:bg-[#96702f] transition-colors">+ Add Course</button>
                    </div>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
            return;
        }

        grid.innerHTML = courses.map(course => {
            const now = new Date();
            const startDate = new Date(course.startDate);
            const isOngoing = startDate <= now;
            const status = isOngoing ? 'ONGOING' : 'UPCOMING';
            const progress = isOngoing ? Math.min(Math.floor(Math.random() * 40) + 60, 95) : 0;
            const formatDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

            const cData = JSON.stringify({
                id: course.id, courseName: course.courseName, eventName: course.eventName,
                companyId: course.companyId, startDate: course.startDate, venue: course.venue
            }).replace(/"/g, '&quot;');

            return `
                <div class="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col group">
                    <div class="h-1.5 w-full bg-gray-100">
                        <div class="h-full bg-[#ab8038] transition-all duration-1000" style="width: ${progress}%"></div>
                    </div>
                    <div class="p-6 flex-1 flex flex-col">
                        <div class="flex items-center justify-between mb-4">
                            <span class="inline-flex px-2.5 py-1 rounded bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider">${status}</span>
                            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onclick="window.openCourseModal('${cData}')" title="تعديل" class="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors">
                                    <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                                </button>
                                <button onclick="window.deleteCourse('${course.id}', '${course.courseName.replace(/'/g, "\\\'")}')" title="حذف" class="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors">
                                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                                </button>
                            </div>
                        </div>
                        <h3 class="text-lg font-bold text-gray-900 leading-snug mb-1">${course.courseName}</h3>
                        <div class="flex items-center gap-2 text-sm text-gray-500 mb-6">
                            <i data-lucide="building-2" class="w-4 h-4"></i>
                            <span>${course.company?.name || 'No Company'}</span>
                        </div>
                        <div class="mt-auto">
                            <div class="flex items-center justify-between text-xs text-gray-500 font-medium mb-3">
                                <div class="flex items-center gap-1.5">
                                    <i data-lucide="calendar" class="w-4 h-4"></i>
                                    <span>${formatDate(startDate)}</span>
                                </div>
                                <span class="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold">${course._count?.enrollments || 0} Trainees</span>
                            </div>
                            <button onclick="window.loadAttendancePanel('${course.id}')"
                                class="w-full py-2.5 rounded-lg text-sm font-bold transition-all ${isOngoing ? 'bg-[#946e2f] hover:bg-[#856127] text-white shadow-md' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}">
                                ${isOngoing ? 'Manage Attendance' : 'View Details'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        if (window.lucide) lucide.createIcons();
    },

    // ========== Course Stats ==========
    updateCourseStats(stats) {
        if (!stats) return;
        const elements = {
            'stat-ongoing-courses': stats.ongoingCourses || 0,
            'stat-upcoming-scheduled': stats.upcomingScheduled || 0,
            'stat-assigned-trainers': stats.assignedTrainers || 0
        };
        for (const [id, value] of Object.entries(elements)) {
            const el = document.getElementById(id);
            if (el) el.innerText = value;
        }
    },

    // ========== Attendance Panel ==========
    renderCourseAttendance(courseDetails) {
        const panel = document.getElementById('attendance-panel');
        if (!panel) return;
        panel.classList.remove('hidden');

        const enrollments = courseDetails?.enrollments || [];
        const trainees = enrollments.map(e => ({
            id: e.trainee.id,
            fullName: e.trainee.fullName,
            idNo: e.trainee.idNo,
            companyName: e.trainee.company?.name || 'N/A',
            status: e.attendanceStatus || 'REGISTERED'
        }));

        const tbody = document.getElementById('attendance-table-body');
        if (!tbody) return;

        if (trainees.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-8 text-gray-400 text-sm">No trainees enrolled in this course.</td>
                </tr>
            `;
        } else {
            tbody.innerHTML = trainees.map(t => {
                const initials = t.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                const status = t.status || 'REGISTERED';
                return `
                    <tr class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors" data-trainee-id="${t.id}">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">${initials}</div>
                                <div>
                                    <p class="text-sm font-bold text-gray-900 leading-tight">${t.fullName}</p>
                                    <p class="text-[11px] text-gray-500 font-medium">ID: ${t.idNo || 'N/A'}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-600 font-medium">${t.companyName}</td>
                        <td class="px-6 py-4">
                            <div class="flex items-center bg-gray-100 rounded-lg p-1 w-max gap-1">
                                <button onclick="window.setAttendance(this, 'PRESENT')" class="attendance-btn ${status === 'PRESENT' ? 'bg-[#0a0e17] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'} px-3 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5"><i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> Present</button>
                                <button onclick="window.setAttendance(this, 'ABSENT')" class="attendance-btn ${status === 'ABSENT' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'} px-3 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5"><i data-lucide="x-circle" class="w-3.5 h-3.5"></i> Absent</button>
                                <button onclick="window.setAttendance(this, 'LATE')" class="attendance-btn ${status === 'LATE' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'} px-3 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5"><i data-lucide="clock" class="w-3.5 h-3.5"></i> Late</button>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <button class="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"><i data-lucide="menu" class="w-4 h-4"></i></button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        if (window.lucide) lucide.createIcons();

        document.getElementById('attendance-course-name').innerText = courseDetails?.courseName || 'Unnamed Course';
        document.getElementById('attendance-trainer').innerText = courseDetails?.trainerName || 'Not Assigned';

        const presentCount = trainees.filter(t => t.status === 'PRESENT').length;
        document.getElementById('attendance-present-count').innerHTML =
            `${presentCount}<span class="text-sm text-gray-400 font-medium">/${trainees.length}</span>`;

        window.setAttendance = function (btn, status) {
            const container = btn.parentElement;
            const buttons = container.querySelectorAll('.attendance-btn');
            buttons.forEach(b => {
                b.className = "attendance-btn text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5";
            });
            const statusClasses = {
                'PRESENT': 'bg-[#0a0e17] text-white shadow-sm',
                'ABSENT': 'bg-red-600 text-white shadow-sm',
                'LATE': 'bg-amber-100 text-amber-700 shadow-sm'
            };
            btn.className = `attendance-btn ${statusClasses[status] || 'bg-gray-200'} px-3 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5`;
            const tr = container.closest('tr');
            if (tr) tr.dataset.status = status;
        };

        window.saveAttendance = async function () {
            const courseId = window.currentCourseId || courseDetails?.id;
            if (!courseId) { alert('Course ID not found!'); return; }

            const rows = document.querySelectorAll('#attendance-table-body tr');
            const attendanceData = Array.from(rows).map(row => ({
                traineeId: row.dataset.traineeId,
                status: row.dataset.status || 'PRESENT'
            }));

            const btn = document.getElementById('save-attendance-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="w-4 h-4 animate-spin" data-lucide="refresh-cw"></i> Saving...';
            if (window.lucide) lucide.createIcons();

            const result = await api.updateAttendance(courseId, attendanceData);
            btn.innerHTML = originalText;
            if (window.lucide) lucide.createIcons();

            if (result.success) {
                showToast('✅ Attendance saved successfully!', 'success');
            } else {
                showToast('❌ Error: ' + (result.message || 'Unknown error'), 'error');
            }
        };
    }
};

// ========== Global Functions ==========
window.loadAttendancePanel = async function (courseId) {
    try {
        const result = await api.getCourseDetails(courseId);
        if (result.success && result.course) {
            window.currentCourseId = courseId;
            ui.renderCourseAttendance(result.course);
            document.getElementById('attendance-panel').scrollIntoView({ behavior: 'smooth' });
        } else {
            ui.showToast('Failed to load course details', 'error');
        }
    } catch (error) {
        ui.showToast('Error loading attendance panel', 'error');
    }
};