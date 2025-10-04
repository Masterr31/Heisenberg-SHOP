(function() {
    emailjs.init("_R3DkTc620EFQ-fk7"); // ✅ เปลี่ยนเป็น Public Key ของคุณ
})();

function sendEnvelope() {
    var link = document.getElementById("envelopeLink").value;

    if(!link) {
        alert("กรุณาใส่ลิงก์ซองก่อน!");
        return;
    }

    emailjs.send("service_mq8a5oa", "template_twqzu4d", {
        envelope_link: link
    })
    .then(function(response) {
        alert("ส่งซองสำเร็จแล้ว! 🎉");
        document.getElementById("envelopeLink").value = "";
    }, function(error) {
        alert("เกิดข้อผิดพลาด: " + JSON.stringify(error));
    });
}
