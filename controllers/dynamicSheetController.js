const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Get all spreadsheets metadata
const getSheets = async (req, res) => {
    try {
        const sheets = await prisma.uploadedSheet.findMany({
            orderBy: { createdAt: 'desc' }
        });

        const metadata = sheets.map(sheet => {
            let headersList = [];
            let rowsList = [];
            try {
                headersList = JSON.parse(sheet.headers);
                rowsList = JSON.parse(sheet.rows);
            } catch (e) {
                console.error("Error parsing JSON for sheet:", sheet.id, e);
            }

            return {
                id: sheet.id,
                fileName: sheet.fileName,
                headers: headersList,
                rowCount: rowsList.length,
                createdAt: sheet.createdAt,
                updatedAt: sheet.updatedAt
            };
        });

        res.json({ success: true, sheets: metadata });
    } catch (error) {
        console.error("Error in getSheets:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get a single spreadsheet details
const getSheetById = async (req, res) => {
    try {
        const { id } = req.params;
        const sheet = await prisma.uploadedSheet.findUnique({
            where: { id }
        });

        if (!sheet) {
            return res.status(404).json({ success: false, message: 'ملف الإكسيل غير موجود' });
        }

        let headers = [];
        let rows = [];
        try {
            headers = JSON.parse(sheet.headers);
            rows = JSON.parse(sheet.rows);
        } catch (e) {
            console.error("Error parsing JSON for sheet:", id, e);
        }

        res.json({
            success: true,
            sheet: {
                id: sheet.id,
                fileName: sheet.fileName,
                headers,
                rows,
                createdAt: sheet.createdAt,
                updatedAt: sheet.updatedAt
            }
        });
    } catch (error) {
        console.error("Error in getSheetById:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Add a row to a spreadsheet
const addRow = async (req, res) => {
    try {
        const { id } = req.params;
        const newRow = req.body;

        const sheet = await prisma.uploadedSheet.findUnique({ where: { id } });
        if (!sheet) {
            return res.status(404).json({ success: false, message: 'ملف الإكسيل غير موجود' });
        }

        const headers = JSON.parse(sheet.headers);
        const rows = JSON.parse(sheet.rows);

        const sanitizedRow = {};
        headers.forEach(h => {
            sanitizedRow[h] = newRow[h] !== undefined ? newRow[h] : '';
        });

        rows.push(sanitizedRow);

        await prisma.uploadedSheet.update({
            where: { id },
            data: { rows: JSON.stringify(rows) }
        });

        res.json({ success: true, message: 'تم إضافة الصف بنجاح', row: sanitizedRow });
    } catch (error) {
        console.error("Error in addRow:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Update a row at a specific index
const updateRow = async (req, res) => {
    try {
        const { id, rowIndex } = req.params;
        const index = parseInt(rowIndex);
        const updatedRowData = req.body;

        const sheet = await prisma.uploadedSheet.findUnique({ where: { id } });
        if (!sheet) {
            return res.status(404).json({ success: false, message: 'ملف الإكسيل غير موجود' });
        }

        const headers = JSON.parse(sheet.headers);
        const rows = JSON.parse(sheet.rows);

        if (isNaN(index) || index < 0 || index >= rows.length) {
            return res.status(400).json({ success: false, message: 'موقع الصف غير صحيح' });
        }

        const sanitizedRow = {};
        headers.forEach(h => {
            sanitizedRow[h] = updatedRowData[h] !== undefined ? updatedRowData[h] : rows[index][h];
        });

        rows[index] = sanitizedRow;

        await prisma.uploadedSheet.update({
            where: { id },
            data: { rows: JSON.stringify(rows) }
        });

        res.json({ success: true, message: 'تم تحديث الصف بنجاح', row: sanitizedRow });
    } catch (error) {
        console.error("Error in updateRow:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Delete a row at a specific index
const deleteRow = async (req, res) => {
    try {
        const { id, rowIndex } = req.params;
        const index = parseInt(rowIndex);

        const sheet = await prisma.uploadedSheet.findUnique({ where: { id } });
        if (!sheet) {
            return res.status(404).json({ success: false, message: 'ملف الإكسيل غير موجود' });
        }

        const rows = JSON.parse(sheet.rows);

        if (isNaN(index) || index < 0 || index >= rows.length) {
            return res.status(400).json({ success: false, message: 'موقع الصف غير صحيح' });
        }

        rows.splice(index, 1);

        await prisma.uploadedSheet.update({
            where: { id },
            data: { rows: JSON.stringify(rows) }
        });

        res.json({ success: true, message: 'تم حذف الصف بنجاح' });
    } catch (error) {
        console.error("Error in deleteRow:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. Delete a spreadsheet entirely
const deleteSheet = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.uploadedSheet.delete({ where: { id } });
        res.json({ success: true, message: 'تم حذف ملف الإكسيل بنجاح' });
    } catch (error) {
        console.error("Error in deleteSheet:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getSheets,
    getSheetById,
    addRow,
    updateRow,
    deleteRow,
    deleteSheet
};
