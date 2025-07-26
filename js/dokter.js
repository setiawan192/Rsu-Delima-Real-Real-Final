document.addEventListener("DOMContentLoaded", () => {
    // --- STATE & DATA ---
    const loggedInUsername = localStorage.getItem("username");
    let allDokter = JSON.parse(localStorage.getItem('dataDokter')) || [];
    let allPasien = JSON.parse(localStorage.getItem('dataPasien')) || [];
    let allJadwal = JSON.parse(localStorage.getItem('dataJadwal')) || [];
    let allPerjanjian = JSON.parse(localStorage.getItem('dataPerjanjian')) || [];

    const currentDokter = allDokter.find(d => d.username === loggedInUsername);
    if (!currentDokter) {
        alert("Data dokter tidak ditemukan!");
        logout();
        return;
    }

    const today = new Date();
    const hariIni = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][today.getDay()];
    const tanggalHariIniISO = today.toISOString().slice(0, 10);


    // --- DOM ELEMENTS ---
    const navLinks = document.querySelectorAll(".nav-link");
    const contentViews = document.querySelectorAll(".content-view");
    const modal = document.getElementById("rekamMedisModal");
    const closeButtons = document.querySelectorAll(".close-btn");
    const tabLinks = document.querySelectorAll(".tab-link");
    const tabContents = document.querySelectorAll(".tab-content");
    const saveSoapBtn = document.getElementById("saveSoapBtn");
    const soapForm = document.getElementById("soapForm");

    // --- RENDER FUNCTIONS ---

    const renderDashboard = () => {
        document.getElementById("doctorName").textContent = currentDokter.nama;
        document.getElementById("welcomeMessage").textContent = `Selamat datang kembali, ${currentDokter.nama}.`;

        const janjiHariIni = allPerjanjian.filter(p => p.id_dokter === currentDokter.id && p.tanggal === tanggalHariIniISO);
        const janjiSelesai = janjiHariIni.filter(p => p.status === 'Selesai');
        const janjiMenunggu = janjiHariIni.filter(p => p.status === 'Menunggu').sort((a,b) => a.jam.localeCompare(b.jam));

        document.getElementById("janjiHariIniCount").textContent = janjiHariIni.length;
        document.getElementById("janjiSelesaiCount").textContent = janjiSelesai.length;

        const pasienBerikutnya = janjiMenunggu.length > 0 ? allPasien.find(p => p.no_rm === janjiMenunggu[0].no_rm_pasien)?.nama : "Tidak ada";
        document.getElementById("pasienBerikutnya").textContent = pasienBerikutnya;

        const jadwalHariIni = allJadwal.find(j => j.id_dokter === currentDokter.id && j.hari === hariIni);
        const jadwalContainer = document.getElementById("jadwalHariIniContainer");
        if (jadwalHariIni) {
            jadwalContainer.innerHTML = `<strong>${jadwalHariIni.poli}</strong>: Pukul ${jadwalHariIni.jamMulai} - ${jadwalHariIni.jamSelesai}`;
            jadwalContainer.classList.remove('libur');
        } else {
            jadwalContainer.innerHTML = "Hari ini Anda tidak memiliki jadwal praktik.";
            jadwalContainer.classList.add('libur');
        }
    };
    
    const renderJadwalLengkap = () => {
        const jadwalDokter = allJadwal.filter(j => j.id_dokter === currentDokter.id);
        const tableBody = document.getElementById("jadwalTableBody");
        tableBody.innerHTML = '';
        if (jadwalDokter.length > 0) {
            jadwalDokter.forEach(j => {
                tableBody.innerHTML += `
                    <tr>
                        <td>${j.hari}</td>
                        <td>${j.poli}</td>
                        <td>${j.jamMulai}</td>
                        <td>${j.jamSelesai}</td>
                    </tr>
                `;
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Tidak ada jadwal.</td></tr>';
        }
    };

    const renderJanjiHariIni = () => {
        const janjiHariIni = allPerjanjian
            .filter(p => p.id_dokter === currentDokter.id && p.tanggal === tanggalHariIniISO)
            .sort((a,b) => a.jam.localeCompare(b.jam));

        const tableBody = document.getElementById("janjiTableBody");
        tableBody.innerHTML = '';

        if (janjiHariIni.length > 0) {
            janjiHariIni.forEach((janji, index) => {
                const pasien = allPasien.find(p => p.no_rm === janji.no_rm_pasien);
                const statusClass = `status-${janji.status.toLowerCase()}`;
                tableBody.innerHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${pasien ? pasien.nama : 'Pasien tidak ditemukan'}</td>
                        <td>${janji.jam}</td>
                        <td><span class="status ${statusClass}">${janji.status}</span></td>
                        <td>
                            <button class="btn-primary" onclick="window.openRekamMedis('${janji.id}')" ${janji.status === 'Selesai' ? 'disabled' : ''}>
                                ${janji.status === 'Selesai' ? 'Sudah Dilayani' : 'Buka RME'}
                            </button>
                        </td>
                    </tr>
                `;
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Tidak ada janji pasien hari ini.</td></tr>';
        }
    };

    // --- MODAL & RME FUNCTIONS ---
    window.openRekamMedis = (appointmentId) => {
        const appointment = allPerjanjian.find(p => p.id === appointmentId);
        const pasien = allPasien.find(p => p.no_rm === appointment.no_rm_pasien);
        if (!pasien) {
            alert("Data pasien tidak ditemukan!");
            return;
        }

        // Reset form and fill patient data
        soapForm.reset();
        document.getElementById("appointmentId").value = appointmentId;
        document.getElementById("rmePasienNama").textContent = pasien.nama;
        document.getElementById("rmePasienRm").textContent = pasien.no_rm;
        document.getElementById("rmePasienTglLahir").textContent = new Date(pasien.tgl_lahir).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

        // Render riwayat
        const riwayatContainer = document.getElementById("riwayatContainer");
        riwayatContainer.innerHTML = '';
        if (pasien.rekamMedis && pasien.rekamMedis.length > 0) {
            [...pasien.rekamMedis].reverse().forEach(riwayat => {
                riwayatContainer.innerHTML += `
                    <div class="riwayat-item">
                        <h4>Kunjungan: ${new Date(riwayat.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} (Oleh: ${riwayat.dokter})</h4>
                        <p><strong>Subjektif:</strong> ${riwayat.subjective}</p>
                        <p><strong>Objektif:</strong> ${riwayat.objective}</p>
                        <p><strong>Asesmen:</strong> ${riwayat.assessment}</p>
                        <p><strong>Rencana:</strong> ${riwayat.plan}</p>
                    </div>
                `;
            });
        } else {
            riwayatContainer.innerHTML = '<p style="text-align:center; color: #7f8c8d;">Belum ada riwayat kunjungan.</p>';
        }

        // Show modal and reset tabs
        modal.classList.add('show');
        tabLinks.forEach(link => link.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        document.querySelector('.tab-link[data-tab="catatanBaru"]').classList.add('active');
        document.getElementById('catatanBaru').classList.add('active');
    };

    const closeModal = () => modal.classList.remove('show');

    const saveSoapNote = () => {
        const appointmentId = document.getElementById("appointmentId").value;
        const appointment = allPerjanjian.find(p => p.id === appointmentId);
        const pasien = allPasien.find(p => p.no_rm === appointment.no_rm_pasien);

        const newRecord = {
            id_janji: appointmentId,
            tanggal: tanggalHariIniISO,
            dokter: currentDokter.nama,
            subjective: document.getElementById("subjective").value,
            objective: document.getElementById("objective").value,
            assessment: document.getElementById("assessment").value,
            plan: document.getElementById("plan").value,
        };
        
        // Validasi sederhana
        if (!newRecord.subjective || !newRecord.assessment) {
            alert("Mohon isi minimal bagian Subjective dan Assessment.");
            return;
        }

        // Update data
        pasien.rekamMedis.push(newRecord);
        appointment.status = 'Selesai';
        
        // Save to localStorage
        localStorage.setItem('dataPasien', JSON.stringify(allPasien));
        localStorage.setItem('dataPerjanjian', JSON.stringify(allPerjanjian));

        // Re-render views and close modal
        alert("Catatan klinis berhasil disimpan.");
        closeModal();
        renderDashboard();
        renderJanjiHariIni();
    };


    // --- EVENT LISTENERS ---
    navLinks.forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            const viewId = link.getAttribute("data-view");

            navLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");

            contentViews.forEach(view => {
                view.style.display = view.id === viewId ? 'block' : 'none';
            });
        });
    });

    closeButtons.forEach(btn => btn.addEventListener("click", closeModal));
    saveSoapBtn.addEventListener("click", saveSoapNote);

    tabLinks.forEach(link => {
        link.addEventListener("click", () => {
            const tabId = link.getAttribute("data-tab");
            tabLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            link.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    const logout = () => {
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        window.location.href = "../login.html";
    };
    document.getElementById("logoutBtn").addEventListener("click", () => {
        if (confirm("Apakah Anda yakin ingin logout?")) {
            logout();
        }
    });

    // --- INITIALIZATION ---
    const init = () => {
        renderDashboard();
        renderJadwalLengkap();
        renderJanjiHariIni();
    };

    init();
});