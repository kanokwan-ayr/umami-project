/* ================= PRODUCT DATA (จาก MongoDB ผ่าน REST API) ================= */
// เดิมข้อมูลเหล่านี้เป็น array hardcode ไว้ในไฟล์
// ตอนนี้ดึงมาจากฐานข้อมูล MongoDB ผ่าน Express API แทน (ดู server.js / routes/*.js)
const API_BASE = "/api";

let categories = [{ key: "all", name: "สินค้าทั้งหมด", icon: "🍱" }];
let products = [];
let displayed = [], cart = [], favorites = [], curCat = "all", curBrand = "", searchTxt = "", msgTimer = null;
let currentPage = 1;
const itemsPerPage = 8;

/* ================= APP INITIALIZATION ================= */
document.addEventListener("DOMContentLoaded", async () => {
    await loadDataFromAPI();
    initCategories();
    displayed = [...products];
    renderProducts();
    setupEvents();
});

// ดึงหมวดหมู่และสินค้าจากฐานข้อมูลผ่าน API
async function loadDataFromAPI() {
    try {
        const [catRes, prodRes] = await Promise.all([
            fetch(`${API_BASE}/categories`),
            fetch(`${API_BASE}/products`)
        ]);
        if (!catRes.ok || !prodRes.ok) throw new Error("โหลดข้อมูลจากเซิร์ฟเวอร์ไม่สำเร็จ");

        const catData = await catRes.json();
        const prodData = await prodRes.json();

        categories = [{ key: "all", name: "สินค้าทั้งหมด", icon: "🍱" }, ...catData];

        // แปลงข้อมูลสินค้าจาก API (category เป็น object ที่ populate มา) ให้ใช้รูปแบบเดิมที่โค้ดข้างล่างเรียกใช้
        products = prodData.map(p => ({
            id: p.id,
            _id: p._id,
            name: p.name,
            brand: p.brand,
            category: p.category?.key || "อื่นๆ",
            price: p.price,
            size: p.size,
            icon: p.icon,
            image: p.image,
            description: p.description
        }));
    } catch (err) {
        console.error(err);
        showMessage("⚠️ เชื่อมต่อฐานข้อมูลไม่สำเร็จ ตรวจสอบว่ารัน server.js อยู่หรือไม่");
    }
}

function initCategories() {
    const grid = document.getElementById("categoryGrid");
    const mobile = document.getElementById("mobileCategory");
    const checkbox = document.getElementById("checkboxCategories");

    if (grid) {
        grid.innerHTML = categories.map(c => `
            <button class="category-card ${c.key === 'all' ? 'active' : ''}" onclick="filterCategory('${c.key}')">
                <div class="category-image"><span style="font-size:55px;">${c.icon}</span></div>
                <span>${c.name}</span>
            </button>`).join("");
    }
    if (mobile) mobile.innerHTML = categories.map(c => `<button onclick="filterCategory('${c.key}'); toggleCategoryMenu();">${c.icon} ${c.name}</button>`).join("");
    if (checkbox) checkbox.innerHTML = categories.filter(c => c.key !== "all").map(c => `<label><input type="checkbox" value="${c.key}" class="category-filter"> ${c.name}</label>`).join("");
}

/* ================= RENDER PRODUCTS & PAGINATION ================= */
function renderProducts() {
    const grid = document.getElementById("productGrid");
    const empty = document.getElementById("emptyState");
    const count = document.getElementById("resultCount");
    
    if (count) count.textContent = displayed.length;
    if (empty) empty.classList.toggle("hidden", displayed.length > 0);
    if (!grid) return;

    const totalPages = Math.ceil(displayed.length / itemsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    
    const startIdx = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = displayed.slice(startIdx, startIdx + itemsPerPage);

    grid.innerHTML = paginatedProducts.map(p => {
        const isFav = favorites.includes(p.id);
        return `
        <div class="product-card">
            <button class="favorite ${isFav ? 'active' : ''}" onclick="toggleFavorite(${p.id})">${isFav ? '♥' : '♡'}</button>
            <div class="product-image" onclick="openProductDetail(${p.id})">
                <img src="${p.image}" alt="${p.name}" onerror="this.style.display='none';this.parentElement.innerHTML='<span style=\\'font-size:45px;\\'>${p.icon}</span>';">
            </div>
            <div class="product-info">
                <div class="product-brand">${p.brand}</div>
                <div class="product-name" onclick="openProductDetail(${p.id})">${p.name}</div>
                <div class="product-size">${p.size}</div>
                <div class="product-price">฿${p.price.toFixed(2)}</div>
                <div class="product-actions"><button class="add-cart" onclick="addToCart(${p.id})"></button></div>
            </div>
        </div>`;
    }).join("");

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const paginationEl = document.getElementById("pagination");
    if (!paginationEl) return;

    if (displayed.length <= itemsPerPage) {
        paginationEl.innerHTML = "";
        return;
    }

    let html = `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">‹ ก่อนหน้า</button>`;
    
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }

    html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">ถัดไป ›</button>`;
    paginationEl.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    renderProducts();
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
}

