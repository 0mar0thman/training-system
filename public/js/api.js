const API_BASE = '/api';

export const api = {
    // ========== Dashboard ==========
    async getDashboardStats() {
        try {
            const res = await fetch(`${API_BASE}/reports/stats`);
            if (!res.ok) throw new Error('Failed to fetch stats');
            return await res.json();
        } catch (error) {
            console.error('Error fetching stats:', error);
            return { success: false, stats: {} };
        }
    },

    // ========== Companies ==========
    async getCompanies() {
        try {
            const res = await fetch(`${API_BASE}/companies`);
            if (!res.ok) throw new Error('Failed to fetch companies');
            return await res.json();
        } catch (error) {
            console.error('Error fetching companies:', error);
            return { success: false, companies: [] };
        }
    },

    async createCompany(data) {
        try {
            const res = await fetch(`${API_BASE}/companies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (error) {
            console.error('Error creating company:', error);
            return { success: false, message: error.message };
        }
    },

    async updateCompany(id, data) {
        try {
            const res = await fetch(`${API_BASE}/companies/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (error) {
            console.error('Error updating company:', error);
            return { success: false, message: error.message };
        }
    },

    async deleteCompany(id) {
        try {
            const res = await fetch(`${API_BASE}/companies/${id}`, {
                method: 'DELETE'
            });
            return await res.json();
        } catch (error) {
            console.error('Error deleting company:', error);
            return { success: false, message: error.message };
        }
    },

    // ========== Trainees ==========
    async getTrainees() {
        try {
            const res = await fetch(`${API_BASE}/trainees`);
            if (!res.ok) throw new Error('Failed to fetch trainees');
            return await res.json();
        } catch (error) {
            console.error('Error fetching trainees:', error);
            return { success: false, trainees: [] };
        }
    },

    async createTrainee(data) {
        try {
            const res = await fetch(`${API_BASE}/trainees`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (error) {
            console.error('Error creating trainee:', error);
            return { success: false, message: error.message };
        }
    },

    async updateTrainee(id, data) {
        try {
            const res = await fetch(`${API_BASE}/trainees/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (error) {
            console.error('Error updating trainee:', error);
            return { success: false, message: error.message };
        }
    },

    async deleteTrainee(id) {
        try {
            const res = await fetch(`${API_BASE}/trainees/${id}`, {
                method: 'DELETE'
            });
            return await res.json();
        } catch (error) {
            console.error('Error deleting trainee:', error);
            return { success: false, message: error.message };
        }
    },

    // ========== Courses ==========
    async getCourses(search = '', isReal = null) {
        try {
            let url = `${API_BASE}/courses`;
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (isReal !== null) params.append('isReal', isReal);
            if (params.toString()) url += `?${params.toString()}`;

            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch courses');
            return await res.json();
        } catch (error) {
            console.error('Error fetching courses:', error);
            return { success: false, courses: [] };
        }
    },

    async getCourseStats() {
        try {
            const res = await fetch(`${API_BASE}/courses/stats`);
            if (!res.ok) throw new Error('Failed to fetch course stats');
            return await res.json();
        } catch (error) {
            console.error('Error fetching course stats:', error);
            return { success: false, stats: {} };
        }
    },

    async getCourseDetails(courseId) {
        try {
            const res = await fetch(`${API_BASE}/courses/${courseId}`);
            if (!res.ok) throw new Error('Failed to fetch course details');
            return await res.json();
        } catch (error) {
            console.error('Error fetching course details:', error);
            return { success: false, course: null };
        }
    },

    async createCourse(data) {
        try {
            const res = await fetch(`${API_BASE}/courses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (error) {
            console.error('Error creating course:', error);
            return { success: false, message: error.message };
        }
    },

    async updateCourse(id, data) {
        try {
            const res = await fetch(`${API_BASE}/courses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (error) {
            console.error('Error updating course:', error);
            return { success: false, message: error.message };
        }
    },

    async deleteCourse(id) {
        try {
            const res = await fetch(`${API_BASE}/courses/${id}`, {
                method: 'DELETE'
            });
            return await res.json();
        } catch (error) {
            console.error('Error deleting course:', error);
            return { success: false, message: error.message };
        }
    },

    async updateAttendance(courseId, attendanceData) {
        try {
            const res = await fetch(`${API_BASE}/courses/${courseId}/attendance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attendanceData })
            });
            return await res.json();
        } catch (error) {
            console.error('Error updating attendance:', error);
            return { success: false, message: error.message };
        }
    },

    // ========== Certificates ==========
    async getCertificates() {
        try {
            const res = await fetch(`${API_BASE}/certificates`);
            if (!res.ok) throw new Error('Failed to fetch certificates');
            return await res.json();
        } catch (error) {
            console.error('Error fetching certificates:', error);
            return { success: false, certificates: [] };
        }
    },

    async issueCertificate(data) {
        try {
            const res = await fetch(`${API_BASE}/certificates/issue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (error) {
            console.error('Error issuing certificate:', error);
            return { success: false, message: error.message };
        }
    },

    async verifyCertificate(qrCode) {
        try {
            const res = await fetch(`${API_BASE}/certificates/verify/${qrCode}`);
            return await res.json();
        } catch (error) {
            console.error('Error verifying certificate:', error);
            return { success: false, message: error.message };
        }
    },

    // ========== Invoices ==========
    async getInvoices() {
        try {
            const res = await fetch(`${API_BASE}/invoices`);
            if (!res.ok) throw new Error('Failed to fetch invoices');
            return await res.json();
        } catch (error) {
            console.error('Error fetching invoices:', error);
            return { success: false, invoices: [] };
        }
    },

    async createInvoice(data) {
        try {
            const res = await fetch(`${API_BASE}/invoices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (error) {
            console.error('Error creating invoice:', error);
            return { success: false, message: error.message };
        }
    },

    async updateInvoicePayment(id, data) {
        try {
            const res = await fetch(`${API_BASE}/invoices/${id}/payment`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (error) {
            console.error('Error updating invoice payment:', error);
            return { success: false, message: error.message };
        }
    },

    async updateInvoice(id, data) {
        try {
            const res = await fetch(`${API_BASE}/invoices/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (error) {
            console.error('Error updating invoice:', error);
            return { success: false, message: error.message };
        }
    },

    async deleteInvoice(id) {
        try {
            const res = await fetch(`${API_BASE}/invoices/${id}`, {
                method: 'DELETE'
            });
            return await res.json();
        } catch (error) {
            console.error('Error deleting invoice:', error);
            return { success: false, message: error.message };
        }
    },

    // ========== Excel Upload ==========
    async uploadExcel(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(`${API_BASE}/excel/upload`, {
                method: 'POST',
                body: formData
            });
            return await res.json();
        } catch (error) {
            console.error('Error uploading file:', error);
            return { success: false, message: error.message };
        }
    },

    // ========== Dynamic Spreadsheets ==========
    async getSheets() {
        try {
            const res = await fetch(`${API_BASE}/uploaded-sheets`);
            if (!res.ok) throw new Error('Failed to fetch sheets');
            return await res.json();
        } catch (error) {
            console.error('Error fetching sheets:', error);
            return { success: false, sheets: [] };
        }
    },

    async getSheetById(id) {
        try {
            const res = await fetch(`${API_BASE}/uploaded-sheets/${id}`);
            if (!res.ok) throw new Error('Failed to fetch sheet');
            return await res.json();
        } catch (error) {
            console.error('Error fetching sheet:', error);
            return { success: false, sheet: null };
        }
    },

    async addSheetRow(id, rowData) {
        try {
            const res = await fetch(`${API_BASE}/uploaded-sheets/${id}/rows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rowData)
            });
            return await res.json();
        } catch (error) {
            console.error('Error adding row:', error);
            return { success: false, message: error.message };
        }
    },

    async updateSheetRow(id, rowIndex, rowData) {
        try {
            const res = await fetch(`${API_BASE}/uploaded-sheets/${id}/rows/${rowIndex}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rowData)
            });
            return await res.json();
        } catch (error) {
            console.error('Error updating row:', error);
            return { success: false, message: error.message };
        }
    },

    async deleteSheetRow(id, rowIndex) {
        try {
            const res = await fetch(`${API_BASE}/uploaded-sheets/${id}/rows/${rowIndex}`, {
                method: 'DELETE'
            });
            return await res.json();
        } catch (error) {
            console.error('Error deleting row:', error);
            return { success: false, message: error.message };
        }
    },

    async deleteSheet(id) {
        try {
            const res = await fetch(`${API_BASE}/uploaded-sheets/${id}`, {
                method: 'DELETE'
            });
            return await res.json();
        } catch (error) {
            console.error('Error deleting sheet:', error);
            return { success: false, message: error.message };
        }
    }
};