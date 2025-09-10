// ===================================================================================
// PENTING: Ganti URL di bawah ini dengan URL Web App Anda
// ===================================================================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxzdt7494I3nRsPj3bS_JFJWQdzwBFluFnwl-4RloWVOvJ_8DjENpiS4mNSH_U2jyEh/exec";
// ===================================================================================

let idToken = null; // Variabel global untuk menyimpan "tiket" login

/**
 * Fungsi ini dipanggil oleh Google setelah login berhasil.
 */
function handleCredentialResponse(response) {
    idToken = response.credential; // Simpan "tiket" login

    // Sembunyikan dinding login dan tampilkan aplikasi utama
    document.getElementById('login-wall').style.display = 'none';
    document.querySelector('.main-container').style.display = 'block';

    // Panggil fungsi init() untuk memuat jadwal dan memulai aplikasi
    init(); 
}

// === 1. DEKLARASI ELEMEN DOM ===
const tanggalInput = document.getElementById('tanggal');
const jadwalSelect = document.getElementById('pilihJadwal');
// ... (sisa deklarasi elemen DOM Anda)
const infoHariKelas = document.getElementById('info-hari-kelas');
const namaHariSpan = document.getElementById('nama-hari');
const initialView = document.getElementById('initial-view');
const attendanceView = document.getElementById('attendance-view');
const studentListBody = document.getElementById('student-list-body');
const countHadir = document.getElementById('count-hadir');
const countIzin = document.getElementById('count-izin');
const countSakit = document.getElementById('count-sakit');
const countTotal = document.getElementById('count-total');
const kondisiKelasSelect = document.getElementById('kondisi-kelas');
const catatanPembelajaranText = document.getElementById('catatan-pembelajaran');
const tindakLanjutText = document.getElementById('tindak-lanjut');
const btnSemuaHadir = document.getElementById('btnSemuaHadir');
const btnReset = document.getElementById('btnReset');
const btnSimpan = document.getElementById('btnSimpan');
const btnCetak = document.getElementById('btnCetak');

let jadwalData = [];
let siswaData = [];

// === 2. FUNGSI UTAMA & PEMANGGILAN DATA ===

/**
 * Fungsi ini sekarang dipanggil SETELAH login berhasil.
 */
async function init() {
    tanggalInput.valueAsDate = new Date();
    updateNamaHari();

    try {
        // PENTING: Sekarang kita mengirimkan idToken saat meminta data
        const response = await fetch(`${SCRIPT_URL}?action=getJadwal&idToken=${idToken}`);
        const result = await response.json();

        if (result.status === "sukses") {
            jadwalData = result.data;
            jadwalSelect.innerHTML = '<option value="">-- Pilih Jam Mengajar --</option>';
            jadwalData.forEach((jadwal, index) => {
                const optionText = `Jam ke-${index + 1} (${jadwal.jamMasuk}-${jadwal.jamSelesai}) - ${jadwal.kelas}`;
                jadwalSelect.add(new Option(optionText, jadwal.id));
            });
        } else {
            alert(`Gagal memuat jadwal: ${result.message}`);
            jadwalSelect.innerHTML = `<option value="">${result.message}</option>`;
        }
    } catch (error) {
        console.error("Error fetching jadwal:", error);
        jadwalSelect.innerHTML = '<option value="">Error memuat jadwal</option>';
    }
}

async function handleJadwalChange() {
    // ... (Fungsi ini tetap sama, tapi kita perbarui fetch-nya)
    const selectedJadwalId = jadwalSelect.value;
    if (!selectedJadwalId) { /* ... kode ... */ return; }
    const selectedJadwal = jadwalData.find(j => j.id === selectedJadwalId);
    if (!selectedJadwal) return;

    initialView.style.display = 'none';
    attendanceView.style.display = 'none';
    infoHariKelas.innerHTML = `<span id="nama-hari">${getNamaHari(tanggalInput.value)}</span> - ✨ <span id="info-status">${selectedJadwal.kelas}</span>`;

    try {
        // PENTING: Kirim idToken saat meminta data siswa
        const response = await fetch(`${SCRIPT_URL}?action=getSiswa&kelas=${encodeURIComponent(selectedJadwal.kelas)}&idToken=${idToken}`);
        const result = await response.json();

        if (result.status === "sukses") {
            siswaData = result.data;
            tampilkanSiswa(siswaData);
            attendanceView.style.display = 'block';
        } else {
            alert(`Gagal mengambil data siswa: ${result.message}`);
        }
    } catch (error) {
        console.error("Error fetching siswa:", error);
        alert('Terjadi kesalahan saat mengambil data siswa.');
    }
}