/* ================= FILTER & SORT ================= */
function applyFilters() {
    const checked = [...document.querySelectorAll(".category-filter:checked")].map(i => i.value);
    const price = document.querySelector('input[name="price"]:checked')?.value || "all";

    displayed = products.filter(p => {
        const matchSearch = !searchTxt || [p.name, p.brand, p.category].some(f => f.toLowerCase().includes(searchTxt));
        const matchBtn = curCat === "all" || p.category === curCat;
        const matchBrand = !curBrand || p.brand.toLowerCase() === curBrand.toLowerCase();
        const matchBox = !checked.length || checked.includes(p.category);
        const matchPrice = price === "all" ? true : price === "100" ? p.price < 100 : price === "200" ? (p.price >= 100 && p.price <= 200) : p.price > 200;
        return matchSearch && matchBtn && matchBrand && matchBox && matchPrice;
    });
    currentPage = 1;
    sortProducts(false);
}

function sortProducts(reapply = true) {
    if (reapply) return applyFilters();
    const sort = document.getElementById("sortSelect")?.value || "name";
    displayed.sort((a, b) => sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : a.name.localeCompare(b.name, "th"));
    renderProducts();
}

function filterCategory(cat) {
    curCat = cat; 
    curBrand = "";
    document.querySelectorAll(".category-card").forEach((c, idx) => c.classList.toggle("active", categories[idx].key === cat));
    applyFilters();
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
}

function filterBrand(brand) {
    curBrand = brand; 
    curCat = "all";
    document.querySelectorAll(".category-card").forEach(c => c.classList.remove("active"));
    applyFilters();
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
    showMessage(`แสดงสินค้าแบรนด์ "${brand}" 🎌`);
}

function resetFilters() {
    searchTxt = ""; curCat = "all"; curBrand = "";
    document.getElementById("searchInput").value = "";
    document.getElementById("sortSelect").value = "name";
    document.querySelectorAll(".category-filter").forEach(i => i.checked = false);
    const pAll = document.querySelector('input[name="price"][value="all"]');
    if (pAll) pAll.checked = true;
    filterCategory("all");
    showMessage("รีเซ็ตตัวกรองแล้ว");
}

/* ================= CART & FAVORITES ================= */
function addToCart(id) {
    const p = products.find(i => i.id === id);
    if (!p) return;
    const item = cart.find(i => i.id === id);
    item ? item.quantity++ : cart.push({ ...p, quantity: 1 });
    updateCart();
    showMessage(`เพิ่ม "${p.name}" ลงตะกร้าแล้ว`);
}

function changeQuantity(id, amt) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.quantity += amt;
    cart = cart.filter(i => i.quantity > 0);
    updateCart();
    renderCart();
}

function updateCart() {
    const el = document.getElementById("cartCount");
    if (el) el.textContent = cart.reduce((s, i) => s + i.quantity, 0);
}

function renderCart() {
    const box = document.getElementById("cartItems");
    const totalEl = document.getElementById("cartTotal");
    if (!box) return;

    if (!cart.length) {
        box.innerHTML = `<div class="text-center py-10"><div style="font-size:50px;">🛒</div><h3>ยังไม่มีสินค้าในตะกร้า</h3></div>`;
        if (totalEl) totalEl.textContent = "฿0";
        return;
    }
    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    box.innerHTML = cart.map(i => `
        <div class="cart-item">
            <div class="cart-item-image"><img src="${i.image}" alt="${i.name}" onerror="this.style.display='none';this.parentElement.innerHTML='<span>${i.icon}</span>';"></div>
            <div class="cart-item-info">
                <h4>${i.name}</h4><p>฿${i.price.toFixed(2)}</p>
                <div class="quantity">
                    <button onclick="changeQuantity(${i.id}, -1)">−</button>
                    <strong>${i.quantity}</strong>
                    <button onclick="changeQuantity(${i.id}, 1)">+</button>
                    <button class="remove-cart" onclick="changeQuantity(${i.id}, -${i.quantity})">ลบ</button>
                </div>
            </div>
        </div>`).join("");
    if (totalEl) totalEl.textContent = `฿${total.toFixed(2)}`;
}

