/* CONFIG */
const EMAIL_SEND_ENDPOINT = 'https://formsubmit.co/ajax/yeltinnakit@gmail.com'; // ส่งเข้าอีเมลคุณ
/* END CONFIG */

/* UI elements */
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuBtn');
const closeMenu = document.getElementById('closeMenu');
const packs = document.querySelectorAll('.pack');
const priceEl = document.getElementById('price');
const buyBtn = document.getElementById('buyBtn');
const modal = document.getElementById('paymentModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelPayment = document.getElementById('cancelPayment');
const sendPayment = document.getElementById('sendPayment');
const selectedPackEl = document.getElementById('selectedPack');
const linkInput = document.getElementById('linkInput');
const buyerName = document.getElementById('buyerName');

/* sound (WebAudio simple click) */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playClick() {
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.value = 880; // high tone
  g.gain.value = 0.0012;
  o.connect(g); g.connect(audioCtx.destination);
  o.start();
  setTimeout(()=>{ o.stop(); }, 90);
}

/* sidebar */
menuBtn && menuBtn.addEventListener('click', ()=> sidebar.classList.add('active'));
closeMenu && closeMenu.addEventListener('click', ()=> sidebar.classList.remove('active'));

/* pack selection */
let selected = null;
packs.forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    packs.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    selected = {price: Number(btn.dataset.price), label: btn.dataset.label};
    priceEl.innerText = `${selected.price}฿`;
    playClick();
  });
});

/* open payment modal */
buyBtn && buyBtn.addEventListener('click', ()=> {
  if(!selected){
    alert('กรุณาเลือกแพ็กก่อนครับ');
    return;
  }
  // fill modal info
  selectedPackEl.innerText = `แพ็ก: ${selected.label} — ราคา ${selected.price}฿`;
  linkInput.value = '';
  buyerName.value = '';
  modal.style.display = 'flex';
  playClick();
});

/* close modal */
closeModalBtn && closeModalBtn.addEventListener('click', ()=> modal.style.display = 'none');
cancelPayment && cancelPayment.addEventListener('click', ()=> modal.style.display = 'none');

/* send payment -> to formsubmit AJAX */
sendPayment && sendPayment.addEventListener('click', async ()=>{
  const link = linkInput.value.trim();
  const name = buyerName.value.trim() || '-';
  if(!link || !/^https?:\/\//i.test(link)){
    alert('กรุณาวางลิงก์ซองที่ถูกต้อง (ต้องขึ้นต้นด้วย http:// หรือ https://)');
    return;
  }
  // disable button
  sendPayment.disabled = true;
  sendPayment.innerText = 'กำลังส่ง...';
  playClick();

  try {
    const fd = new FormData();
    fd.append('tmn_link', link);
    fd.append('product', 'PUBG M [STAR]');
    fd.append('pack', selected.label);
    fd.append('price', selected.price);
    fd.append('buyer', name);
    fd.append('_subject', `คำสั่งซื้อใหม่จาก HEISENBERG [SHOP]`);
    fd.append('_captcha', 'false');

    const resp = await fetch(EMAIL_SEND_ENDPOINT, { method: 'POST', body: fd });
    const data = await resp.json();
    if(resp.ok){
      alert('ส่งข้อมูลซองเรียบร้อย เจ้าของร้านจะตรวจสอบและติดต่อกลับทาง LINE ครับ');
      modal.style.display = 'none';
    } else {
      console.error('Formsubmit error', data);
      alert('เกิดข้อผิดพลาดในการส่ง ลองใหม่อีกครั้ง');
    }
  } catch (err) {
    console.error(err);
    alert('ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่ (ตรวจสอบการเชื่อมต่อ)');
  } finally {
    sendPayment.disabled = false;
    sendPayment.innerText = 'ส่งลิงก์เพื่อชำระ';
  }
});