function tampilkanSiswa(siswaList) {
    // ... (Fungsi ini tidak perlu diubah, salin dari kode lama Anda)
    studentListBody.innerHTML = '';
    if (siswaList.length === 0) {
        studentListBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Tidak ada siswa di kelas ini.</td></tr>';
        return;
    }
    siswaList.forEach((siswa, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${index + 1}</td><td><div>${siswa.nama}</div><small style="color: #777;">NIS: ${siswa.nis || '-'}</small></td><td><input type="radio" name="status-${index}" value="Hadir" data-index="${index}"></td><td><input type="radio" name="status-${index}" value="Izin" data-index="${index}"></td><td><input type="radio" name="status-${index}" value="Sakit" data-index="${index}"></td><td><input type="text" class="keterangan-input" placeholder="Keterangan..."></td>`;
        studentListBody.appendChild(row);
    });
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', updateRingkasan);
    });
    updateRingkasan();
}

// === 3. FUNGSI INTERAKTIF & PEMBANTU ===

// ... (Salin semua fungsi helper Anda yang lain ke sini: updateRingkasan, aturSemuaHadir, resetAbsensi, cetakAbsensi, getNamaHari, updateNamaHari)
function updateRingkasan() { /* ... kode ... */ }
function aturSemuaHadir() { /* ... kode ... */ }
function resetAbsensi() { /* ... kode ... */ }
function cetakAbsensi() { /* ... kode ... */ }
function getNamaHari(tanggalString) { /* ... kode ... */ }
function updateNamaHari() { /* ... kode ... */ }


async function simpanData() {
    // ... (Fungsi ini tetap sama, tapi kita perbarui objek datanya)
    btnSimpan.disabled = true;
    btnSimpan.textContent = 'Menyimpan...';

    const selectedJadwal = jadwalData.find(j => j.id === jadwalSelect.value);
    const dataPresensi = [];
    studentListBody.querySelectorAll('tr').forEach((row, index) => {
        const statusChecked = row.querySelector(`input[name="status-${index}"]:checked`);
        const keteranganInput = row.querySelector('.keterangan-input');
        dataPresensi.push({ nis: siswaData[index].nis, nama: siswaData[index].nama, status: statusChecked ? statusChecked.value : 'Alfa', keterangan: keteranganInput ? keteranganInput.value : '' });
    });

    const dataUntukDikirim = {
        idToken: idToken, // <-- PENTING: Sertakan idToken saat menyimpan
        tanggal: tanggalInput.value,
        kelas: selectedJadwal.kelas,
        jadwal: { masuk: selectedJadwal.jamMasuk, selesai: selectedJadwal.jamSelesai },
        kondisiKelas: kondisiKelasSelect.value,
        refleksi: catatanPembelajaranText.value,
        rencana: tindakLanjutText.value,
        presensi: dataPresensi
    };

    try {
        // Untuk POST, kita tidak perlu mode no-cors lagi
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(dataUntukDikirim)
        });
        const result = await response.json();
        if(result.status === 'sukses'){
            alert('Data absensi dan jurnal berhasil disimpan!');
            jadwalSelect.value = '';
            handleJadwalChange();
        } else {
            alert(`Gagal menyimpan data: ${result.message}`);
        }
    } catch (error) {
        console.error('Error submitting data:', error);
        alert('Gagal menyimpan data. Silakan coba lagi.');
    } finally {
        btnSimpan.disabled = false;
        btnSimpan.textContent = '💾 Simpan Data';
    }
}


// === 4. EVENT LISTENERS ===

// Kita tidak lagi menggunakan DOMContentLoaded untuk memulai, karena init() dipanggil setelah login.
jadwalSelect.addEventListener('change', handleJadwalChange);
tanggalInput.addEventListener('change', updateNamaHari);
btnSemuaHadir.addEventListener('click', aturSemuaHadir);
btnReset.addEventListener('click', resetAbsensi);
btnSimpan.addEventListener('click', simpanData);
btnCetak.addEventListener('click', cetakAbsensi);
