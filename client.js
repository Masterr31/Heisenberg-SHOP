// =================== CONFIG (แก้ตรงนี้) ===================
const API_ENDPOINT = "https://REPLACE_WITH_YOUR_SERVER/api/notify"; // <-- เปลี่ยนเป็น URL serverless
const LINE_CONTACT = "https://line.me/ti/p/PHtQVx7Avv"; // ลิงก์ LINE ของคุณ
// ==============================================================

// สินค้า (แก้ในนี้เพื่อเพิ่ม/เปลี่ยน)
const PRODUCTS = [
  {
    id: "pubgm-star",
    title: "PUBG M [STAR]",
    thumb: "assets/pubgm-star-thumb.jpg",
    description: "โปร PUBG M [STAR] - ติดต่อทาง LINE เพื่อยืนยันการชำระ",
    options: [
      { label: "1 วัน", price: 120 },
      { label: "7 วัน", price: 310 },
      { label: "30 วัน", price: 690 }
    ]
  }
];

function renderProducts(){
  const g = document.getElementById("products");
  g.innerHTML = "";
  PRODUCTS.forEach(p=>{
    const el = document.createElement("div");
    el.className = "product-card";
    el.innerHTML = `
      <div class="ribbon">สินค้าใหม่</div>
      <img class="product-thumb" src="${p.thumb}" alt="${p.title}" />
      <div class="product-title">${p.title}</div>
      <div class="price">${p.options[0].price}฿</div>
      <div class="btn-row">
        <button class="buy-btn" onclick="openProductModal('${p.id}')">ดูรายละเอียด</button>
        <a class="line-btn-small" href="${LINE_CONTACT}" target="_blank">LINE</a>
      </div>
    `;
    g.appendChild(el);
  });
}

// Modal: แสดงรายละเอียด + ฟอร์มสั่งซื้อ
function openProductModal(productId){
  const p = PRODUCTS.find(x=>x.id===productId);
  const modal = document.getElementById("productModal");
  const body = document.getElementById("modalBody");

  // กำหนด options เป็นปุ่ม
  let opts = p.options.map((o,idx)=>`<label style="margin-right:8px;"><input type="radio" name="pkg" value="${idx}" ${idx===0?'checked':''}> ${o.label} — ${o.price}฿</label>`).join("");

  body.innerHTML = `
    <h2 style="margin-top:0">${p.title}</h2>
    <img src="${p.thumb}" style="max-width:100%;border-radius:8px" />
    <p style="color:#bbb">${p.description}</p>

    <div class="field"><strong>เลือกแพ็ก:</strong><br>${opts}</div>

    <div class="field">
      <label>ชื่อผู้สั่ง (หรือ LINE):</label>
      <input id="buyerName" class="input" placeholder="เช่น: user123 / @lineid"/>
    </div>

    <div class="field">
      <label>วิธีชำระ:</label><br>
      <button class="buy-btn" onclick="openWalletInput('${p.id}')">ชำระด้วยซองวอเลต (Paste link)</button>
      <button class="buy-btn" style="background:#777" onclick="alert('ระบบสแกน QR ยังไม่เปิด')">สแกน QR (เตรียม)</button>
    </div>

    <div style="margin-top:12px; color:#bbb; font-size:0.9rem;">
      เมื่อกด "ชำระด้วยซองวอเลต" จะให้คุณกรอกลิงก์ซอง และส่งข้อมูลไปยัง LINE เจ้าของร้าน (คุณ) เพื่อให้เจ้าของร้านตรวจสอบและยืนยันการรับ
    </div>
  `;
  modal.style.display = "flex";
}

function closeProductModal(){ document.getElementById("productModal").style.display = "none"; }
function openLogin(){ document.getElementById("authModal").style.display = "flex"; document.getElementById("authBody").innerHTML = "<h3>เข้าสู่ระบบ</h3><p>ยังไม่เปิด</p>" }
function openRegister(){ document.getElementById("authModal").style.display = "flex"; document.getElementById("authBody").innerHTML = "<h3>สมัคร</h3><p>ยังไม่เปิด</p>" }
function closeAuthModal(){ document.getElementById("authModal").style.display = "none"; }

// เปิดฟอร์มกรอกลิงก์ซอง
function openWalletInput(productId){
  const p = PRODUCTS.find(x=>x.id===productId);
  const modal = document.getElementById("productModal");
  const body = document.getElementById("modalBody");

  body.innerHTML = `
    <h3>ชำระด้วยซอง TrueMoney</h3>
    <div class="field">
      <label>แพ็กที่เลือก:</label><br>
      <select id="selectedPkg" class="input">
        ${p.options.map((o,idx)=>`<option value="${idx}">${o.label} — ${o.price}฿</option>`).join("")}
      </select>
    </div>
    <div class="field">
      <label>ชื่อผู้สั่ง (หรือ LINE):</label>
      <input id="buyerName2" class="input" placeholder="ชื่อ/LINE ID"/>
    </div>
    <div class="field">
      <label>วางลิงก์ซอง TrueMoney (paste link):</label>
      <input id="giftLink" class="input" placeholder="วางลิงก์ซองที่นี่" />
    </div>
    <div style="margin-top:12px;display:flex;gap:8px">
      <button class="buy-btn" onclick="submitGiftLink('${p.id}')">ส่งซองเพื่อชำระ</button>
      <button class="buy-btn" style="background:#777" onclick="closeProductModal()">ยกเลิก</button>
    </div>
  `;
}

// ฟังก์ชันสำคัญ: ส่งข้อมูลไป API (serverless) เพื่อให้เจ้าของร้านได้รับข้อความใน LINE
async function submitGiftLink(productId){
  const p = PRODUCTS.find(x=>x.id===productId);
  const pkgIdx = Number(document.getElementById("selectedPkg").value);
  const option = p.options[pkgIdx];
  const buyerName = (document.getElementById("buyerName2").value || '').trim();
  const giftLink = (document.getElementById("giftLink").value || '').trim();

  if(!giftLink){ alert("กรุณาวางลิงก์ซองก่อน"); return; }

  // สร้าง payload
  const payload = {
    productId: p.id,
    productTitle: p.title,
    optionLabel: option.label,
    price: option.price,
    buyerName,
    giftLink
  };

  try {
    const res = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if(res.ok){
      alert("ส่งข้อมูลซองเรียบร้อย เจ้าของร้านจะตรวจสอบและติดต่อกลับทาง LINE ครับ");
      closeProductModal();
    } else {
      alert("เกิดข้อผิดพลาด: " + (data.message || JSON.stringify(data)));
    }
  } catch (err) {
    alert("ไม่สามารถเชื่อมต่อระบบได้: " + err.message);
  }
}

// init
document.addEventListener("DOMContentLoaded", ()=> renderProducts());
