const { Payment } = require("../models/Payment");
const { Student } = require("../models/Student");
const { getSchoolFilter } = require("../middlewares/schoolScope.middleware");

async function getDailyReport(req, res, next) {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const schoolFilter = getSchoolFilter(req);
    const payments = await Payment.find({
      ...schoolFilter,
      status: "CONFIRMED",
      paymentDate: { $gte: start, $lte: end },
    });

    const totalIncome = payments.reduce((sum, item) => sum + item.amount, 0);

    return res.json({
      date: start.toISOString().slice(0, 10),
      totalTransactions: payments.length,
      totalIncome,
      payments,
    });
  } catch (error) {
    return next(error);
  }
}

async function getFinancialSummary(req, res, next) {
  try {
    const schoolFilter = getSchoolFilter(req);
    const students = await Student.find(schoolFilter);
    const tuitionExpected = students.reduce((sum, student) => sum + student.tuitionAmount, 0);

    const paidAgg = await Payment.aggregate([
      { $match: { ...schoolFilter, status: "CONFIRMED" } },
      { $group: { _id: null, totalPaid: { $sum: "$amount" } } },
    ]);

    const totalPaid = paidAgg[0]?.totalPaid || 0;
    const totalDue = Math.max(tuitionExpected - totalPaid, 0);

    return res.json({
      tuitionExpected,
      totalPaid,
      totalDue,
      paymentRate: tuitionExpected ? Number(((totalPaid / tuitionExpected) * 100).toFixed(2)) : 0,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getDailyReport, getFinancialSummary };
