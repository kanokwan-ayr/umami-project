const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/umamiunit";
  try {
    await mongoose.connect(uri);
    console.log("✅ เชื่อมต่อ MongoDB สำเร็จ:", uri);
  } catch (err) {
    console.error("❌ เชื่อมต่อ MongoDB ไม่สำเร็จ:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
