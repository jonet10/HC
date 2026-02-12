const { Grade } = require("../models/Grade");
const { Student } = require("../models/Student");
const { ROLES } = require("../constants/roles");
const { getSchoolFilter } = require("../middlewares/schoolScope.middleware");

function getGradeAccessFilter(req) {
  const schoolFilter = getSchoolFilter(req);
  if (req.user.role === ROLES.TEACHER) {
    return { ...schoolFilter, professorId: req.user.id };
  }
  return schoolFilter;
}

async function createGrade(req, res, next) {
  try {
    const schoolId = req.user.schoolId || req.body.schoolId;
    const student = await Student.findOne({ _id: req.body.studentId, schoolId });
    if (!student) return res.status(404).json({ message: "Student not found in your school." });

    const professorId = req.user.role === ROLES.TEACHER ? req.user.id : req.body.professorId;
    if (!professorId) {
      return res.status(400).json({ message: "professorId is required for non-teacher users." });
    }

    const grade = await Grade.create({
      schoolId,
      studentId: req.body.studentId,
      professorId,
      subject: req.body.subject,
      score: req.body.score,
      coefficient: req.body.coefficient,
      period: req.body.period,
    });
    return res.status(201).json(grade);
  } catch (error) {
    return next(error);
  }
}

async function getGrades(req, res, next) {
  try {
    const filters = { ...getGradeAccessFilter(req) };
    if (req.query.studentId) filters.studentId = req.query.studentId;
    if (req.query.period) filters.period = req.query.period;
    if (req.query.subject) filters.subject = req.query.subject;

    const grades = await Grade.find(filters)
      .populate("studentId", "firstName lastName studentCode classLevel")
      .populate("professorId", "firstName lastName role")
      .sort({ createdAt: -1 });

    return res.json(grades);
  } catch (error) {
    return next(error);
  }
}

async function getGradeById(req, res, next) {
  try {
    const grade = await Grade.findOne({ _id: req.params.id, ...getGradeAccessFilter(req) })
      .populate("studentId", "firstName lastName studentCode classLevel")
      .populate("professorId", "firstName lastName role");
    if (!grade) return res.status(404).json({ message: "Grade not found." });
    return res.json(grade);
  } catch (error) {
    return next(error);
  }
}

async function updateGrade(req, res, next) {
  try {
    const grade = await Grade.findOneAndUpdate(
      { _id: req.params.id, ...getGradeAccessFilter(req) },
      req.body,
      { new: true, runValidators: true }
    );
    if (!grade) return res.status(404).json({ message: "Grade not found." });
    return res.json(grade);
  } catch (error) {
    return next(error);
  }
}

async function deleteGrade(req, res, next) {
  try {
    const grade = await Grade.findOneAndDelete({ _id: req.params.id, ...getGradeAccessFilter(req) });
    if (!grade) return res.status(404).json({ message: "Grade not found." });
    return res.json({ message: "Grade deleted successfully." });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createGrade,
  getGrades,
  getGradeById,
  updateGrade,
  deleteGrade,
};
