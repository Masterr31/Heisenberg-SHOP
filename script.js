// CONFIG - ใส่ค่าที่คุณให้ไว้
const EMAILJS_SERVICE = 'service_4qk36oh';
const EMAILJS_TEMPLATE = 'template_hkfku48';
const EMAILJS_PUBLIC = 'DMgLoxaOtcBt1pnjY';
const STORE_EMAIL = 'yeltinnakit@gmail.com';

// init EmailJS if available
if(window.emailjs){
  try{ emailjs.init(EMAILJS_PUBLIC); }catch(e){ console.warn('EmailJS init failed', e); }
}

// SHA-256 helper
async function sha256(str){
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

// set UI for logged user
function setLoggedUI(){
  const logged = !!localStorage.getItem('heisen_session');
  ['nav-login','nav-register','nav-login-2','nav-login-3','off-login','off-register'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.style.display = logged ? 'none' : '';
  });
}

// Offcanvas menu init
document.addEventListener('DOMContentLoaded', ()=>{
  setLoggedUI();
  tryLoadReviews();
  attachHamburger();
  attachAuthHandlers();
  populateProductPageIfAny();
});

function attachHamburger(){
  const ham = document.getElementById('hamburger');
  const off = document.getElementById('offcanvas');
  if(!ham || !off) return;
  ham.addEventListener('click', ()=>{
    ham.classList.toggle('open');
    off.classList.toggle('open');
    off.setAttribute('aria-hidden', off.classList.contains('open') ? 'false' : 'true');
  });
  off.addEventListener('click', e=>{
    if(e.target.tagName === 'A'){
      ham.classList.remove('open');
      off.classList.remove('open');
    }
  });
  document.addEventListener('keydown', e=>{
    if(e.key === 'Escape' && off.classList.contains('open')){
      ham.classList.remove('open');
      off.classList.remove('open');
    }
  });
}

// Auth handlers
function attachAuthHandlers(){
  const btnReg = document.getElementById('btnRegister');
  if(btnReg) btnReg.addEventListener('click', doRegister);
  const btnLogin = document.getElementById('btnLogin');
  if(btnLogin) btnLogin.addEventListener('click', doLogin);
}

async function doRegister(){
  const userEl = document.getElementById('regUser');
  const passEl = document.getElementById('regPass');
  const msgEl = document.getElementById('regMsg');
  if(!userEl || !passEl) return;
  const user = userEl.value.trim(); const pass = passEl.value;
  if(!user || !pass){ if(msgEl) msgEl.innerText='กรอกข้อมูลให้ครบ!'; return; }
  const users = JSON.parse(localStorage.getItem('heisen_users')||'{}');
  if(users[user]){ if(msgEl) msgEl.innerText='ชื่อผู้ใช้นี้มีอยู่แล้ว'; return; }
  const hash = await sha256(pass);
  users[user] = { hash };
  localStorage.setItem('heisen_users', JSON.stringify(users));
  localStorage.setItem('heisen_session', user);
  window.location = 'index.html';
}

async function doLogin(){
  const userEl = document.getElementById('loginUser');
  const passEl = document.getElementById('loginPass');
  const msgEl = document.getElementById('loginMsg');
  if(!userEl || !passEl) return;
  const user = userEl.value.trim(); const pass = passEl.value;
  if(!user || !pass){ if(msgEl) msgEl.innerText='กรอกข้อมูลให้ครบ!'; return; }
  const users = JSON.parse(localStorage.getItem('heisen_users')||'{}');
  if(!users[user]){ if(msgEl) msgEl.innerText='ไม่มีชื่อผู้ใช้นี้'; return; }
  const hash = await sha256(pass);
  if(hash === users[user].hash){
    localStorage.setItem('heisen_session', user);
    window.location = 'index.html';
  } else {
    if(msgEl) msgEl.innerText='ชื่อหรือรหัสผ่านผิด';
  }
}

// Reviews
const SAMPLE_REVIEWS = [
  {name:'User_A', avatar:'assets/avatar1.png', rating:5, text:'ส่งไวมาก โปรดีจริงครับ 🔥'},
  {name:'User_B', avatar:'assets/avatar2.png', rating:5, text:'Heisenberg Shop ของแท้แน่นอน 💯'}
];

function tryLoadReviews(){
  const r = JSON.parse(localStorage.getItem('heisen_reviews')||'null');
  if(!r){ localStorage.setItem('heisen_reviews', JSON.stringify(SAMPLE_REVIEWS)); renderReviews(SAMPLE_REVIEWS); }
  else renderReviews(r);
}

