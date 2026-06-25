const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTrainees = async (req, res) => {
  try {
    const trainees = await prisma.trainee.findMany({
      include: {
        company: { select: { name: true } },
        enrollments: {
          include: {
            course: {
              include: {
                invoices: {
                  select: { paymentStatus: true }
                }
              }
            }
          }
        }
      },
      orderBy: { fullName: 'asc' }
    });

    // 🔥 تحويل البيانات إلى هيكل مسطح (flat) يسهل على الواجهة الأمامية استخدامه
    const formattedTrainees = trainees.map(trainee => {
      // افترض أن المتدرب لديه تسجيل واحد فقط (آخر تسجيل)
      const latestEnrollment = trainee.enrollments?.[0] || null;

      // الحصول على حالة الدفع من الفاتورة
      let paymentStatus = 'N/A';
      if (latestEnrollment?.course?.invoices?.length > 0) {
        paymentStatus = latestEnrollment.course.invoices[0].paymentStatus;
      }

      return {
        id: trainee.id,
        idNo: trainee.idNo || 'N/A',
        fullName: trainee.fullName,
        companyName: trainee.company?.name || 'N/A',
        courseName: latestEnrollment?.course?.courseName ||
          latestEnrollment?.course?.name ||
          'Not enrolled',
        attendanceStatus: latestEnrollment?.attendanceStatus || 'Not enrolled',
        paymentStatus: paymentStatus,
        // احتفظ بالبيانات الأصلية للاستخدامات الأخرى
        raw: trainee
      };
    });

    res.json({ success: true, trainees: formattedTrainees });
  } catch (error) {
    console.error('Error in getTrainees:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const createTrainee = async (req, res) => {
  try {
    const { fullName, idNo, email, phone, companyId } = req.body;
    if (!fullName || !companyId) {
      return res.status(400).json({ success: false, message: 'الاسم والشركة مطلوبان' });
    }
    const trainee = await prisma.trainee.create({
      data: { fullName, idNo, email, phone, companyId }
    });
    res.status(201).json({ success: true, trainee });
  } catch (error) {
    console.error('Error in createTrainee:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTrainee = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const trainee = await prisma.trainee.update({ where: { id }, data });
    res.json({ success: true, trainee });
  } catch (error) {
    console.error('Error in updateTrainee:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTrainee = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.trainee.delete({ where: { id } });
    res.json({ success: true, message: 'تم حذف المتدرب' });
  } catch (error) {
    console.error('Error in deleteTrainee:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTrainees, createTrainee, updateTrainee, deleteTrainee };