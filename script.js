// ---------- CONFIG ----------
const EMAILJS_SERVICE = 'service_4qk36oh';
const EMAILJS_TEMPLATE = 'template_hkfku48';
const EMAILJS_PUBLIC = 'DMgLoxaOtcBt1pnjY';
const STORE_EMAIL = 'yeltinnakit@gmail.com'; // รับคำสั่งซื้อ

// init EmailJS (backup init; product.html init also)
if (window.emailjs) {
  try { emailjs.init(EMAILJS_PUBLIC); } catch(e){/*ignore*/ }
}

// ---------- Utilities ----------
async function sha256(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hex = Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
  return hex;
}

function setLoggedUI() {
  const ln = document.getElementById('nav-login');
  const rn = document.getElementById('nav-register');
  const ln2 = document.getElementById('nav-login-2');
  const ln3 = document.getElementById('nav-login-3');
  if(localStorage.getItem('heisen_session')) {
    if(ln) ln.style.display = 'none';
    if(rn) rn.style.display = 'none';
    if(ln2) ln2.style.display = 'none';
    if(ln3) ln3.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', ()=> {
  setLoggedUI();
  tryLoadReviews();
  populateProductPageIfAny();
});

// ---------- Register / Login ----------
document.addEventListener('click', (e)=>{
  // register
  if(e.target && e.target.id === 'btnRegister'){
    (async ()=>{
      const user = document.getElementById('regUser').value.trim();
      const pass = document.getElementById('regPass').value;
      if(!user || !pass){ document.getElementById('regMsg').innerText='กรอกข้อมูลให้ครบ!'; return; }
      const users = JSON.parse(localStorage.getItem('heisen_users')||'{}');
      if(users[user]){ document.getElementById('regMsg').innerText='ชื่อผู้ใช้นี้มีอยู่แล้ว'; return; }
      const hash = await sha256(pass);
      users[user] = { hash };
      localStorage.setItem('heisen_users', JSON.stringify(users));
      localStorage.setItem('heisen_session', user);
      window.location = 'index.html';
    })();
  }

  // login
  if(e.target && e.target.id === 'btnLogin'){
    (async ()=>{
      const user = document.getElementById('loginUser').value.trim();
      const pass = document.getElementById('loginPass').value;
      if(!user || !pass){ document.getElementById('loginMsg').innerText='กรอกข้อมูลให้ครบ!'; return; }
      const users = JSON.parse(localStorage.getItem('heisen_users')||'{}');
      if(!users[user]){ document.getElementById('loginMsg').innerText='ไม่มีชื่อผู้ใช้นี้'; return; }
      const hash = await sha256(pass);
      if(hash === users[user].hash){
        localStorage.setItem('heisen_session', user);
        window.location = 'index.html';
      } else document.getElementById('loginMsg').innerText='ชื่อหรือรหัสผ่านผิด';
    })();
  }
});

// ---------- Reviews (store in localStorage) ----------
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
  list.forEach(rv=>{
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
    const text = document.getElementById('revText').value.trim() || '';
    if(!text){ alert('กรุณาใส่ข้อความรีวิว'); return; }
    const list = JSON.parse(localStorage.getItem('heisen_reviews')||'[]');
    list.unshift({name, avatar, rating, text});
    localStorage.setItem('heisen_reviews', JSON.stringify(list));
    renderReviews(list);
    document.getElementById('revName').value=''; document.getElementById('revText').value='';
  }
});

// ---------- Product page logic & EmailJS order ----------
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

    <!-- modal -->
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

  // pack events
  document.querySelectorAll('.pack-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.pack-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const price = Number(btn.dataset.price);
      document.getElementById('priceValue').innerText = price + '฿';
      document.getElementById('modalPack') && (document.getElementById('modalPack').innerText = `แพ็ก: ${btn.dataset.label} — ${price}฿`);
    });
  });

  // buy -> open modal
  document.getElementById('buyNow').addEventListener('click', ()=>{
    document.getElementById('orderModal').style.display = 'flex';
    document.getElementById('orderMsg').innerText = '';
  });

  // close modal
  document.getElementById('closeModal').addEventListener('click', ()=> document.getElementById('orderModal').style.display='none');

  // submit order via EmailJS
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
      game: (config.title || 'product'),
      duration: packLabel,
      link: link,
      price: price,
      to_email: STORE_EMAIL
    };

    // send via EmailJS
    try {
      await emailjs.init(EMAILJS_PUBLIC); // ensure init
      const resp = await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, templateParams);
      console.log('emailjs resp', resp);
      // show success and redirect to success page
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
