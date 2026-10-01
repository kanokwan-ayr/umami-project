const API = "/api";
let categoriesCache = [];

document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
  loadProducts();

  document.getElementById("catForm").addEventListener("submit", saveCategory);
  document.getElementById("prodForm").addEventListener("submit", saveProduct);
});

function showStatus(el, msg, ok = true) {
  const box = document.getElementById(el);
  box.textContent = msg;
  box.className = "status " + (ok ? "ok" : "err");
  setTimeout(() => (box.textContent = ""), 3000);
}

/* ===================== CATEGORIES ===================== */
async function loadCategories() {
  const res = await fetch(`${API}/categories`);
  categoriesCache = await res.json();
  renderCategoryTable();
  fillCategorySelect();
}

function renderCategoryTable() {
  const body = document.getElementById("catTableBody");
  body.innerHTML = categoriesCache
    .map(
      (c) => `
    <tr>
      <td>${c.icon}</td>
      <td>${c.key}</td>
      <td>${c.name}</td>
      <td class="actions">
        <button class="btn-edit" onclick="editCategory('${c._id}')">แก้ไข</button>
        <button class="btn-del" onclick="deleteCategory('${c._id}')">ลบ</button>
      </td>
    </tr>`
    )
    .join("");
}

function fillCategorySelect() {
  const sel = document.getElementById("prodCategory");
  sel.innerHTML = categoriesCache
    .map((c) => `<option value="${c._id}">${c.icon} ${c.name}</option>`)
    .join("");
}

async function saveCategory(e) {
  e.preventDefault();
  const id = document.getElementById("catId").value;
  const payload = {
    key: document.getElementById("catKey").value.trim(),
    name: document.getElementById("catName").value.trim(),
    icon: document.getElementById("catIcon").value.trim(),
  };
  try {
    const res = await fetch(`${API}/categories/${id ? id : ""}`, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    showStatus("catStatus", id ? "แก้ไขหมวดหมู่สำเร็จ" : "เพิ่มหมวดหมู่สำเร็จ");
    resetCategoryForm();
    await loadCategories();
    await loadProducts();
  } catch (err) {
    showStatus("catStatus", err.message, false);
  }
}

function editCategory(id) {
  const c = categoriesCache.find((x) => x._id === id);
  if (!c) return;
  document.getElementById("catId").value = c._id;
  document.getElementById("catKey").value = c.key;
  document.getElementById("catName").value = c.name;
  document.getElementById("catIcon").value = c.icon;
  document.getElementById("catSubmitBtn").textContent = "💾 บันทึกการแก้ไข";
}

function resetCategoryForm() {
  document.getElementById("catForm").reset();
  document.getElementById("catId").value = "";
  document.getElementById("catSubmitBtn").textContent = "+ เพิ่มหมวดหมู่";
}

async function deleteCategory(id) {
  if (!confirm("ยืนยันลบหมวดหมู่นี้?")) return;
  try {
    const res = await fetch(`${API}/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    showStatus("catStatus", "ลบสำเร็จ");
    await loadCategories();
  } catch (err) {
    showStatus("catStatus", err.message, false);
  }
}

/* ===================== PRODUCTS ===================== */
async function loadProducts() {
  const res = await fetch(`${API}/products`);
  const products = await res.json();
  const body = document.getElementById("prodTableBody");
  body.innerHTML = products
    .map(
      (p) => `
    <tr>
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.category ? p.category.icon + " " + p.category.name : "-"}</td>
      <td>฿${p.price}</td>
      <td class="actions">
        <button class="btn-edit" onclick='editProduct(${JSON.stringify(p)})'>แก้ไข</button>
        <button class="btn-del" onclick="deleteProduct('${p._id}')">ลบ</button>
      </td>
    </tr>`
    )
    .join("");
}

async function saveProduct(e) {
  e.preventDefault();
  const mongoId = document.getElementById("prodMongoId").value;
  const payload = {
    id: Number(document.getElementById("prodId").value),
    name: document.getElementById("prodName").value.trim(),
    brand: document.getElementById("prodBrand").value.trim(),
    category: document.getElementById("prodCategory").value,
    price: Number(document.getElementById("prodPrice").value),
    size: document.getElementById("prodSize").value.trim(),
    icon: document.getElementById("prodIcon").value.trim() || "🥢",
    image: document.getElementById("prodImage").value.trim(),
    description: document.getElementById("prodDesc").value.trim(),
  };
  try {
    const res = await fetch(`${API}/products/${mongoId ? mongoId : ""}`, {
      method: mongoId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    showStatus("prodStatus", mongoId ? "แก้ไขสินค้าสำเร็จ" : "เพิ่มสินค้าสำเร็จ");
    resetProductForm();
    await loadProducts();
  } catch (err) {
    showStatus("prodStatus", err.message, false);
  }
}

function editProduct(p) {
  document.getElementById("prodMongoId").value = p._id;
  document.getElementById("prodId").value = p.id;
  document.getElementById("prodName").value = p.name;
  document.getElementById("prodBrand").value = p.brand;
  document.getElementById("prodCategory").value = p.category?._id || "";
  document.getElementById("prodPrice").value = p.price;
  document.getElementById("prodSize").value = p.size;
  document.getElementById("prodIcon").value = p.icon;
  document.getElementById("prodImage").value = p.image;
  document.getElementById("prodDesc").value = p.description;
  document.getElementById("prodSubmitBtn").textContent = "💾 บันทึกการแก้ไข";
}

function resetProductForm() {
  document.getElementById("prodForm").reset();
  document.getElementById("prodMongoId").value = "";
  document.getElementById("prodSubmitBtn").textContent = "+ เพิ่มสินค้า";
}

async function deleteProduct(id) {
  if (!confirm("ยืนยันลบสินค้านี้?")) return;
  try {
    const res = await fetch(`${API}/products/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    showStatus("prodStatus", "ลบสำเร็จ");
    await loadProducts();
  } catch (err) {
    showStatus("prodStatus", err.message, false);
  }
}
