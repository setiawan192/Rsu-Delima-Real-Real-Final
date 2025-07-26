// js/auth.js

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  // Dummy akun
  const accounts = {
    admin: { password: "admin123", role: "admin" },
    dokter1: { password: "dokter123", role: "dokter" },
    pasien1: { password: "pasien123", role: "pasien" },
  };

  if (accounts[username] && accounts[username].password === password) {
    localStorage.setItem("role", accounts[username].role);
    localStorage.setItem("username", username);

    if (accounts[username].role === "admin") {
      window.location.href = "dashboard/admin.html";
    } else if (accounts[username].role === "dokter") {
      window.location.href = "dashboard/dokter.html";
    } else {
      window.location.href = "dashboard/pasien.html";
    }
  } else {
    alert("Login gagal. Username atau password salah.");
  }
});
