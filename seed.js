require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Category = require("./models/Category");
const Product = require("./models/Product");

const categoriesData = [
  { key: "โชยุ", name: "โชยุ", icon: "🥣" },
  { key: "เส้น", name: "เส้น", icon: "🍜" },
  { key: "น้ำส้มสายชู", name: "น้ำส้มสายชู", icon: "🍶" },
  { key: "วาซาบิ", name: "วาซาบิ", icon: "🌿" },
  { key: "มิโซะ", name: "มิโซะ", icon: "🥜" },
  { key: "น้ำซุป", name: "น้ำซุป", icon: "🍲" },
  { key: "อื่นๆ", name: "อื่น ๆ", icon: "🥢" },
];

const productsData = [
  { id: 1, name: "โชยุญี่ปุ่น UMAMI", brand: "UMAMI", category: "โชยุ", price: 79, size: "150 มล.", icon: "🥣", image: "./images/1.png", description: "ซอสถั่วเหลืองหมักบ่มธรรมชาติสูตรต้นตำรับ ให้รสชาติอูมามิกลมกล่อม เหมาะสำหรับจิ้มซูชิ ซาชิมิ" },
  { id: 2, name: "โชยุญี่ปุ่น UMAMI ขวดใหญ่", brand: "UMAMI", category: "โชยุ", price: 129, size: "500 มล.", icon: "🥣", image: "./images/2.png", description: "โชยุขนาดจุใจสำหรับครัวครอบครัว รสชาติเข้มข้น หอมละมุน ใช้งานได้สารพัดเมนู" },
  { id: 3, name: "โชยุญี่ปุ่นสูตรเข้มข้น", brand: "YAMASA", category: "โชยุ", price: 189, size: "500 มล.", icon: "🫙", image: "./images/3.png", description: "โชยุเกรดพรีเมียม สูตรพิเศษสีสันสวยงาม รสเข้มข้นลึกซึ้ง เหมาะสำหรับเมนูยากินิกุ" },
  { id: 4, name: "มิโซะญี่ปุ่นสูตรดั้งเดิม", brand: "UMAMI", category: "มิโซะ", price: 99, size: "300 กรัม", icon: "🥜", image: "./images/4.png", description: "เต้าเจี้ยวบดหมักธรรมชาติ กลิ่นหอมเป็นเอกลักษณ์ ทำซุปมิโซะร้อน ๆ สไตล์ญี่ปุ่น" },
  { id: 5, name: "มิโซะขาวญี่ปุ่น", brand: "KIKKOMAN", category: "มิโซะ", price: 149, size: "500 กรัม", icon: "🥜", image: "./images/5.png", description: "มิโซะขาวรสละมุน หวานธรรมชาติจากข้าวหมัก เหมาะสำหรับทำซุปและหมักปลา" },
  { id: 6, name: "วาซาบิญี่ปุ่นแท้", brand: "UMAMI", category: "วาซาบิ", price: 89, size: "43 กรัม", icon: "🌿", image: "./images/6.png", description: "วาซาบิบดสด กลิ่นหอมฉุนขึ้นจมูกกำลังดี ชูรสชาติปลาดิบได้อย่างลงตัว" },
  { id: 7, name: "วาซาบิแบบหลอด", brand: "UMAMI", category: "วาซาบิ", price: 119, size: "80 กรัม", icon: "🌿", image: "./images/7.png", description: "วาซาบิหลอดพกพาสะดวก บีบใช้ง่าย รสชาติเผ็ดร้อนจัดจ้าน" },
  { id: 8, name: "เส้นอุด้งญี่ปุ่น", brand: "UMAMI", category: "เส้น", price: 65, size: "200 กรัม", icon: "🍜", image: "./images/8.png", description: "เส้นอุด้งเหนียวนุ่ม หนึบหนับ ผลิตจากแป้งสาลีคุณภาพสูง อร่อยทั้งแบบต้มและผัด" },
  { id: 9, name: "เส้นราเมนญี่ปุ่น", brand: "UMAMI", category: "เส้น", price: 79, size: "180 กรัม", icon: "🍜", image: "./images/9.png", description: "เส้นราเมนสด เหนียวนุ่ม เด้งสู้ฟัน อุ้มน้ำซุปได้ดีเยี่ยม" },
  { id: 10, name: "น้ำซุปดาชิญี่ปุ่น", brand: "MARUTOMO", category: "น้ำซุป", price: 119, size: "500 มล.", icon: "🍲", image: "./images/10.png", description: "หัวน้ำซุปปลาคัตสึโอะและสาหร่ายคอมบุสกัดเข้มข้น หัวใจสำคัญของอาหารญี่ปุ่น" },
  { id: 11, name: "น้ำซุปสุกี้ยากี้", brand: "UMAMI", category: "น้ำซุป", price: 159, size: "500 มล.", icon: "🍲", image: "./images/11.png", description: "น้ำซุปดำสุกี้ยากี้ รสหวานเค็มกลมกล่อม พร้อมเสิร์ฟเมนูหม้อไฟสุดฟิน" },
  { id: 12, name: "น้ำส้มสายชูข้าวญี่ปุ่น", brand: "MIZKAN", category: "น้ำส้มสายชู", price: 135, size: "500 มล.", icon: "🍶", image: "./images/12.png", description: "น้ำส้มสายชูหมักจากข้าวญี่ปุ่นแท้ รสเปรี้ยวกลมกล่อม เหมาะทำข้าวซูชิและผักดอง" },
  { id: 13, name: "น้ำมันงาญี่ปุ่น", brand: "KIKKOMAN", category: "อื่นๆ", price: 179, size: "250 มล.", icon: "🫙", image: "./images/13.png", description: "น้ำมันงาบริสุทธิ์ 100% สกัดจากงาคั่วหอมกรุ่น เพิ่มมิติความหอมให้กับทุกจาน" },
  { id: 14, name: "งาขาวคั่วญี่ปุ่น", brand: "UMAMI", category: "อื่นๆ", price: 69, size: "100 กรัม", icon: "🌰", image: "./images/14.png", description: "งาขาวคั่วหอมใหม่ เมล็ดอวบสวย เหมาะสำหรับโรยหน้าข้าวและราเมน" },
  { id: 15, name: "ขิงดองญี่ปุ่น", brand: "UMAMI", category: "อื่นๆ", price: 89, size: "200 กรัม", icon: "🥢", image: "./images/15.png", description: "ขิงดองสีชมพูอ่อน รสหวานอมเปรี้ยว สดชื่น ตัดเลี่ยนได้ยอดเยี่ยม" },
  { id: 16, name: "สาเก เหล้าสำหรับปรุงรสอาหาร", brand: "KEWPIE", category: "อื่นๆ", price: 515, size: "4 ลิตร.", icon: "🍶", image: "./images/16.png", description: "เหล้าสาเกสำหรับทำอาหารโดยเฉพาะ ช่วยให้เนื้อสัตว์นุ่ม หอม และดึงรสอูมามิออกมาเต็มที่" },
  { id: 17, name: "ฮอนเทริมิริน", brand: "MARUTOMO", category: "อื่นๆ", price: 330, size: "1 ลิตร.", icon: "🍶", image: "./images/17.png", description: "ซอสปรุงรสสไตล์ญี่ปุ่นที่มีรสหวานละมุนและกลิ่นหอมจากข้าวหมัก ช่วยเพิ่มความกลมกล่อม" },
  { id: 18, name: "ซอสทงคัตสึเข้มข้น", brand: "BULL-DOG", category: "อื่นๆ", price: 275, size: "1.8 ลิตร.", icon: "🥫", image: "./images/18.png", description: "ซอสราดของทอดสูตรต้นตำรับญี่ปุ่น เคี่ยวจากผักและผลไม้ รสเปรี้ยวอมหวานเข้มข้น" },
  { id: 19, name: "ซอสเทอริยากิกระทะร้อน", brand: "YAMASA", category: "โชยุ", price: 280, size: "2 ลิตร.", icon: "🥣", image: "./images/19.png", description: "ซอสเทอริยากิรสชาติหวานเค็มกำลังดี เหมาะสำหรับทำไก่เทอริยากิ แซลมอนย่างซีอิ๊ว" },
  { id: 20, name: "น้ำสลัดงาคั่วสไตล์ญี่ปุ่น", brand: "KEWPIE", category: "อื่นๆ", price: 79, size: "210 มล.", icon: "🥗", image: "./images/20.png", description: "น้ำสลัดงาคั่วบดละเอียด หอมกลิ่นงาคั่ว รสชาติเปรี้ยวหวานมัน ทานคู่กับสลัดผักหรือชาบู" },
  { id: 21, name: "ซอสยากิโซบะเข้มข้น", brand: "OTAFUKU", category: "อื่นๆ", price: 245, size: "500 กรัม", icon: "🥫", image: "./images/21.png", description: "ซอสสำหรับผัดเส้นยากิโซบะและโอโคโนมิยากิ รสชาติเข้มข้น หอมกลิ่นเครื่องเทศญี่ปุ่น" },
  { id: 22, name: "สาหร่ายวากาเมะอบแห้ง", brand: "UMAMI", category: "อื่นๆ", price: 179, size: "500 กรัม", icon: "🥬", image: "./images/22.png", description: "วากาเมะตัดแต่งพร้อมใช้ แค่แช่น้ำ 3-5 นาทีก็ขยายตัว เหมาะสำหรับใส่ซุปมิโซะและยำสาหร่าย" },
  { id: 23, name: "ฮอนซึยุ คาโรอิชิโรดาชิ ซุปปลาแห้ง", brand: "KIKKOMAN", category: "อื่นๆ", price: 173, size: "500 มล.", icon: "🐟", image: "./images/23.png", description: "ซุปดาชิเข้มข้น ชนิดสีอ่อน รวมปลาโบนิโตแห้งและเครื่องปรุงพื้นฐาน" },
  { id: 24, name: "ก้อนแกงกะหรี่ญี่ปุ่น เผ็ดกลาง", brand: "UMAMI", category: "น้ำซุป", price: 330, size: "220 กรัม", icon: "🍛", image: "./images/24.png", description: "ก้อนแกงกะหรี่เข้มข้น ละลายง่าย หอมเครื่องเทศสูตรเฉพาะ ทำทานเองได้ง่าย ๆ" },
  { id: 25, name: "เส้นโซบะผสมชาเขียว", brand: "NISSHIN", category: "เส้น", price: 69, size: "200 กรัม", icon: "🍜", image: "./images/25.png", description: "ทำจากแป้งบักวีตกับชาเขียว เส้นเหนียวนุ่ม มีกลิ่นหอมใบชา" },
  { id: 26, name: "ซุปปรุงรส ทงคัตซึราเมน", brand: "NIPPON", category: "น้ำซุป", price: 239, size: "500 มล.", icon: "🍲", image: "./images/26.png", description: "น้ำซุปทงคตสึเคี่ยวจากกระดูกหมูเข้มข้นเต็มรสชาติ ส่งตรงจากญี่ปุ่น" },
  { id: 27, name: "ผงโรยข้าวรสไข่หอยเม่น", brand: "NIHON KAIS", category: "อื่นๆ", price: 135, size: "35 กรัม", icon: "🍚", image: "./images/27.png", description: "ฟูริคาเกะผงโรยข้าวสูตรยอดนิยม เพิ่มรสชาติและความกรุบกรอบ" },
  { id: 28, name: "แป้งเทมปุระกรอบเบา", brand: "MARUTOMO", category: "อื่นๆ", price: 89, size: "450 กรัม", icon: "🍤", image: "./images/28.png", description: "แป้งชุบทอดสไตล์ญี่ปุ่น แป้งบาง กรอบนาน ไม่อมน้ำมัน" },
  { id: 29, name: "น้ำซุปไพตัน ซีฟู๊ด เข้มข้น", brand: "YAMASA", category: "น้ำซุป", price: 370, size: "1.2 ลิตร", icon: "🍲", image: "./images/29.png", description: "รสชาติเข้มข้นลึกซึ้ง เหมาะสำหรับทำซุปหม้อไฟนาเบะและสตูว์เนื้อ" },
  { id: 30, name: "พริกญี่ปุ่นผสม", brand: "NISSHIN", category: "วาซาบิ", price: 61, size: "15 กรัม", icon: "🌶️", image: "./images/30.png", description: "เครื่องปรุงรสจากเครื่องเทศหลายชนิดป่นรวมกัน นิยมใช้โรยบนน้ำซุปอุด้ง" },
];

async function seed() {
  await connectDB();

  console.log("🧹 ล้างข้อมูลเดิม...");
  await Product.deleteMany({});
  await Category.deleteMany({});

  console.log("📁 เพิ่มหมวดหมู่...");
  const insertedCategories = await Category.insertMany(categoriesData);
  const keyToId = Object.fromEntries(insertedCategories.map((c) => [c.key, c._id]));

  console.log("📦 เพิ่มสินค้า (ผูกความสัมพันธ์กับหมวดหมู่)...");
  const productsWithRefs = productsData.map((p) => ({
    ...p,
    category: keyToId[p.category], // แปลง key เป็น ObjectId ที่อ้างอิงจริง
  }));
  await Product.insertMany(productsWithRefs);

  console.log(`✅ เสร็จแล้ว: ${insertedCategories.length} หมวดหมู่, ${productsWithRefs.length} สินค้า`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ seed ล้มเหลว:", err);
  process.exit(1);
});
