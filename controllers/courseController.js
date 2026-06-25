const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// جلب الكورسات مع فلترة وبحث
const getCourses = async (req, res) => {
  try {
    const { search, isReal } = req.query;
    let where = {};
    if (search) {
      where.OR = [
        { courseName: { contains: search } },
        { eventName: { contains: search } },
        { company: { name: { contains: search } } }
      ];
    }
    if (isReal !== undefined) where.isRealEvent = isReal === 'true';

    const courses = await prisma.course.findMany({
      where,
      include: {
        company: { select: { name: true } },
        _count: { select: { enrollments: true } }
      },
      orderBy: { startDate: 'desc' }
    });
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// تفاصيل كورس مع قائمة المتدربين المسجلين (لصفحة الحضور)
const getCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        company: true,
        enrollments: {
          include: {
            trainee: {
              include: { company: true }
            }
          }
        }
      }
    });
    if (!course) return res.status(404).json({ success: false, message: 'الكورس غير موجود' });
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// تحديث حالة الحضور لمجموعة من المتدربين
const updateAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { attendanceData } = req.body; // [{ traineeId, status }]

    const updates = attendanceData.map(record =>
      prisma.enrollment.update({
        where: { courseId_traineeId: { courseId, traineeId: record.traineeId } },
        data: { attendanceStatus: record.status }
      })
    );
    await prisma.$transaction(updates);
    res.json({ success: true, message: 'تم حفظ الحضور' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// إنشاء كورس جديد
const createCourse = async (req, res) => {
  try {
    const data = req.body;
    const course = await prisma.course.create({ data });
    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// تحديث كورس
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const course = await prisma.course.update({ where: { id }, data });
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// حذف كورس
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.course.delete({ where: { id } });
    res.json({ success: true, message: 'تم حذف الكورس' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCourses,
  getCourseDetails,
  updateAttendance,
  createCourse,
  updateCourse,
  deleteCourse
};