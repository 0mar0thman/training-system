// ========== Certificates Management System (Real Data Integration) ==========

// 1. متغير عام لحفظ الداتا الحقيقية اللي هتيجي من برا
let realCertificatesData = [];

// 2. الدالة اللي هتستقبل الداتا من ملف app.js
window.renderCertificatesWithData = function(trainees) {
    if (!trainees || !Array.isArray(trainees)) return;
    realCertificatesData = trainees; // حفظ الداتا هنا
    renderCertificates(realCertificatesData); // تشغيل دالة رسم الجدول
};

// تشغيل السيستم أول ما الصفحة تفتح
document.addEventListener("DOMContentLoaded", () => {
    setupSearch();
});

// 3. دالة بناء ورسم الجدول وتحديث كروت الأرقام العلوية بالداتا الحقيقية
function renderCertificates(data) {
    const tbody = document.getElementById("certificates-table-body");
    if (!tbody) return;

    // تحديث الـ Stats العلوية بناءً على الداتا الحقيقية
    document.getElementById("stat-total-certs").innerText = data.length.toLocaleString();
    
    // حساب الشهادات المعلقة بناءً على اللي لسه مادفعوش (PENDING)
    const pendingCount = data.filter(t => (t.paymentStatus || 'PENDING').toUpperCase() !== 'PAID').length;
    document.getElementById("stat-pending-certs").innerText = pendingCount;
    document.getElementById("stat-expired-certs").innerText = "0"; 

    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-12 text-gray-400 text-sm">
                    <div class="flex flex-col items-center gap-2">
                        <i data-lucide="award" class="w-8 h-8 text-gray-300"></i>
                        <span>No certificates found matching your criteria.</span>
                    </div>
                </td>
            </tr>
        `;
        if (window.lucide) lucide.createIcons();
        return;
    }

    // بناء سطور الجدول من الداتا الحقيقية
    tbody.innerHTML = data.map((t, index) => {
        const certId = (t.idNo && t.idNo !== 'N/A') ? t.idNo : `MAS-${String(index + 1).padStart(4, '0')}`;
        const traineeName = t.fullName || 'Unknown Trainee';
        const companyName = t.companyName || 'N/A';
        const courseName = t.courseName || 'Not enrolled';

        // محاولة سحب تاريخ الإصدار
        const rowDateStr = t.createdAt || t.timestamp || t.date || (t.raw ? t.raw.timestamp || t.raw.createdAt : '') || '';
        let displayDate = "Not Issued Yet";
        if (rowDateStr) {
            const d = new Date(rowDateStr);
            if (!isNaN(d)) displayDate = d.toLocaleDateString();
        }

        // ربط حالة الشهادة بالدفع
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
                        ${statusText === 'Pending' ? 'disabled title="الشهادة معلقة (الفاتورة غير مدفوعة)"' : 'title="تحميل الشهادة"'}>
                        <i data-lucide="download" class="w-3.5 h-3.5"></i> Download
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    if (window.lucide) lucide.createIcons();
    setupCheckboxEvents();
}

// 4. دالة الـ Checkboxes
function setupCheckboxEvents() {
    const selectAll = document.getElementById("select-all-certs");
    const checkboxes = document.querySelectorAll(".cert-checkbox");
    const bulkContainer = document.getElementById("bulk-actions-container");
    const selectedCountEl = document.getElementById("selected-count");

    if (!selectAll) return;

    function updateBulkBar() {
        const checked = document.querySelectorAll(".cert-checkbox:checked");
        if (checked.length > 0) {
            bulkContainer.style.display = "inline-flex"; 
            selectedCountEl.innerText = `${checked.length} Selected`;
        } else {
            bulkContainer.style.display = "none"; 
        }
        selectAll.checked = (checked.length === checkboxes.length && checkboxes.length > 0);
    }

    selectAll.addEventListener("change", () => {
        checkboxes.forEach(cb => cb.checked = selectAll.checked);
        updateBulkBar();
    });

    checkboxes.forEach(cb => {
        cb.addEventListener("change", updateBulkBar);
    });
}

// 5. ميزة البحث اللحظي
function setupSearch() {
    const searchInput = document.getElementById("certificates-search");
    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = realCertificatesData.filter(t => {
            const name = (t.fullName || "").toLowerCase();
            const idNo = (t.idNo || "").toLowerCase();
            const company = (t.companyName || "").toLowerCase();
            const course = (t.courseName || "").toLowerCase();
            
            return name.includes(query) || idNo.includes(query) || company.includes(query) || course.includes(query);
        });
        renderCertificates(filtered);
    });
}

// 6. روابط التنزيل للباك إند لاحقاً
window.downloadSingleCert = function(id, name) { alert(`⚡ جاري توليد شهادة المتدرب: [${name}]`); };
window.bulkDownloadCertificates = function() { alert(`📦 جاري تجميع الشهادات المحددة...`); };
window.downloadAllCertificates = function() { alert(`🚀 جاري طلب تحميل كافة الشهادات...`); };