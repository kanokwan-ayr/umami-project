const mongoose = require("mongoose");

// ตารางที่ 2: สินค้า
// field "category" คือความสัมพันธ์ (relationship) แบบ 1 หมวดหมู่ : หลายสินค้า
// อ้างอิงไปยัง _id ของเอกสารใน collection Category (คล้าย foreign key)
const productSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true }, // id เดิมของหน้าเว็บ (ใช้อ้างอิงใน frontend)
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    size: { type: String, default: "" },
    icon: { type: String, default: "🥢" },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
