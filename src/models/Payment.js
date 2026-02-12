const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    cashierId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date, default: Date.now },
    method: {
      type: String,
      enum: ["CASH", "BANK_TRANSFER", "MOBILE_MONEY", "CARD"],
      default: "CASH",
    },
    reference: { type: String, trim: true },
    notes: { type: String, trim: true },
    receiptNumber: { type: String, required: true, unique: true },
    status: { type: String, enum: ["CONFIRMED", "CANCELLED"], default: "CONFIRMED" },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = { Payment };
