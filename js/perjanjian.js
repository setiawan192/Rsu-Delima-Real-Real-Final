// perjanjian.js

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("formJanji");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const poli = document.getElementById("poli").value;
    const dokter = document.getElementById("dokter").value;
    const tanggal = document.getElementById("tanggal").value;
    const jam = document.getElementById("jam").value;

    // Validasi tanggal tidak boleh kurang dari hari ini
    const today = new Date();
    const inputDate = new Date(tanggal);

    if (inputDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
      alert("Tanggal janji tidak boleh sebelum hari ini.");
      return;
    }

    const janji = {
      poli,
      dokter,
      tanggal,
      jam,
      antrian: Math.floor(Math.random() * 100 + 1)
    };

    localStorage.setItem("janjiAktif", JSON.stringify(janji));
    alert("Janji berhasil disimpan.");
    window.location.href = "bukti.html";
  });
});
