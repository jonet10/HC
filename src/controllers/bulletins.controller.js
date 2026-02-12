const fs = require("fs");
const path = require("path");
const { Bulletin } = require("../models/Bulletin");
const { Grade } = require("../models/Grade");
const { School } = require("../models/School");
const { Student } = require("../models/Student");
const { ROLES } = require("../constants/roles");
const { getSchoolFilter } = require("../middlewares/schoolScope.middleware");
const { calculateBulletinMetrics, generateBulletinPdf } = require("../services/bulletin.service");
const { sendWhatsAppMediaMessage } = require("../services/whatsapp.service");

function resolveBulletinAccessFilter(req) {
  const schoolFilter = getSchoolFilter(req);
  if (req.user.role === ROLES.PARENT || req.user.role === ROLES.STUDENT) {
    return {
      ...schoolFilter,
      studentId: req.user.linkedStudentId,
      status: "SENT",
    };
  }
  return schoolFilter;
}

async function generateBulletin(req, res, next) {
  try {
    const schoolId = req.user.schoolId || req.body.schoolId;
    const { studentId, period } = req.body;

    const [student, school] = await Promise.all([
      Student.findOne({ _id: studentId, schoolId }),
      School.findById(schoolId),
    ]);
    if (!student) return res.status(404).json({ message: "Student not found in your school." });

    const grades = await Grade.find({ schoolId, studentId, period }).sort({ subject: 1, createdAt: 1 });
    if (grades.length === 0) {
      return res.status(400).json({ message: "No grades found for this student and period." });
    }

    const metrics = calculateBulletinMetrics(grades);
    const generatedAt = new Date();
    const fileName = `${student.studentCode}-${period.replace(/\s+/g, "_")}-${Date.now()}.pdf`;
    const relativePdfPath = path.join("bulletins", fileName);
    const absolutePdfPath = path.join(process.cwd(), "storage", relativePdfPath);

    await generateBulletinPdf({
      schoolName: school?.name,
      student,
      period,
      generatedAt,
      metrics,
      outputPath: absolutePdfPath,
    });

    const bulletin = await Bulletin.findOneAndUpdate(
      { schoolId, studentId, period },
      {
        schoolId,
        studentId,
        period,
        date: generatedAt,
        filePdf: relativePdfPath.replace(/\\/g, "/"),
        status: "PREPARED",
        summary: {
          overallAverage: metrics.overallAverage,
          mention: metrics.mention,
        },
        generatedBy: req.user.id,
        sentAt: null,
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(201).json({
      bulletin,
      metrics,
      pdfUrl: `/public/${bulletin.filePdf}`,
    });
  } catch (error) {
    return next(error);
  }
}

async function listBulletins(req, res, next) {
  try {
    const filters = { ...resolveBulletinAccessFilter(req) };
    if (req.query.studentId && req.user.role !== ROLES.PARENT && req.user.role !== ROLES.STUDENT) {
      filters.studentId = req.query.studentId;
    }
    if (req.query.period) filters.period = req.query.period;
    if (req.query.status) filters.status = req.query.status;

    const bulletins = await Bulletin.find(filters)
      .populate("studentId", "firstName lastName studentCode classLevel parentName parentWhatsApp")
      .populate("generatedBy", "firstName lastName role")
      .sort({ date: -1 });

    return res.json(bulletins);
  } catch (error) {
    return next(error);
  }
}

async function getBulletinById(req, res, next) {
  try {
    const bulletin = await Bulletin.findOne({ _id: req.params.id, ...resolveBulletinAccessFilter(req) })
      .populate("studentId", "firstName lastName studentCode classLevel parentName parentWhatsApp")
      .populate("generatedBy", "firstName lastName role");
    if (!bulletin) return res.status(404).json({ message: "Bulletin not found." });
    return res.json(bulletin);
  } catch (error) {
    return next(error);
  }
}

async function exportBulletinPdf(req, res, next) {
  try {
    const bulletin = await Bulletin.findOne({ _id: req.params.id, ...resolveBulletinAccessFilter(req) });
    if (!bulletin) return res.status(404).json({ message: "Bulletin not found." });

    const absolutePath = path.join(process.cwd(), "storage", bulletin.filePdf);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: "PDF file not found on server." });
    }
    return res.download(absolutePath);
  } catch (error) {
    return next(error);
  }
}

async function sendBulletinWhatsApp(req, res, next) {
  try {
    const bulletin = await Bulletin.findOne({ _id: req.params.id, ...getSchoolFilter(req) }).populate(
      "studentId",
      "firstName lastName parentName parentWhatsApp"
    );
    if (!bulletin) return res.status(404).json({ message: "Bulletin not found." });
    if (!bulletin.studentId?.parentWhatsApp) {
      return res.status(400).json({ message: "Parent WhatsApp number is missing for this student." });
    }

    const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
    const mediaUrl = `${baseUrl}/public/${bulletin.filePdf}`;
    const body = `Bonjour ${bulletin.studentId.parentName}, le bulletin final de ${bulletin.studentId.firstName} ${bulletin.studentId.lastName} (${bulletin.period}) est disponible.`;
    const sendResult = await sendWhatsAppMediaMessage(bulletin.studentId.parentWhatsApp, body, mediaUrl);

    bulletin.status = "SENT";
    bulletin.sentAt = new Date();
    await bulletin.save();

    return res.json({
      message: "Bulletin sent to parent via WhatsApp.",
      bulletin,
      sendResult,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  generateBulletin,
  listBulletins,
  getBulletinById,
  exportBulletinPdf,
  sendBulletinWhatsApp,
};
