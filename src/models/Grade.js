const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    professorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, required: true, trim: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    coefficient: { type: Number, required: true, min: 1, max: 20, default: 1 },
    period: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

gradeSchema.index({ schoolId: 1, studentId: 1, subject: 1, period: 1, professorId: 1 });

const Grade = mongoose.model("Grade", gradeSchema);

module.exports = { Grade };
