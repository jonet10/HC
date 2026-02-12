const { Student } = require("../models/Student");
const { Payment } = require("../models/Payment");
const { getSchoolFilter } = require("../middlewares/schoolScope.middleware");

async function createStudent(req, res, next) {
  try {
    const schoolId = req.user.schoolId || req.body.schoolId;
    const student = await Student.create({ ...req.body, schoolId });
    return res.status(201).json(student);
  } catch (error) {
    return next(error);
  }
}

async function getStudents(req, res, next) {
  try {
    const students = await Student.find(getSchoolFilter(req)).sort({ createdAt: -1 });
    return res.json(students);
  } catch (error) {
    return next(error);
  }
}

async function getStudentById(req, res, next) {
  try {
    const student = await Student.findOne({ _id: req.params.id, ...getSchoolFilter(req) });
    if (!student) return res.status(404).json({ message: "Student not found." });
    return res.json(student);
  } catch (error) {
    return next(error);
  }
}

async function updateStudent(req, res, next) {
  try {
    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, ...getSchoolFilter(req) },
      req.body,
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ message: "Student not found." });
    return res.json(student);
  } catch (error) {
    return next(error);
  }
}

async function deleteStudent(req, res, next) {
  try {
    const student = await Student.findOneAndDelete({ _id: req.params.id, ...getSchoolFilter(req) });
    if (!student) return res.status(404).json({ message: "Student not found." });
    return res.json({ message: "Student deleted successfully." });
  } catch (error) {
    return next(error);
  }
}

async function getStudentBalance(req, res, next) {
  try {
    const student = await Student.findOne({ _id: req.params.id, ...getSchoolFilter(req) });
    if (!student) return res.status(404).json({ message: "Student not found." });

    const paidAggregation = await Payment.aggregate([
      { $match: { studentId: student._id, status: "CONFIRMED" } },
      { $group: { _id: "$studentId", totalPaid: { $sum: "$amount" } } },
    ]);

    const totalPaid = paidAggregation[0]?.totalPaid || 0;
    const dueAmount = Math.max(student.tuitionAmount - totalPaid, 0);

    return res.json({
      studentId: student._id,
      tuitionAmount: student.tuitionAmount,
      totalPaid,
      dueAmount,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentBalance,
};
