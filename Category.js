const mongoose = require("mongoose");

// ตารางที่ 1: หมวดหมู่สินค้า
const categorySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true }, // เช่น "โชยุ", "มิโซะ"
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: "🍱" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
