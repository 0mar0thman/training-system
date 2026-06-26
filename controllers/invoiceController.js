const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getInvoices = async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        company: { select: { name: true } },
        course: { select: { courseName: true } },
      },
      orderBy: { issuedAt: "desc" },
    });
    res.json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createInvoice = async (req, res) => {
  try {
    const data = req.body;
    const invoiceData = {
      ...data,
      amount: parseFloat(data.amount),
      issuedAt: data.issuedAt ? new Date(data.issuedAt) : new Date(),
    };
    const invoice = await prisma.invoice.create({ data: invoiceData });
    res.status(201).json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateInvoicePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paidAt } = req.body;
    const invoice = await prisma.invoice.update({
      where: { id },
      data: { paymentStatus, paidAt },
    });
    res.json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { poNumber, amount, paymentStatus, companyId, courseId } = req.body;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        poNumber,
        amount: parseFloat(amount) || 0,
        paymentStatus,
        companyId,
        courseId: courseId || null,
        paidAt: paymentStatus === "PAID" ? new Date() : null,
      },
    });
    res.json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.invoice.delete({ where: { id } });
    res.json({ success: true, message: "تم حذف الفاتورة بنجاح" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getInvoices,
  createInvoice,
  updateInvoicePayment,
  updateInvoice,
  deleteInvoice,
};