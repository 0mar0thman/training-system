const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

// جلب قائمة الشهادات
const getCertificates = async (req, res) => {
  try {
    const certificates = await prisma.enrollment.findMany({
      where: { certificateUrl: { not: null } },
      include: {
        trainee: { include: { company: true } },
        course: true
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json({ success: true, certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// إصدار شهادة جديدة
const issueCertificate = async (req, res) => {
  try {
    const { enrollmentId } = req.body;
    
    // جلب بيانات التسجيل كاملة
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { trainee: true, course: true }
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'التسجيل غير موجود' });
    }

    const qrCode = `CERT-${enrollment.course.corId || 'COR'}-${enrollment.trainee.idNo || enrollment.trainee.id.slice(0,6)}`;
    const certificateUrl = `/api/certificates/pdf/${qrCode}`;

    const updated = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        attendanceStatus: 'PRESENT',
        certificateUrl,
        qrCode
      }
    });

    res.json({ success: true, enrollment: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// التحقق من صحة الشهادة عبر QR
const verifyCertificate = async (req, res) => {
  try {
    const { qrCode } = req.params;
    const enrollment = await prisma.enrollment.findUnique({
      where: { qrCode },
      include: {
        trainee: { include: { company: true } },
        course: true
      }
    });
    if (!enrollment) return res.status(404).json({ success: false, message: 'شهادة غير صالحة أو غير موجودة بالنظام' });
    res.json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// إنشاء PDF الشهادة تلقائياً مع QR Code
const downloadPDFCertificate = async (req, res) => {
  try {
    const { qrCode } = req.params;
    const enrollment = await prisma.enrollment.findUnique({
      where: { qrCode },
      include: {
        trainee: { include: { company: true } },
        course: true
      }
    });

    if (!enrollment) {
      return res.status(404).send('Certificate not found');
    }

    // إعداد مستند PDF
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margin: 40
    });

    // إعداد استجابة الـ HTTP
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${qrCode}.pdf"`);
    doc.pipe(res);

    // رسم إطار خارجي فاخر
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
       .lineWidth(5)
       .strokeColor('#1e293b') // Slate dark
       .stroke();

    doc.rect(28, 28, doc.page.width - 56, doc.page.height - 56)
       .lineWidth(1.5)
       .strokeColor('#b45309') // Amber accent
       .stroke();

    // شعار الشركة التدريبية (رسم هندسي أنيق)
    doc.save()
       .translate(doc.page.width / 2 - 25, 60)
       .path('M 0 0 L 25 -15 L 50 0 L 50 10 L 25 25 L 0 10 Z')
       .fill('#1e293b');
    doc.restore();

    // عنوان الشركة التدريبية
    doc.fillColor('#1e293b')
       .fontSize(22)
       .text('مركز آفاق للتدريب والتطوير المهني', { align: 'center', dy: 90 });
    
    doc.fontSize(10)
       .fillColor('#64748b')
       .text('AFAQ CENTER FOR PROFESSIONAL TRAINING', { align: 'center' });

    doc.moveDown(2);

    // عنوان الشهادة
    doc.fillColor('#b45309')
       .fontSize(28)
       .text('شهادة حضور وإتمام دورة تدريبية', { align: 'center' });

    doc.fontSize(12)
       .fillColor('#64748b')
       .text('CERTIFICATE OF COMPLETION', { align: 'center' });

    doc.moveDown(1.5);

    // نص الشهادة باللغة العربية والإنجليزية
    doc.fillColor('#1e293b')
       .fontSize(16)
       .text(`يشهد المركز بأن المتدرب: ${enrollment.trainee.fullName}`, { align: 'center' });
    
    doc.fontSize(12)
       .fillColor('#475569')
       .text(`This is to certify that: ${enrollment.trainee.fullName}`, { align: 'center' });

    doc.moveDown(1);

    doc.fillColor('#1e293b')
       .fontSize(15)
       .text(`قد أكمل بنجاح البرنامج التدريبي: ${enrollment.course.courseName}`, { align: 'center' });

    doc.fontSize(12)
       .fillColor('#475569')
       .text(`Has successfully completed the training course: ${enrollment.course.courseName}`, { align: 'center' });

    doc.moveDown(1);

    const formattedDate = new Date(enrollment.course.startDate).toLocaleDateString('ar-SA');
    doc.fillColor('#0f172a')
       .fontSize(12)
       .text(`تاريخ البدء: ${formattedDate}  |  اسم الشركة الراعية: ${enrollment.trainee.company.name}`, { align: 'center' });

    // توليد QR Code للتحقق
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const verifyUrl = `${protocol}://${host}/certificates.html?verify=${qrCode}`;
    
    const qrBuffer = await QRCode.toBuffer(verifyUrl, { width: 90, margin: 1 });
    
    // وضع الـ QR Code في الأسفل الأيمن
    doc.image(qrBuffer, doc.page.width - 150, doc.page.height - 150, { width: 90 });

    // بيانات الشهادة في الأسفل الأيسر
    doc.fontSize(9)
       .fillColor('#64748b')
       .text(`رقم الشهادة: ${qrCode}`, 60, doc.page.height - 120)
       .text(`تاريخ الإصدار: ${new Date(enrollment.updatedAt).toLocaleDateString('ar-SA')}`, 60, doc.page.height - 105)
       .text(`Verify online by scanning the QR code`, 60, doc.page.height - 90);

    // إنهاء وكتابة المستند
    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  getCertificates,
  issueCertificate,
  verifyCertificate,
  downloadPDFCertificate
};
