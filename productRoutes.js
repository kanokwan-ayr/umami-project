const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET /api/products - ดูสินค้าทั้งหมด (รองรับ ?category=<key> เพื่อกรองตามหมวดหมู่)
// .populate("category") คือการดึงข้อมูล Category ที่สัมพันธ์กันมาด้วยในคำตอบเดียว
router.get("/", async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "key name icon")
      .sort({ id: 1 });

    const filtered = req.query.category
      ? products.filter((p) => p.category?.key === req.query.category)
      : products;

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/:id - ดูสินค้าชิ้นเดียว (ตาม MongoDB _id)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "key name icon"
    );
    if (!product) return res.status(404).json({ message: "ไม่พบสินค้านี้" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products - เพิ่มสินค้าใหม่
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    const populated = await product.populate("category", "key name icon");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/products/:id - แก้ไขสินค้า
router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("category", "key name icon");
    if (!product) return res.status(404).json({ message: "ไม่พบสินค้านี้" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/products/:id - ลบสินค้า
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "ไม่พบสินค้านี้" });
    res.json({ message: "ลบสินค้าสำเร็จ" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