function renderReviews(list){
  const el = document.getElementById('reviewsList');
  if(!el) return;
  el.innerHTML = '';
  (list||[]).forEach(rv=>{
    const div = document.createElement('div');
    div.className = 'review-item';
    div.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center">
        <img src="${rv.avatar || 'assets/avatar1.png'}" class="avatar" alt="">
        <div>
          <div class="name">${rv.name}</div>
          <div class="muted small">${'★'.repeat(rv.rating)}</div>
        </div>
      </div>
      <div class="text">${rv.text}</div>
    `;
    el.appendChild(div);
  });
}

document.addEventListener('click', (e)=>{
  if(e.target && e.target.id === 'sendReview'){
    const name = document.getElementById('revName').value.trim() || 'ลูกค้า';
    const avatar = document.getElementById('revAvatar').value.trim() || 'assets/avatar1.png';
    const rating = Number(document.getElementById('revRating').value) || 5;
    const text = document.getElementById('revText').value.trim();
    if(!text){ alert('กรุณาใส่ข้อความรีวิว'); return; }
    const list = JSON.parse(localStorage.getItem('heisen_reviews')||'[]');
    list.unshift({name, avatar, rating, text});
    localStorage.setItem('heisen_reviews', JSON.stringify(list));
    renderReviews(list);
    document.getElementById('revName').value=''; document.getElementById('revText').value='';
  }
});

// Product page & EmailJS submit
function getQueryParams(){
  const q = {};
  location.search.slice(1).split('&').forEach(p=>{
    if(!p) return;
    const [k,v] = p.split('=');
    q[k]=decodeURIComponent(v||'');
  });
  return q;
}

function populateProductPageIfAny(){
  tryLoadReviews();
  const productArea = document.getElementById('productArea');
  if(!productArea) return;
  const q = getQueryParams();
  const game = q.game || 'pubg';
  const config = {
    pubg: {
      title:'PUBG M [STAR]',
      img:'assets/pubg.jpg',
      packs:[{label:'1 วัน',price:120},{label:'7 วัน',price:320},{label:'30 วัน',price:690}]
    },
    fluorite: {
      title:'Free Fire [Fluorite]',
      img:'assets/fluorite.jpg',
      packs:[{label:'1 วัน',price:80},{label:'7 วัน',price:350},{label:'30 วัน',price:590}]
    }
  }[game];

  if(!config){ productArea.innerHTML = '<p>ไม่พบสินค้า</p>'; return; }

  productArea.innerHTML = `
    <div class="product-area">
      <div class="left"><img src="${config.img}" class="hero-img" alt=""></div>
      <div class="right">
        <h1 class="p-title">${config.title}</h1>
        <ul class="features">
          <li>มองทะลุ / เห็นชื่อศัตรู / เห็นเลือด</li>
          <li>ล็อคเป้า 200 เมตร</li>
          <li>มองของ รถ ปืน ยา • กันแบน</li>
        </ul>

        <div class="pack-row">
          ${config.packs.map((p,i)=>`<button class="pack-btn ${i===0?'active':''}" data-price="${p.price}" data-label="${p.label}">${p.label} — ${p.price}฿</button>`).join('')}
        </div>

        <div class="price-area">
          <div class="price-label muted">ราคาที่เลือก</div>
          <div id="priceValue" class="price-value">${config.packs[0].price}฿</div>
        </div>

        <div class="action-row">
          <button id="buyNow" class="btn primary">ซื้อเลย</button>
          <a class="btn" href="https://line.me/ti/p/PHtQVx7Avv" target="_blank">ติดต่อทาง LINE</a>
        </div>
      </div>
    </div>

    <div id="orderModal" class="modal">
      <div class="modal-panel">
        <button class="modal-close" id="closeModal">&times;</button>
        <h2>ยืนยันการสั่งซื้อ — ${config.title}</h2>
        <p id="modalPack" class="muted">แพ็ก: ${config.packs[0].label} — ${config.packs[0].price}฿</p>
        <input id="buyerName" placeholder="ชื่อ/LINE (เพื่อยืนยัน)">
        <input id="walletLink" placeholder="วางลิงก์ซอง TrueMoney หรือ ID LINE">
        <button id="submitOrder" class="btn primary">ส่งคำสั่งซื้อ</button>
        <p id="orderMsg" class="muted small"></p>
      </div>
    </div>
  `;

  document.querySelectorAll('.pack-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.pack-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const price = Number(btn.dataset.price);
      document.getElementById('priceValue').innerText = price + '฿';
      const mp = document.getElementById('modalPack');
      if(mp) mp.innerText = `แพ็ก: ${btn.dataset.label} — ${price}฿`;
    });
  });

  document.getElementById('buyNow').addEventListener('click', ()=>{
    const modal = document.getElementById('orderModal');
    if(modal) modal.style.display = 'flex';
    const orderMsg = document.getElementById('orderMsg'); if(orderMsg) orderMsg.innerText = '';
  });

  document.getElementById('closeModal').addEventListener('click', ()=> document.getElementById('orderModal').style.display='none');

  document.getElementById('submitOrder').addEventListener('click', async ()=>{
    const link = document.getElementById('walletLink').value.trim();
    const buyer = document.getElementById('buyerName').value.trim() || '-';
    const active = document.querySelector('.pack-btn.active');
    const packLabel = active.dataset.label;
    const price = active.dataset.price;
    if(!link){ document.getElementById('orderMsg').innerText = 'กรุณาวางลิงก์ซองหรือใส่ ID Line'; return; }

    document.getElementById('submitOrder').disabled = true;
    document.getElementById('submitOrder').innerText = 'กำลังส่ง...';

    const templateParams = {
      name: buyer,
      game: config.title,
      duration: packLabel,
      link: link,
      price: price,
      to_email: STORE_EMAIL
    };

    try {
      await emailjs.init(EMAILJS_PUBLIC);
      await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, templateParams);
      alert('✅ ส่งข้อมูลสำเร็จ รอทีมงานตรวจสอบภายใน 15 นาที');
      window.location.href = 'success.html';
    } catch(err){
      console.error('EmailJS error', err);
      document.getElementById('orderMsg').innerText = 'เกิดข้อผิดพลาดขณะส่ง ลองอีกครั้ง';
    } finally {
      document.getElementById('submitOrder').disabled = false;
      document.getElementById('submitOrder').innerText = 'ส่งคำสั่งซื้อ';
    }
  });
}
