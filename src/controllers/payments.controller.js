const { Payment } = require("../models/Payment");
const { Student } = require("../models/Student");
const { School } = require("../models/School");
const { getSchoolFilter } = require("../middlewares/schoolScope.middleware");
const { generateReceiptNumber } = require("../utils/receipt");
const {
  sendWhatsAppMessage,
  buildPaymentConfirmationMessage,
  buildBalanceAlertMessage,
} = require("../services/whatsapp.service");

async function computeBalance(studentId) {
  const student = await Student.findById(studentId);
  if (!student) return null;

  const paid = await Payment.aggregate([
    { $match: { studentId: student._id, status: "CONFIRMED" } },
    { $group: { _id: "$studentId", total: { $sum: "$amount" } } },
  ]);

  const totalPaid = paid[0]?.total || 0;
  const dueAmount = Math.max(student.tuitionAmount - totalPaid, 0);
  return { student, totalPaid, dueAmount };
}

async function createPayment(req, res, next) {
  try {
    const schoolId = req.user.schoolId || req.body.schoolId;
    const student = await Student.findOne({ _id: req.body.studentId, schoolId });
    if (!student) {
      return res.status(404).json({ message: "Student not found in your school." });
    }

    const school = await School.findById(schoolId);
    const receiptNumber = generateReceiptNumber(school?.code || "HC");

    const payment = await Payment.create({
      ...req.body,
      schoolId,
      cashierId: req.user.id,
      receiptNumber,
    });

    const balance = await computeBalance(student._id);

    const confirmationMessage = buildPaymentConfirmationMessage({
      parentName: student.parentName,
      studentName: `${student.firstName} ${student.lastName}`,
      amount: payment.amount,
      receiptNumber: payment.receiptNumber,
      balance: balance?.dueAmount || 0,
    });

    const parentSend = await sendWhatsAppMessage(student.parentWhatsApp, confirmationMessage);
    const directorSend = await sendWhatsAppMessage(
      process.env.DIRECTOR_WHATSAPP,
      buildBalanceAlertMessage({
        recipientName: "Direction",
        studentName: `${student.firstName} ${student.lastName}`,
        dueAmount: balance?.dueAmount || 0,
      })
    );

    return res.status(201).json({
      payment,
      notifications: {
        parent: parentSend,
        director: directorSend,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getPayments(req, res, next) {
  try {
    const payments = await Payment.find(getSchoolFilter(req))
      .populate("studentId", "firstName lastName studentCode classLevel")
      .populate("cashierId", "firstName lastName role")
      .sort({ paymentDate: -1 });
    return res.json(payments);
  } catch (error) {
    return next(error);
  }
}

async function getPaymentById(req, res, next) {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, ...getSchoolFilter(req) })
      .populate("studentId", "firstName lastName studentCode classLevel")
      .populate("cashierId", "firstName lastName role");
    if (!payment) return res.status(404).json({ message: "Payment not found." });
    return res.json(payment);
  } catch (error) {
    return next(error);
  }
}

async function updatePayment(req, res, next) {
  try {
    const payment = await Payment.findOneAndUpdate(
      { _id: req.params.id, ...getSchoolFilter(req) },
      req.body,
      { new: true, runValidators: true }
    );
    if (!payment) return res.status(404).json({ message: "Payment not found." });
    return res.json(payment);
  } catch (error) {
    return next(error);
  }
}

async function deletePayment(req, res, next) {
  try {
    const payment = await Payment.findOneAndDelete({ _id: req.params.id, ...getSchoolFilter(req) });
    if (!payment) return res.status(404).json({ message: "Payment not found." });
    return res.json({ message: "Payment deleted successfully." });
  } catch (error) {
    return next(error);
  }
}

async function getPaymentHistoryByStudent(req, res, next) {
  try {
    const student = await Student.findOne({ _id: req.params.studentId, ...getSchoolFilter(req) });
    if (!student) return res.status(404).json({ message: "Student not found." });

    const payments = await Payment.find({ studentId: student._id, status: "CONFIRMED" }).sort({
      paymentDate: -1,
    });
    const totalPaid = payments.reduce((sum, entry) => sum + entry.amount, 0);
    const dueAmount = Math.max(student.tuitionAmount - totalPaid, 0);

    return res.json({
      student,
      totalPaid,
      dueAmount,
      payments,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  getPaymentHistoryByStudent,
};
