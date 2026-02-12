const { Student } = require("../models/Student");
const { Payment } = require("../models/Payment");
const { getSchoolFilter } = require("../middlewares/schoolScope.middleware");
const { sendWhatsAppMessage, buildPaymentReminderMessage } = require("../services/whatsapp.service");

async function sendDueReminders(req, res, next) {
  try {
    const students = await Student.find(getSchoolFilter(req));
    const results = [];

    for (const student of students) {
      const paidAgg = await Payment.aggregate([
        { $match: { studentId: student._id, status: "CONFIRMED" } },
        { $group: { _id: "$studentId", totalPaid: { $sum: "$amount" } } },
      ]);

      const totalPaid = paidAgg[0]?.totalPaid || 0;
      const dueAmount = Math.max(student.tuitionAmount - totalPaid, 0);
      if (dueAmount <= 0) continue;

      const body = buildPaymentReminderMessage({
        parentName: student.parentName,
        studentName: `${student.firstName} ${student.lastName}`,
        dueAmount,
      });
      const sendResult = await sendWhatsAppMessage(student.parentWhatsApp, body);
      results.push({
        studentId: student._id,
        dueAmount,
        sendResult,
      });
    }

    return res.json({
      totalNotified: results.length,
      results,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { sendDueReminders };
