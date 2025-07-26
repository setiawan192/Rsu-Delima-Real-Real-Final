document.addEventListener("DOMContentLoaded", () => {
    // --- STATE & DATA ---
    const loggedInUsername = localStorage.getItem("username");
    const allDokter = JSON.parse(localStorage.getItem('dataDokter')) || [];
    const allPasien = JSON.parse(localStorage.getItem('dataPasien')) || [];
    let allPerjanjian = JSON.parse(localStorage.getItem('dataPerjanjian')) || [];
    const allJadwal = JSON.parse(localStorage.getItem('dataJadwal')) || [];

    const currentPasien = allPasien.find(p => p.username === loggedInUsername);
    if (!currentPasien) {
        alert("Data pasien tidak ditemukan. Sesi berakhir.");
        logout();
        return;
    }

    // --- DOM ELEMENTS ---
    const navLinks = document.querySelectorAll(".nav-link, .quick-actions button[data-view-target]");
    const contentViews = document.querySelectorAll(".content-view");
    const modal = document.getElementById("buktiModal");
    const closeModalBtn = modal.querySelector(".close-btn");
    const printBtn = document.getElementById("printBtn");

    // --- INITIALIZATION ---
    const init = () => {
        // Setup Views
        renderDashboard();
        renderJadwalDokter();
        renderRiwayat();
        setupAppointmentForm();
        
        // Setup Patient Info
        document.getElementById("patientName").textContent = currentPasien.nama;
        document.getElementById("patientRM").textContent = `No. RM: ${currentPasien.no_rm}`;

        // Setup Event Listeners
        navLinks.forEach(link => link.addEventListener("click", handleNavigation));
        document.getElementById("logoutBtn").addEventListener("click", logout);
        closeModalBtn.addEventListener("click", () => modal.classList.remove("show"));
        printBtn.addEventListener("click", () => {
            const printContent = document.getElementById('buktiCetak').innerHTML;
            const originalContent = document.body.innerHTML;
            document.body.innerHTML = printContent;
            window.print();
            document.body.innerHTML = originalContent;
            window.location.reload(); // Reload to re-attach event listeners
        });
    };

    // --- NAVIGATION ---
    const handleNavigation = (e) => {
        e.preventDefault();
        const targetViewId = e.currentTarget.getAttribute("data-view") || e.currentTarget.getAttribute("data-view-target");
        
        contentViews.forEach(view => view.style.display = 'none');
        document.getElementById(targetViewId).style.display = 'block';

        document.querySelectorAll(".nav-link").forEach(link => {
            link.classList.remove("active");
            if(link.getAttribute("data-view") === targetViewId) {
                link.classList.add("active");
            }
        });
    };

    // --- RENDER FUNCTIONS ---
    const renderDashboard = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date
        const upcomingAppointments = allPerjanjian.filter(p => p.no_rm_pasien === currentPasien.no_rm && new Date(p.tanggal) >= today);
        const nextAppointment = upcomingAppointments.sort((a,b) => new Date(a.tanggal) - new Date(b.tanggal))[0];

        if (nextAppointment) {
            const dokter = allDokter.find(d => d.id === nextAppointment.id_dokter);
            document.getElementById("nextAppointmentInfo").innerHTML = `
                ${new Date(nextAppointment.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                pukul ${nextAppointment.jam} dengan ${dokter.nama}.
            `;
        } else {
            document.getElementById("nextAppointmentInfo").textContent = "Tidak ada janji temu yang akan datang.";
        }

        const visitHistoryCount = currentPasien.rekamMedis ? currentPasien.rekamMedis.length : 0;
        document.getElementById("visitHistoryCount").textContent = `Anda memiliki ${visitHistoryCount} riwayat kunjungan.`;
    };

    const renderJadwalDokter = () => {
        const tableBody = document.getElementById("jadwalDokterBody");
        tableBody.innerHTML = '';
        allJadwal.forEach(jadwal => {
            const dokter = allDokter.find(d => d.id === jadwal.id_dokter);
            if (dokter) {
                tableBody.innerHTML += `
                    <tr>
                        <td>${dokter.nama}</td>
                        <td>${dokter.spesialisasi}</td>
                        <td>${jadwal.hari}</td>
                        <td>${jadwal.jamMulai} - ${jadwal.jamSelesai}</td>
                    </tr>
                `;
            }
        });
    };

    const renderRiwayat = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const myAppointments = allPerjanjian.filter(p => p.no_rm_pasien === currentPasien.no_rm)
            .sort((a,b) => new Date(b.tanggal) - new Date(a.tanggal));

        const upcomingContainer = document.getElementById("upcomingAppointments");
        const pastContainer = document.getElementById("pastAppointments");
        upcomingContainer.innerHTML = '';
        pastContainer.innerHTML = '';

        myAppointments.forEach(janji => {
            const dokter = allDokter.find(d => d.id === janji.id_dokter);
            const isPast = new Date(janji.tanggal) < today;

            const cardHTML = `
                <div class="appointment-card ${isPast ? 'past' : ''}" data-janji-id="${janji.id}">
                    <div class="appointment-details">
                        <h4 style="color:${isPast ? 'var(--secondary-color)' : 'var(--primary-color)'};">
                            ${dokter.spesialisasi} - ${dokter.nama}
                        </h4>
                        <p>${new Date(janji.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} | Pukul ${janji.jam}</p>
                    </div>
                    <div class="appointment-actions">
                    ${!isPast ? `
                        <button class="btn-secondary" onclick="openBukti('${janji.id}')">Lihat Bukti</button>
                        <button class="btn-danger" onclick="cancelAppointment('${janji.id}')">Batalkan</button>
                    ` : `
                         <p>Kunjungan Selesai <i class="fas fa-check-circle" style="color:var(--success-color);"></i></p>
                    `}
                    </div>
                    ${isPast ? `
                    <div class="soap-notes" id="soap-${janji.id}">
                        <!-- Notes will be loaded here -->
                    </div>` : ''}
                </div>
            `;
            if (isPast) {
                pastContainer.innerHTML += cardHTML;
            } else {
                upcomingContainer.innerHTML += cardHTML;
            }
        });

        document.querySelectorAll('.appointment-card.past .appointment-details').forEach(card => {
            card.addEventListener('click', (e) => {
                const janjiId = e.currentTarget.parentElement.getAttribute('data-janji-id');
                toggleSoapNotes(janjiId);
            });
        });

        if(upcomingContainer.innerHTML === '') upcomingContainer.innerHTML = '<p>Tidak ada janji temu.</p>';
        if(pastContainer.innerHTML === '') pastContainer.innerHTML = '<p>Tidak ada riwayat kunjungan.</p>';
    };

    // --- APPOINTMENT BOOKING FORM ---
    const setupAppointmentForm = () => {
        const poliSelect = document.getElementById("pilihPoli");
        const dokterSelect = document.getElementById("pilihDokter");
        const tanggalInput = document.getElementById("pilihTanggal");
        const form = document.getElementById("formBuatJanji");
        
        const today = new Date().toISOString().split('T')[0];
        tanggalInput.setAttribute('min', today);
        
        const polis = [...new Set(allDokter.map(d => d.spesialisasi))];
        polis.forEach(p => poliSelect.innerHTML += `<option value="${p}">${p}</option>`);

        poliSelect.addEventListener("change", () => {
            const selectedPoli = poliSelect.value;
            dokterSelect.innerHTML = '<option value="">-- Pilih Dokter --</option>';
            if (selectedPoli) {
                allDokter.filter(d => d.spesialisasi === selectedPoli).forEach(d => {
                    dokterSelect.innerHTML += `<option value="${d.id}">${d.nama}</option>`;
                });
                dokterSelect.disabled = false;
            } else {
                dokterSelect.disabled = true;
            }
            tanggalInput.disabled = true;
            resetTimeSlots();
        });

        dokterSelect.addEventListener("change", () => {
            tanggalInput.disabled = !dokterSelect.value;
            resetTimeSlots();
        });

        tanggalInput.addEventListener("change", () => {
            const idDokter = dokterSelect.value;
            const tanggal = new Date(tanggalInput.value);
            const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][tanggal.getDay()];
            
            const jadwalDokter = allJadwal.find(j => j.id_dokter == idDokter && j.hari === hari);
            renderTimeSlots(jadwalDokter, idDokter, tanggalInput.value);
        });

        form.addEventListener("submit", createAppointment);
    };

    const renderTimeSlots = (jadwal, idDokter, tanggal) => {
        const container = document.getElementById("slotJamContainer");
        resetTimeSlots();
        if (!jadwal) {
            container.innerHTML = '<p class="info-text">Dokter tidak praktik pada hari yang dipilih.</p>';
            return;
        }

        const jamMulai = parseInt(jadwal.jamMulai.split(':')[0]);
        const jamSelesai = parseInt(jadwal.jamSelesai.split(':')[0]);
        const appointmentsOnDate = allPerjanjian.filter(p => p.id_dokter == idDokter && p.tanggal === tanggal);
        const bookedSlots = appointmentsOnDate.map(p => p.jam);
        
        let availableSlots = '';
        for (let i = jamMulai; i < jamSelesai; i++) {
            const jam = `${String(i).padStart(2, '0')}:00`;
            if (!bookedSlots.includes(jam)) {
                availableSlots += `<div class="slot-jam" data-jam="${jam}">${jam}</div>`;
            }
        }

        container.innerHTML = availableSlots || '<p class="info-text">Tidak ada jam yang tersedia pada tanggal ini.</p>';
        
        document.querySelectorAll('.slot-jam').forEach(slot => {
            slot.addEventListener('click', () => {
                document.querySelectorAll('.slot-jam').forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
                document.getElementById('submitJanjiBtn').disabled = false;
            });
        });
    };
    
    const resetTimeSlots = () => {
        document.getElementById("slotJamContainer").innerHTML = '<p class="info-text">Pilih dokter dan tanggal untuk melihat jam tersedia.</p>';
        document.getElementById('submitJanjiBtn').disabled = true;
    };

    const createAppointment = (e) => {
        e.preventDefault();
        const selectedSlot = document.querySelector(".slot-jam.selected");
        if (!selectedSlot) {
            alert("Silakan pilih jam janji temu.");
            return;
        }

        const newAppointment = {
            id: 'p' + (allPerjanjian.length + 1) + Date.now(),
            no_rm_pasien: currentPasien.no_rm,
            id_dokter: parseInt(document.getElementById("pilihDokter").value),
            tanggal: document.getElementById("pilihTanggal").value,
            jam: selectedSlot.getAttribute('data-jam'),
            status: "Menunggu"
        };
        
        allPerjanjian.push(newAppointment);
        localStorage.setItem("dataPerjanjian", JSON.stringify(allPerjanjian));
        alert("Janji temu berhasil dibuat!");
        
        e.target.reset();
        resetTimeSlots();
        renderRiwayat();
        renderDashboard();
    };

    // --- OTHER ACTIONS ---
    window.openBukti = (janjiId) => {
        const janji = allPerjanjian.find(p => p.id === janjiId);
        const dokter = allDokter.find(d => d.id === janji.id_dokter);
        
        document.getElementById('buktiRM').textContent = currentPasien.no_rm;
        document.getElementById('buktiNama').textContent = currentPasien.nama;
        document.getElementById('buktiPoli').textContent = dokter.spesialisasi;
        document.getElementById('buktiDokter').textContent = dokter.nama;
        document.getElementById('buktiTanggal').textContent = new Date(janji.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
        document.getElementById('buktiJam').textContent = janji.jam;
        
        const appointmentsOnDay = allPerjanjian.filter(p => p.tanggal === janji.tanggal && p.id_dokter === janji.id_dokter)
            .sort((a,b) => a.jam.localeCompare(b.jam));
        const queueNumber = appointmentsOnDay.findIndex(p => p.id === janjiId) + 1;
        document.getElementById('buktiAntrian').textContent = String(queueNumber).padStart(3, '0');
        
        modal.classList.add('show');
    };

    window.cancelAppointment = (janjiId) => {
        if (confirm("Apakah Anda yakin ingin membatalkan janji temu ini?")) {
            allPerjanjian = allPerjanjian.filter(p => p.id !== janjiId);
            localStorage.setItem("dataPerjanjian", JSON.stringify(allPerjanjian));
            alert("Janji temu telah dibatalkan.");
            renderRiwayat();
            renderDashboard();
        }
    };
    
    window.toggleSoapNotes = (janjiId) => {
        const soapContainer = document.getElementById(`soap-${janjiId}`);
        if(soapContainer.style.display === 'block') {
            soapContainer.style.display = 'none';
            return;
        }

        const rekamMedis = currentPasien.rekamMedis.find(r => r.id_janji === janjiId);
        if (rekamMedis) {
            soapContainer.innerHTML = `
                <p><strong>Subjektif:</strong> ${rekamMedis.subjective || '-'}</p>
                <p><strong>Objektif:</strong> ${rekamMedis.objective || '-'}</p>
                <p><strong>Asesmen:</strong> ${rekamMedis.assessment || '-'}</p>
                <p><strong>Rencana:</strong> ${rekamMedis.plan || '-'}</p>
            `;
        } else {
            soapContainer.innerHTML = '<p>Catatan dokter untuk kunjungan ini tidak tersedia.</p>';
        }
        soapContainer.style.display = 'block';
    };

    const logout = () => {
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        window.location.href = "../login.html";
    };

    // --- START THE APP ---
    init();
});
