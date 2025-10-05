function register() {
  const user = document.getElementById("regUser").value;
  const pass = document.getElementById("regPass").value;
  if (user && pass) {
    localStorage.setItem("user", user);
    localStorage.setItem("pass", pass);
    alert("สมัครสมาชิกสำเร็จ!");
    window.location = "login.html";
  } else alert("กรอกข้อมูลให้ครบ!");
}

function login() {
  const user = document.getElementById("loginUser").value;
  const pass = document.getElementById("loginPass").value;
  const regUser = localStorage.getItem("user");
  const regPass = localStorage.getItem("pass");

  if (user === regUser && pass === regPass) {
    localStorage.setItem("loggedIn", "true");
    alert("เข้าสู่ระบบสำเร็จ!");
    window.location = "index.html";
  } else alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
}

window.onload = () => {
  if (localStorage.getItem("loggedIn") === "true") {
    const loginLink = document.getElementById("login-link");
    const regLink = document.getElementById("register-link");
    if (loginLink) loginLink.style.display = "none";
    if (regLink) regLink.style.display = "none";
  }
};
