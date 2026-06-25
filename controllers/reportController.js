const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// إحصائيات عامة للـ Dashboard
const getStats = async (req, res) => {
  try {
    const [
      companiesCount,
      coursesCount,
      traineesCount,
      invoicesCount,
      pendingInvoices,
      totalRevenue
    ] = await Promise.all([
      prisma.company.count(),
      prisma.course.count(),
      prisma.trainee.count(),
      prisma.invoice.count(),
      prisma.invoice.count({ where: { paymentStatus: { in: ['PENDING', 'OVERDUE'] } } }),
      prisma.invoice.aggregate({ _sum: { amount: true } })
    ]);

    res.json({
      success: true,
      stats: {
        companies: companiesCount,
        courses: coursesCount,
        trainees: traineesCount,
        invoices: invoicesCount,
        pendingInvoices,
        totalRevenue: totalRevenue._sum.amount || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// تقارير متقدمة (مثلاً: عدد المتدربين لكل كورس، الإيرادات حسب الشهر، إلخ)
const getRevenueByMonth = async (req, res) => {
  try {
    // سيتم تنفيذها حسب الطلب – مثال بسيط
    const result = await prisma.$queryRaw`
      SELECT strftime('%Y-%m', issuedAt) as month, SUM(amount) as total
      FROM invoices
      GROUP BY month
      ORDER BY month
    `;
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStats, getRevenueByMonth };