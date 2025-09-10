// ===================================================================================
// PENTING: Ganti URL di bawah ini dengan URL Web App dari Google Apps Script Anda!
// ===================================================================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxzdt7494I3nRsPj3bS_JFJWQdzwBFluFnwl-4RloWVOvJ_8DjENpiS4mNSH_U2jyEh/exec";
// ===================================================================================


// === 1. DEKLARASI ELEMEN DOM ===
const tanggalInput = document.getElementById('tanggal');
const jadwalSelect = document.getElementById('pilihJadwal');
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

let jadwalData = []; // Untuk menyimpan data jadwal dari Google Sheet
let siswaData = [];  // Untuk menyimpan data siswa yang sedang ditampilkan

// === 2. FUNGSI UTAMA & PEMANGGILAN DATA ===

/**
 * Fungsi ini berjalan saat halaman pertama kali dimuat.
 */
async function init() {
    // Set tanggal hari ini
    tanggalInput.valueAsDate = new Date();
    updateNamaHari();

    // Ambil daftar jadwal dari Google Sheet
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getJadwal`);
        const result = await response.json();
        
        if (result.status === "sukses") {
            jadwalData = result.data;
            jadwalSelect.innerHTML = '<option value="">-- Pilih Jam Mengajar --</option>';
            jadwalData.forEach((jadwal, index) => {
                const optionText = `Jam ke-${index + 1} (${jadwal.jamMasuk}-${jadwal.jamSelesai}) - ${jadwal.kelas}`;
                jadwalSelect.add(new Option(optionText, jadwal.id));
            });
        } else {
            jadwalSelect.innerHTML = '<option value="">Gagal memuat jadwal</option>';
        }
    } catch (error) {
        console.error("Error fetching jadwal:", error);
        jadwalSelect.innerHTML = '<option value="">Error memuat jadwal</option>';
    }
}

/**
 * Fungsi yang dipanggil saat jadwal dipilih dari dropdown.
 */
async function handleJadwalChange() {
    const selectedJadwalId = jadwalSelect.value;
    if (!selectedJadwalId) {
        initialView.style.display = 'block';
        attendanceView.style.display = 'none';
        return;
    }

    const selectedJadwal = jadwalData.find(j => j.id === selectedJadwalId);
    if (!selectedJadwal) return;

    // Tampilkan loading & sembunyikan tampilan awal
    initialView.style.display = 'none';
    attendanceView.style.display = 'none'; // Sembunyikan dulu sampai data siswa siap
    
    // Update info header
    infoHariKelas.innerHTML = `<span id="nama-hari">${getNamaHari(tanggalInput.value)}</span> - ✨ <span id="info-status">${selectedJadwal.kelas}</span>`;

    // Ambil daftar siswa
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getSiswa&kelas=${encodeURIComponent(selectedJadwal.kelas)}`);
        const result = await response.json();

        if (result.status === "sukses") {
            siswaData = result.data;
            tampilkanSiswa(siswaData);
            attendanceView.style.display = 'block'; // Tampilkan setelah semua siap
        } else {
            alert('Gagal mengambil data siswa.');
        }
    } catch (error) {
        console.error("Error fetching siswa:", error);
        alert('Terjadi kesalahan saat mengambil data siswa.');
    }
}

/**
 * Menampilkan daftar siswa ke dalam tabel.
 */
function tampilkanSiswa(siswaList) {
    studentListBody.innerHTML = ''; // Kosongkan tabel
    if (siswaList.length === 0) {
        studentListBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Tidak ada siswa di kelas ini.</td></tr>';
        return;
    }
    
    siswaList.forEach((siswa, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <div>${siswa.nama}</div>
                <small style="color: #777;">NIS: ${siswa.nis || '-'}</small>
            </td>
            <td><input type="radio" name="status-${index}" value="Hadir" data-index="${index}"></td>
            <td><input type="radio" name="status-${index}" value="Izin" data-index="${index}"></td>
            <td><input type="radio" name="status-${index}" value="Sakit" data-index="${index}"></td>
            <td><input type="text" class="keterangan-input" placeholder="Keterangan..."></td>
        `;
        studentListBody.appendChild(row);
    });

    // Tambahkan event listener ke semua radio button yang baru dibuat
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', updateRingkasan);
    });
    
    updateRingkasan(); // Inisialisasi ringkasan
}

// === 3. FUNGSI INTERAKTIF & PEMBANTU ===

/**
 * Menghitung dan memperbarui ringkasan kehadiran.
 */
function updateRingkasan() {
    let hadir = 0, izin = 0, sakit = 0;
    const totalSiswa = siswaData.length;

    for (let i =
