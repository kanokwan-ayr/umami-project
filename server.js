require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// เสิร์ฟหน้าเว็บ (frontend) จากโฟลเดอร์ public
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

// health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 เซิร์ฟเวอร์ทำงานที่ http://localhost:${PORT}`);
  });
});
