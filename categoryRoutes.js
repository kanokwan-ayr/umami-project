const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const Product = require("../models/Product");

// GET /api/categories - ดูหมวดหมู่ทั้งหมด
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/categories/:id - ดูหมวดหมู่เดียว
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "ไม่พบหมวดหมู่นี้" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/categories - เพิ่มหมวดหมู่ใหม่
router.post("/", async (req, res) => {
  try {
    const { key, name, icon } = req.body;
    const category = await Category.create({ key, name, icon });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/categories/:id - แก้ไขหมวดหมู่
router.put("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ message: "ไม่พบหมวดหมู่นี้" });
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/categories/:id - ลบหมวดหมู่
// ป้องกันการลบหมวดหมู่ที่ยังมีสินค้าผูกอยู่ (เพื่อรักษาความสัมพันธ์ของข้อมูล)
router.delete("/:id", async (req, res) => {
  try {
    const inUse = await Product.exists({ category: req.params.id });
    if (inUse) {
      return res
        .status(400)
        .json({ message: "ลบไม่ได้ เนื่องจากยังมีสินค้าที่อยู่ในหมวดหมู่นี้" });
    }
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "ไม่พบหมวดหมู่นี้" });
    res.json({ message: "ลบหมวดหมู่สำเร็จ" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
