document.addEventListener("DOMContentLoaded", () => {
    // --- ELEMEN DOM ---
    const navLinks = document.querySelectorAll(".sidebar ul li a");
    const contentSections = document.querySelectorAll(".content-section");
    const modal = document.getElementById("formModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const btnBatal = document.getElementById("btnBatal");
    const dataForm = document.getElementById("dataForm");
    const modalTitle = document.getElementById("modalTitle");

    // --- State Aplikasi ---
    let dokterData = JSON.parse(localStorage.getItem('dataDokter')) || [];
    let pasienData = JSON.parse(localStorage.getItem('dataPasien')) || [];
    let jadwalData = JSON.parse(localStorage.getItem('dataJadwal')) || [];
    let currentEditId = null;
    let currentDataType = '';

    // --- FUNGSI RENDER ---
    const renderDokterTable = (data = dokterData) => {
        const tableBody = document.getElementById("dokterTableBody");
        tableBody.innerHTML = '';
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Data tidak ditemukan.</td></tr>`;
            return;
        }
        data.forEach(dokter => {
            const row = `
                <tr>
                    <td>${dokter.id}</td>
                    <td>${dokter.nama}</td>
                    <td>${dokter.spesialisasi}</td>
                    <td>${dokter.telp}</td>
                    <td class="actions">
                        <button class="btn btn-edit" onclick="handleEdit('dokter', ${dokter.id})"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn btn-danger" onclick="handleDelete('dokter', ${dokter.id})"><i class="fas fa-trash"></i> Hapus</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    };

    const renderPasienTable = (data = pasienData) => {
        const tableBody = document.getElementById("pasienTableBody");
        tableBody.innerHTML = '';
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Data tidak ditemukan.</td></tr>`;
            return;
        }
        data.forEach(pasien => {
            const row = `
                <tr>
                    <td>${pasien.no_rm}</td>
                    <td>${pasien.nama}</td>
                    <td>${pasien.tgl_lahir}</td>
                    <td>${pasien.alamat}</td>
                    <td class="actions">
                        <button class="btn btn-danger" onclick="handleDelete('pasien', '${pasien.no_rm}')"><i class="fas fa-trash"></i> Hapus</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    };

    const renderJadwalTable = (data = jadwalData) => {
        const tableBody = document.getElementById("jadwalTableBody");
        tableBody.innerHTML = '';
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Data tidak ditemukan.</td></tr>`;
            return;
        }
        data.forEach(jadwal => {
            const dokter = dokterData.find(d => d.id === jadwal.id_dokter);
            const row = `
                <tr>
                    <td>${dokter ? dokter.nama : 'Dokter tidak ditemukan'}</td>
                    <td>${dokter ? dokter.spesialisasi : '-'}</td>
                    <td>${jadwal.hari}</td>
                    <td>${jadwal.jam}</td>
                    <td class="actions">
                        <button class="btn btn-edit" onclick="handleEdit('jadwal', ${jadwal.id})"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn btn-danger" onclick="handleDelete('jadwal', ${jadwal.id})"><i class="fas fa-trash"></i> Hapus</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    };

    const renderStats = () => {
        const statsContainers = document.querySelectorAll(".stats-container");
        const totalDokter = dokterData.length;
        const totalPasien = pasienData.length;
        const totalJadwal = jadwalData.length;

        const statsHTML = `
            <div class="stat-card" style="border-color: #3498db;">
                <div class="icon" style="background-color: #3498db;"><i class="fas fa-user-doctor"></i></div>
                <div class="info">
                    <h3>${totalDokter}</h3>
                    <p>Total Dokter</p>
                </div>
            </div>
            <div class="stat-card" style="border-color: #2ecc71;">
                <div class="icon" style="background-color: #2ecc71;"><i class="fas fa-user-injured"></i></div>
                <div class="info">
                    <h3>${totalPasien}</h3>
                    <p>Total Pasien</p>
                </div>
            </div>
            <div class="stat-card" style="border-color: #e67e22;">
                <div class="icon" style="background-color: #e67e22;"><i class="fas fa-calendar-check"></i></div>
                <div class="info">
                    <h3>${totalJadwal}</h3>
                    <p>Total Jadwal Praktik</p>
                </div>
            </div>
        `;
        statsContainers.forEach(container => container.innerHTML = statsHTML);
    };

    // --- FUNGSI MODAL ---
    const openModal = (type, id = null) => {
        currentDataType = type;
        currentEditId = id;
        dataForm.innerHTML = '';

        if (type === 'dokter') {
            modalTitle.textContent = id ? 'Edit Data Dokter' : 'Tambah Data Dokter';
            const dokter = id ? dokterData.find(d => d.id === id) : {};
            dataForm.innerHTML = `
                <div class="form-group">
                    <label for="nama">Nama Lengkap</label>
                    <input type="text" id="nama" name="nama" value="${dokter.nama || ''}" required>
                </div>
                <div class="form-group">
                    <label for="spesialisasi">Spesialisasi</label>
                    <input type="text" id="spesialisasi" name="spesialisasi" value="${dokter.spesialisasi || ''}" required>
                </div>
                <div class="form-group">
                    <label for="telp">No. Telepon</label>
                    <input type="tel" id="telp" name="telp" value="${dokter.telp || ''}" required>
                </div>
            `;
        } else if (type === 'jadwal') {
            modalTitle.textContent = id ? 'Edit Jadwal Praktik' : 'Tambah Jadwal Praktik';
            const jadwal = id ? jadwalData.find(j => j.id === id) : {};
            const dokterOptions = dokterData.map(d => 
                `<option value="${d.id}" ${jadwal.id_dokter === d.id ? 'selected' : ''}>${d.nama} (${d.spesialisasi})</option>`
            ).join('');

            dataForm.innerHTML = `
                <div class="form-group">
                    <label for="id_dokter">Pilih Dokter</label>
                    <select id="id_dokter" name="id_dokter" required>${dokterOptions}</select>
                </div>
                <div class="form-group">
                    <label for="hari">Hari</label>
                    <select id="hari" name="hari" required>
                        <option value="Senin" ${jadwal.hari === 'Senin' ? 'selected' : ''}>Senin</option>
                        <option value="Selasa" ${jadwal.hari === 'Selasa' ? 'selected' : ''}>Selasa</option>
                        <option value="Rabu" ${jadwal.hari === 'Rabu' ? 'selected' : ''}>Rabu</option>
                        <option value="Kamis" ${jadwal.hari === 'Kamis' ? 'selected' : ''}>Kamis</option>
                        <option value="Jumat" ${jadwal.hari === 'Jumat' ? 'selected' : ''}>Jumat</option>
                        <option value="Sabtu" ${jadwal.hari === 'Sabtu' ? 'selected' : ''}>Sabtu</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="jam">Jam Praktik (e.g., 09:00 - 12:00)</label>
                    <input type="text" id="jam" name="jam" value="${jadwal.jam || ''}" required>
                </div>
            `;
        }
        modal.setAttribute('aria-hidden', 'false');
    };
    
    const closeModal = () => {
        modal.setAttribute('aria-hidden', 'true');
        dataForm.reset();
        currentEditId = null;
        currentDataType = '';
    };

    // --- FUNGSI CRUD & EVENT HANDLERS GLOBAL ---
    window.handleEdit = (type, id) => {
        openModal(type, id);
    };

    window.handleDelete = (type, id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;

        if (type === 'dokter') {
            dokterData = dokterData.filter(d => d.id !== id);
            localStorage.setItem('dataDokter', JSON.stringify(dokterData));
            renderDokterTable();
        } else if (type === 'pasien') {
            pasienData = pasienData.filter(p => p.no_rm !== id);
            localStorage.setItem('dataPasien', JSON.stringify(pasienData));
            renderPasienTable();
        } else if (type === 'jadwal') {
            jadwalData = jadwalData.filter(j => j.id !== id);
            localStorage.setItem('dataJadwal', JSON.stringify(jadwalData));
            renderJadwalTable();
        }
        renderStats(); // Update stats setelah hapus
    };
    
    dataForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(dataForm);
        const newData = Object.fromEntries(formData.entries());

        if (currentDataType === 'dokter') {
            if (currentEditId) { // Edit
                const index = dokterData.findIndex(d => d.id === currentEditId);
                dokterData[index] = { ...dokterData[index], ...newData };
            } else { // Tambah
                const newId = dokterData.length > 0 ? Math.max(...dokterData.map(d => d.id)) + 1 : 1;
                dokterData.push({ id: newId, ...newData });
            }
            localStorage.setItem('dataDokter', JSON.stringify(dokterData));
            renderDokterTable();
        } else if (currentDataType === 'jadwal') {
            newData.id_dokter = parseInt(newData.id_dokter); // Pastikan id_dokter adalah number
            if (currentEditId) { // Edit
                const index = jadwalData.findIndex(j => j.id === currentEditId);
                jadwalData[index] = { ...jadwalData[index], ...newData };
            } else { // Tambah
                const newId = jadwalData.length > 0 ? Math.max(...jadwalData.map(j => j.id)) + 1 : 1;
                jadwalData.push({ id: newId, ...newData });
            }
            localStorage.setItem('dataJadwal', JSON.stringify(jadwalData));
            renderJadwalTable();
        }
        
        renderStats(); // Update statistik
        closeModal();
    });

    // --- EVENT LISTENERS UI ---
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");

            const targetId = link.id.replace('nav', '').toLowerCase() + "-view";
            contentSections.forEach(section => {
                section.style.display = section.id === targetId ? 'block' : 'none';
            });
        });
    });

    document.getElementById("btnTambahDokter").addEventListener("click", () => openModal('dokter'));
    document.getElementById("btnTambahJadwal").addEventListener("click", () => openModal('jadwal'));

    closeModalBtn.addEventListener("click", closeModal);
    btnBatal.addEventListener("click", closeModal);
    window.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        if(confirm("Apakah Anda yakin ingin logout?")) {
            localStorage.removeItem('role');
            location.href = '../login.html';
        }
    });

    // Pencarian
    document.getElementById("searchDokter").addEventListener("input", e => {
        const query = e.target.value.toLowerCase();
        const filteredData = dokterData.filter(d => 
            d.nama.toLowerCase().includes(query) || d.spesialisasi.toLowerCase().includes(query)
        );
        renderDokterTable(filteredData);
    });

    document.getElementById("searchPasien").addEventListener("input", e => {
        const query = e.target.value.toLowerCase();
        const filteredData = pasienData.filter(p => 
            p.nama.toLowerCase().includes(query) || p.no_rm.toLowerCase().includes(query)
        );
        renderPasienTable(filteredData);
    });
    
    document.getElementById("searchJadwal").addEventListener("input", e => {
        const query = e.target.value.toLowerCase();
        const filteredData = jadwalData.filter(j => {
            const dokter = dokterData.find(d => d.id === j.id_dokter);
            return dokter && dokter.nama.toLowerCase().includes(query);
        });
        renderJadwalTable(filteredData);
    });

    // --- INISIALISASI ---
    const initialize = () => {
        document.getElementById('dashboard-view').style.display = 'block'; // Tampilkan dashboard utama dulu
        document.getElementById('navDashboard').classList.add('active');
        renderDokterTable();
        renderPasienTable();
        renderJadwalTable();
        renderStats();
    };

    initialize();
});