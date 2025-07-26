function downloadPDF() {
  window.print();
}

function kirimViaWA() {
  const janji = JSON.parse(localStorage.getItem("janjiAktif"));
  if (!janji) return alert("Tidak ada data.");

  const text = `Halo, saya ingin konfirmasi janji: ${janji.dokter}, ${janji.tanggal} jam ${janji.jam}, No Antrian: ${janji.antrian}`;
  const waLink = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(waLink, "_blank");
}

function downloadExcel() {
  alert("Simulasi Download Excel.");
}