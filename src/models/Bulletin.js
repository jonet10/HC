const mongoose = require("mongoose");

const bulletinSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    date: { type: Date, required: true, default: Date.now },
    filePdf: { type: String, required: true, trim: true },
    period: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["PREPARED", "SENT"],
      default: "PREPARED",
      index: true,
    },
    summary: {
      overallAverage: { type: Number, default: 0 },
      mention: { type: String, trim: true },
    },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

bulletinSchema.index({ schoolId: 1, studentId: 1, period: 1 }, { unique: true });

const Bulletin = mongoose.model("Bulletin", bulletinSchema);

module.exports = { Bulletin };
