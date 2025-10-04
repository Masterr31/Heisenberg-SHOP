// เริ่มการเชื่อมต่อ EmailJS
(function(){
  emailjs.init("_R3DkTc620EFQ-fk7"); // 🔹 ใส่ Public Key ของคุณตรงนี้
})();

function sendEnvelope() {
  const link = document.getElementById("envelopeLink").value;

  if (!link) {
    alert("กรุณาวางลิงก์ซองทรูมันนี่ก่อน");
    return;
  }

  emailjs.send("YOUR_SERVICE_ID", "template_twqzu4d", {
    user_link: link
  }).then(function(response) {
    alert("ส่งลิงก์ซองสำเร็จแล้ว ✅");
    document.getElementById("envelopeLink").value = "service_mq8a5oa";
  }, function(error) {
    alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง ❌");
    console.error(error);
  });
}
