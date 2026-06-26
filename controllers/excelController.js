const xlsx = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const uploadExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'لم يتم رفع أي ملف!' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const rawRows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (rawRows.length === 0) {
            return res.status(400).json({ success: false, message: 'ملف الإكسيل فارغ!' });
        }

        let headerRowIndex = 0;
        let foundStandardHeader = false;
        
        for (let i = 0; i < Math.min(rawRows.length, 15); i++) {
            const row = rawRows[i];
            if (row && row.some(cell => {
                const s = String(cell || '').trim();
                return s === 'Customer' || s === 'Course Name:' || s === 'Course Name' || s === 'Event';
            })) {
                headerRowIndex = i;
                foundStandardHeader = true;
                break;
            }
        }

        if (!foundStandardHeader) {
            for (let i = 0; i < rawRows.length; i++) {
                const nonActiveCells = (rawRows[i] || []).filter(c => c !== null && c !== undefined && String(c).trim() !== '');
                if (nonActiveCells.length > 1) {
                    headerRowIndex = i;
                    break;
                }
            }
        }

        const rawHeaders = rawRows[headerRowIndex] || [];
        const headers = rawHeaders
            .map((h, idx) => h ? String(h).trim() : `Column_${idx + 1}`)
            .filter((h, idx, self) => h !== '' && self.indexOf(h) === idx);

        if (headers.length === 0) {
            return res.status(400).json({ success: false, message: 'لم يتم العثور على أعمدة صالحة في ملف الإكسيل!' });
        }

        const rows = [];
        for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
            const rowData = rawRows[i];
            if (!rowData || rowData.filter(cell => cell !== null && cell !== undefined && String(cell).trim() !== '').length === 0) {
                continue;
            }

            const rowObj = {};
            headers.forEach((header, colIdx) => {
                const cellValue = rowData[colIdx];
                if (cellValue === null || cellValue === undefined) {
                    rowObj[header] = "";
                } else {
                    rowObj[header] = cellValue;
                }
            });
            rows.push(rowObj);
        }

        const fileName = req.file.originalname || 'uploaded_sheet.xlsx';
        const dynamicSheet = await prisma.uploadedSheet.create({
            data: {
                fileName,
                headers: JSON.stringify(headers),
                rows: JSON.stringify(rows)
            }
        });

        const hasStandardColumns = headers.includes('Customer') && (headers.includes('Course Name:') || headers.includes('Course Name'));

        let importedRows = 0;
        let skippedRows = 0;
        let errors = [];
        let duplicates = [];

        if (hasStandardColumns) {
            for (let index = 0; index < rows.length; index++) {
                const row = rows[index];
                const rowNum = index + headerRowIndex + 2;

                const customerName = row['Customer'];
                const corId = row['Cor Id'] ? String(row['Cor Id']).trim() : null;
                const eventName = row['Event'] || 'غير مححدد';
                const courseName = row['Course Name:'] || row['Course Name'] || 'غير محدد';
                const venue = row['Venue:'] || row['Venue'] || null;
                const room = row['Room:'] || row['Room'] || null;
                const poNumber = row['PO:'] || row['PO'] ? String(row['PO:'] || row['PO']).trim() : null;

                const numParticipants = parseInt(row['Number of Participants:'] || row['Number of Participants']) || 0;
                const numCert = parseInt(row['Number of Cert:'] || row['Number of Cert']) || 0;
                const certZip = row['Certificates (ZIP):'] || row['Certificates (ZIP)'] || null;

                const isRealStr = String(row['Event is Real or not?'] || row['Event is Real'] || '').toLowerCase();
                const isRealEvent = (isRealStr === 'yes' || isRealStr === 'true' || isRealStr === '1' || isRealStr === 'نعم');

                if (!customerName || String(customerName).trim() === '') {
                    skippedRows++;
                    errors.push(`السطر ${rowNum}: تم تخطيه بسبب عدم وجود اسم الشركة (Customer)`);
                    continue;
                }

                if (!courseName || String(courseName).trim() === 'غير محدد') {
                    skippedRows++;
                    errors.push(`السطر ${rowNum}: تم تخطيه بسبب عدم وجود اسم الدورة (Course Name)`);
                    continue;
                }

                let startDate = new Date();
                const rawStartDate = row['Start Date'] || row['StartDate'] || row['Date'];
                if (rawStartDate) {
                    if (!isNaN(rawStartDate) && typeof rawStartDate === 'number') {
                        startDate = new Date(Math.round((rawStartDate - 25569) * 86400 * 1000));
                    } else {
                        startDate = new Date(rawStartDate);
                    }
                } else {
                    skippedRows++;
                    errors.push(`السطر ${rowNum}: تم تخطيه لعدم تحديد تاريخ البدء (Start Date)`);
                    continue;
                }

                const company = await prisma.company.upsert({
                    where: { name: String(customerName).trim() },
                    update: {},
                    create: { name: String(customerName).trim() }
                });

                let course;
                if (corId) {
                    const existing = await prisma.course.findUnique({ where: { corId } });
                    if (existing) {
                        duplicates.push(`تنبيه: الكود (${corId}) للدورة "${courseName}" مكرر. تم تحديث البيانات.`);
                    }
                    course = await prisma.course.upsert({
                        where: { corId },
                        update: {
                            eventName, courseName, startDate, venue, room,
                            isRealEvent, numberOfParticipants: numParticipants,
                            numberOfCert: numCert, certificatesZip: certZip,
                            companyId: company.id
                        },
                        create: {
                            corId, eventName, courseName, startDate, venue, room,
                            isRealEvent, numberOfParticipants: numParticipants,
                            numberOfCert: numCert, certificatesZip: certZip,
                            companyId: company.id
                        }
                    });
                } else {
                    const existing = await prisma.course.findFirst({
                        where: {
                            courseName,
                            startDate,
                            companyId: company.id
                        }
                    });

                    if (existing) {
                        duplicates.push(`تنبيه: الدورة "${courseName}" للشركة "${customerName}" مكررة. تم تحديثها.`);
                        course = await prisma.course.update({
                            where: { id: existing.id },
                            data: {
                                eventName, venue, room,
                                isRealEvent, numberOfParticipants: numParticipants,
                                numberOfCert: numCert, certificatesZip: certZip
                            }
                        });
                    } else {
                        course = await prisma.course.create({
                            data: {
                                eventName, courseName, startDate, venue, room,
                                isRealEvent, numberOfParticipants: numParticipants,
                                numberOfCert: numCert, certificatesZip: certZip,
                                companyId: company.id
                            }
                        });
                    }
                }

                if (poNumber) {
                    const existingInvoice = await prisma.invoice.findFirst({
                        where: {
                            poNumber,
                            companyId: company.id
                        }
                    });

                    if (!existingInvoice) {
                        await prisma.invoice.create({
                            data: {
                                poNumber,
                                amount: numParticipants * 500,
                                paymentStatus: 'PENDING',
                                companyId: company.id,
                                courseId: course.id
                            }
                        });
                    }
                }

                let rawParticipants = row['Participants With IDNO:'] || row['Participants With IDNO'] || row['Participants:'] || row['Participants'];
                if (rawParticipants) {
                    let traineesList = String(rawParticipants).split(/[,،\n]|(?=\d+- )/);

                    for (let tName of traineesList) {
                        tName = tName.trim();
                        if (!tName) continue;

                        tName = tName.replace(/^\d+\s*[-.]\s*/, '').trim();

                        let idNo = null;
                        const idMatch = tName.match(/\(([^)]+)\)/) || tName.match(/(\d{8,10})/);
                        if (idMatch) {
                            idNo = idMatch[1].trim();
                            tName = tName.replace(idMatch[0], '').trim();
                        }

                        if (tName.length > 2) {
                            let trainee = await prisma.trainee.findFirst({
                                where: {
                                    fullName: tName,
                                    companyId: company.id
                                }
                            });

                            if (!trainee) {
                                trainee = await prisma.trainee.create({
                                    data: {
                                        fullName: tName,
                                        idNo,
                                        companyId: company.id
                                    }
                                });
                            } else if (idNo && !trainee.idNo) {
                                trainee = await prisma.trainee.update({
                                    where: { id: trainee.id },
                                    data: { idNo }
                                });
                            }

                            const existingEnrollment = await prisma.enrollment.findFirst({
                                where: {
                                    courseId: course.id,
                                    traineeId: trainee.id
                                }
                            });

                            if (!existingEnrollment) {
                                await prisma.enrollment.create({
                                    data: {
                                        courseId: course.id,
                                        traineeId: trainee.id,
                                        attendanceStatus: 'REGISTERED'
                                    }
                                });
                            }
                        }
                    }
                }
                importedRows++;
            }
        }

        res.json({
            success: true,
            importedRows,
            skippedRows,
            errors,
            duplicates,
            dynamicSheetId: dynamicSheet.id,
            isDynamicOnly: !hasStandardColumns,
            message: hasStandardColumns 
                ? `اكتملت العملية: تم استيراد ${importedRows} سجلات للشركات والكورسات والطلاب بنجاح، وحفظ الجدول مرنًا.`
                : `تم رفع وحفظ ملف الإكسيل كجدول مرن بنجاح! تم استيراد ${rows.length} صفوف.`
        });

    } catch (error) {
        console.error("Error processing Excel:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { uploadExcel };