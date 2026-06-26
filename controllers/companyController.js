const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// جلب كل الشركات مع إحصاءات
const getCompanies = async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: { courses: true, trainees: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, companies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// إضافة شركة جديدة
const createCompany = async (req, res) => {
  try {
    const { name, contactPerson, email } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'اسم الشركة مطلوب' });

    const existing = await prisma.company.findUnique({ where: { name } });
    if (existing) return res.status(409).json({ success: false, message: 'الشركة موجودة بالفعل' });

    const company = await prisma.company.create({
      data: {
        name,
        contactPerson: contactPerson || "—",
        email: email || "—"
      }
    });
    res.status(201).json({ success: true, company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// تحديث شركة
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contactPerson, email } = req.body;

    const company = await prisma.company.update({
      where: { id },
      data: {
        name,
        contactPerson: contactPerson || "—",
        email: email || "—"
      }
    });
    res.json({ success: true, company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// حذف شركة (مع حذف كل ما يرتبط بها – بحذر)
const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.company.delete({ where: { id } });
    res.json({ success: true, message: 'تم حذف الشركة' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCompanies, createCompany, updateCompany, deleteCompany };