const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    studentCode: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    classLevel: { type: String, required: true, trim: true },
    tuitionAmount: { type: Number, required: true, min: 0 },
    parentName: { type: String, required: true, trim: true },
    parentPhone: { type: String, trim: true },
    parentWhatsApp: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

studentSchema.index({ schoolId: 1, studentCode: 1 }, { unique: true });

const Student = mongoose.model("Student", studentSchema);

module.exports = { Student };
