// --- Fungsi Utility --- 
function getTodayISO() {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
}

// --- Data Dummy Dokter ---
const defaultDokter = [
  { id: 1, username: "dokter.budi", nama: "Dr. Budi Santoso", spesialisasi: "Jantung", telp: "081234567890" },
  { id: 2, username: "dokter.citra", nama: "Dr. Citra Lestari", spesialisasi: "Anak", telp: "081298765432" },
  { id: 3, username: "dokter.ahmad", nama: "Dr. Ahmad Dahlan", spesialisasi: "Umum", telp: "081211223344" },
  { id: 4, username: "dokter.dewi", nama: "Dr. Dewi Anggraini", spesialisasi: "Kulit", telp: "081255667788" },
  { id: 5, username: "dokter.eko", nama: "Dr. Eko Prasetyo", spesialisasi: "THT", telp: "081299887766" },
];

// --- Data Dummy Pasien ---
const defaultPasien = [
  { 
    no_rm: "RM001", 
    nama: "Andi Wijaya", 
    tgl_lahir: "1990-05-15", 
    alamat: "Jl. Merdeka No. 10, Jakarta",
    rekamMedis: [
      {
        id_janji: "p0",
        tanggal: "2025-07-18",
        dokter: "Dr. Budi Santoso",
        subjective: "Pasien mengeluh nyeri dada sebelah kiri menjalar ke lengan.",
        objective: "Tekanan darah 150/90 mmHg, EKG menunjukkan kelainan.",
        assessment: "Angina Pectoris",
        plan: "Rujuk ke spesialis jantung, resep ISDN 5mg jika nyeri."
      }
    ]
  },
  { no_rm: "RM002", nama: "Siti Aminah", tgl_lahir: "1985-11-20", alamat: "Jl. Pahlawan No. 5, Surabaya", rekamMedis: [] },
  { no_rm: "RM003", nama: "Joko Susilo", tgl_lahir: "2001-01-30", alamat: "Jl. Diponegoro No. 15, Bandung", rekamMedis: [] },
  { no_rm: "RM004", nama: "Rina Marlina", tgl_lahir: "1995-07-22", alamat: "Jl. Gajah Mada No. 1, Semarang", rekamMedis: [] },
];

// --- Data Dummy Jadwal Dokter ---
const defaultJadwal = [
  { id: 1, id_dokter: 1, hari: "Senin", poli: "Jantung", jamMulai: "09:00", jamSelesai: "12:00" },
  { id: 2, id_dokter: 1, hari: "Rabu", poli: "Jantung", jamMulai: "09:00", jamSelesai: "12:00" },
  { id: 3, id_dokter: 2, hari: "Selasa", poli: "Anak", jamMulai: "14:00", jamSelesai: "17:00" },
  { id: 4, id_dokter: 2, hari: "Jumat", poli: "Anak", jamMulai: "08:00", jamSelesai: "11:00" },
  { id: 5, id_dokter: 3, hari: "Rabu", poli: "Umum", jamMulai: "08:00", jamSelesai: "11:00" },
  { id: 6, id_dokter: 4, hari: "Jumat", poli: "Kulit", jamMulai: "13:00", jamSelesai: "16:00" },
];

// --- Data Dummy Perjanjian ---
const defaultPerjanjian = [
  { id: "p1", no_rm_pasien: "RM001", id_dokter: 1, tanggal: getTodayISO(), jam: "09:00", status: "Menunggu" },
  { id: "p2", no_rm_pasien: "RM002", id_dokter: 1, tanggal: getTodayISO(), jam: "09:30", status: "Menunggu" },
  { id: "p3", no_rm_pasien: "RM003", id_dokter: 1, tanggal: getTodayISO(), jam: "10:00", status: "Selesai" },
  { id: "p4", no_rm_pasien: "RM004", id_dokter: 2, tanggal: getTodayISO(), jam: "14:00", status: "Menunggu" },
];

// --- Simpan ke localStorage Jika Belum Ada ---
if (!localStorage.getItem('dataDokter')) {
  localStorage.setItem('dataDokter', JSON.stringify(defaultDokter));
}
if (!localStorage.getItem('dataPasien')) {
  localStorage.setItem('dataPasien', JSON.stringify(defaultPasien));
}
if (!localStorage.getItem('dataJadwal')) {
  localStorage.setItem('dataJadwal', JSON.stringify(defaultJadwal));
}
if (!localStorage.getItem('dataPerjanjian')) {
  localStorage.setItem('dataPerjanjian', JSON.stringify(defaultPerjanjian));
}

// --- Load dari localStorage untuk Digunakan di Aplikasi ---
const dataDokter = JSON.parse(localStorage.getItem('dataDokter'));
const dataPasien = JSON.parse(localStorage.getItem('dataPasien'));
const dataJadwal = JSON.parse(localStorage.getItem('dataJadwal'));
const dataPerjanjian = JSON.parse(localStorage.getItem('dataPerjanjian'));