function toggleFavorite(id) {
    favorites = favorites.includes(id) ? favorites.filter(i => i !== id) : [...favorites, id];
    renderProducts();
    showMessage(favorites.includes(id) ? "เพิ่มในรายการโปรดแล้ว" : "นำออกจากรายการโปรดแล้ว");
}

function showFavorites() {
    if (!favorites.length) return showMessage("ยังไม่มีสินค้าในรายการโปรด ❤️");
    displayed = products.filter(p => favorites.includes(p.id));
    currentPage = 1;
    renderProducts();
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
}

/* ================= MODALS & POPUPS ================= */
function openProductDetail(id) {
    const p = products.find(i => i.id === id);
    const box = document.getElementById("productDetailContent");
    if (!p || !box) return;

    box.innerHTML = `
        <div class="detail-container">
            <div class="detail-image-box"><img src="${p.image}" alt="${p.name}" onerror="this.style.display='none';this.parentElement.innerHTML='<span style=\\'font-size:80px;\\'>${p.icon}</span>';"></div>
            <div class="detail-info">
                <span class="detail-brand">${p.brand}</span>
                <h2 class="detail-name">${p.name}</h2>
                <div class="detail-size">ขนาด: <strong>${p.size}</strong></div>
                <div class="detail-price">฿${p.price.toFixed(2)}</div>
                <p class="detail-desc">${p.description}</p>
                <div class="detail-actions">
                    <button class="detail-add-cart-btn" onclick="addToCart(${p.id}); toggleModal('productDetailModal', false);">🛒 เพิ่มลงตะกร้าทันที</button>
                    <button class="detail-fav-btn" onclick="toggleFavorite(${p.id})">♥</button>
                </div>
            </div>
        </div>`;
    toggleModal("productDetailModal", true);
}

function openCheckout() {
    if (!cart.length) return showMessage("กรุณาเลือกสินค้าลงตะกร้าก่อนสั่งซื้อ");
    toggleModal("cartModal", false);
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    document.getElementById("summarySubtotal").textContent = `฿${subtotal.toFixed(2)}`;
    document.getElementById("summaryGrandTotal").textContent = `฿${(subtotal + 40).toFixed(2)}`;
    toggleModal("checkoutModal", true);
}

function submitOrder(e) {
    e.preventDefault();
    const name = document.getElementById("custName")?.value.trim() || "";
    const payment = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    const paymentText = payment === "promptpay" ? "พร้อมเพย์" : payment === "cod" ? "เก็บเงินปลายทาง" : "บัตรเครดิต";

    toggleModal("checkoutModal", false);
    document.getElementById("checkoutForm")?.reset();
    cart = [];
    updateCart();
    showMessage(`สั่งซื้อสำเร็จ! ขอบคุณคุณ ${name} จัดส่งแบบ (${paymentText}) 🎌`);
}

function toggleModal(id, show) {
    if (id === "cartModal" && show) renderCart();
    document.getElementById(id)?.classList.toggle("hidden", !show);
}

function toggleCategoryMenu() {
    const m = document.getElementById("mobileCategory");
    if (m) m.style.display = m.style.display === "block" ? "none" : "block";
}

function showMessage(msg) {
    const b = document.getElementById("messageBox");
    if (!b) return;
    b.textContent = msg;
    b.classList.add("show");
    clearTimeout(msgTimer);
    msgTimer = setTimeout(() => b.classList.remove("show"), 2500);
}

function setupEvents() {
    document.getElementById("searchInput")?.addEventListener("input", e => { searchTxt = e.target.value.trim().toLowerCase(); applyFilters(); });
    document.addEventListener("change", e => { if (e.target.matches(".category-filter, input[name='price']")) applyFilters(); });
    document.addEventListener("click", e => { if (e.target.classList.contains("modal")) e.target.classList.add("hidden"); });
}

window.goToPage = goToPage;