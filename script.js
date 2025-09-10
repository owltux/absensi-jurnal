// === Ganti dengan URL Web App Anda ===
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxzdt7494I3nRsPj3bS_JFJWQdzwBFluFnwl-4RloWVOvJ_8DjENpiS4mNSH_U2jyEh/exec";

// === Variabel Elemen HTML ===
const kelasSelect = document.getElementById("pilihKelas");
const siswaContainer = document.getElementById("daftarSiswaContainer");
const loading = document.getElementById("loading");
const form = document.getElementById("presensiForm");
const submitBtn = document.getElementById("submitBtn");
const pesanStatus = document.getElementById("pesanStatus");
const quickActionsDiv = document.getElementById("quickActions");
const btnPilihSemuaHadir = document.getElementById("pilihSemuaHadir");
const jurnalSection = document.getElementById("jurnalSection");
const infoJadwal = document.getElementById("infoJadwal"); // Elemen baru
let jadwalTersimpan = null; // Variabel global untuk menyimpan jadwal

// === Fungsi untuk mengambil daftar kelas (tetap sama) ===
async function ambilDaftarKelas() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getKelas`);
        const result = await response.json();
        if (result.status === "sukses") {
            kelasSelect.innerHTML = '<option value="">-- Pilih Kelas --</option>';
            result.data.forEach(kelas => {
                if(kelas) {
                    kelasSelect.add(new Option(kelas, kelas));
                }
            });
        } else {
            kelasSelect.innerHTML = '<option value="">Gagal memuat</option>';
        }
    } catch (error) {
        console.error("Error fetching kelas:", error);
        kelasSelect.innerHTML = '<option value="">Error</option>';
    }
}

// === Fungsi untuk mengambil siswa & jadwal (DIPERBARUI) ===
async function ambilDaftarSiswa(namaKelas) {
    // Sembunyikan semua elemen saat kelas diganti
    siswaContainer.innerHTML = '';
    submitBtn.style.display = 'none';
    quickActionsDiv.style.display = 'none';
    jurnalSection.style.display = 'none';
    infoJadwal.style.display = 'none'; 
    jadwalTersimpan = null;

    if (!namaKelas) {
        loading.textContent = 'Pilih kelas untuk menampilkan daftar siswa.';
        loading.style.display = 'block';
        return;
    }

    loading.textContent = `Memuat daftar siswa untuk ${namaKelas}...`;
    loading.style.display = 'block';

    try {
        const response = await fetch(`${SCRIPT_URL}?action=getSiswa&kelas=${encodeURIComponent(namaKelas)}`);
        const result = await response.json();
        
        if (result.status === "sukses") {
            loading.style.display = 'none';
            const data = result.data;
            
            // Tampilkan jadwal
            if (data.jadwal) {
                jadwalTersimpan = data.jadwal; // Simpan jadwal
                infoJadwal.innerHTML = `Jadwal Hari Ini: <strong>${data.jadwal.masuk} - ${data.jadwal.selesai}</strong>`;
                infoJadwal.style.display = 'block';
            }
            
            // Tampilkan siswa
            tampilkanSiswa(data.siswa);
            if (data.siswa.length > 0) {
                submitBtn.style.display = 'block';
                quickActionsDiv.style.display = 'flex';
                jurnalSection.style.display = 'block';
            } else {
                loading.textContent = `Tidak ada siswa di kelas ${namaKelas}.`;
                loading.style.display = 'block';
            }
        } else {
            loading.textContent = "Gagal memuat data siswa: " + result.message;
        }
    } catch (error) {
        console.error("Error fetching siswa:", error);
        loading.textContent = "Terjadi kesalahan jaringan.";
    }
}

// === Fungsi untuk submit form (DIPERBARUI) ===
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!jadwalTersimpan) {
        alert("Jadwal kelas tidak ditemukan, tidak dapat mengirim absensi.");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengirim...';
    pesanStatus.textContent = '';
    
    const dataPresensi = [];
    document.querySelectorAll('.status-pilihan').forEach((pilihan, index) => {
        dataPresensi.push({
            nis: pilihan.dataset.nis,
            nama: pilihan.dataset.nama,
            status: document.querySelector(`input[name="status_${index}"]:checked`).value
        });
    });

    const dataUntukDikirim = {
        tanggal: document.getElementById('tanggal').value,
        kelas: kelasSelect.value,
        refleksi: document.getElementById('refleksi').value,
        rencana: document.getElementById('rencana').value,
        presensi: dataPresensi,
        jadwal: jadwalTersimpan // Kirim data jadwal yang disimpan
    };
    
    try {
        await fetch(SCRIPT_URL, {
            method: 'POST', mode: 'no-cors',
            body: JSON.stringify(dataUntukDikirim)
        });
        pesanStatus.textContent = "✓ Absensi & Jurnal berhasil dikirim!";
        pesanStatus.style.color = "green";
        document.getElementById('refleksi').value = '';
        document.getElementById('rencana').value = '';
    } catch (error) {
        pesanStatus.textContent = "❌ Terjadi kesalahan!";
        pesanStatus.style.color = "red";
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Kirim Absensi & Jurnal';
    }
});

// --- Fungsi dan Event Listener lain (TETAP SAMA) ---
function tampilkanSiswa(siswaList) {
    siswaList.forEach((siswa, index) => {
        const siswaRow = document.createElement('div');
        siswaRow.classList.add('siswa-row');
        siswaRow.innerHTML = `
            <div class="siswa-info">
                <div class="nama">${index + 1}. ${siswa.nama}</div>
                <div class="nis">NIS: ${siswa.nis}</div>
            </div>
            <div class="status-pilihan" data-nis="${siswa.nis}" data-nama="${siswa.nama}">
                <label><input type="radio" name="status_${index}" value="Hadir" required> Hadir</label>
                <label><input type="radio" name="status_${index}" value="Sakit"> Sakit</label>
                <label><input type="radio" name="status_${index}" value="Izin"> Izin</label>
                <label><input type="radio" name="status_${index}" value="Alfa"> Alfa</label>
            </div>
        `;
        siswaContainer.appendChild(siswaRow);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('tanggal').valueAsDate = new Date();
    ambilDaftarKelas();
});

kelasSelect.addEventListener('change', () => {
    ambilDaftarSiswa(kelasSelect.value);
});

btnPilihSemuaHadir.addEventListener('click', () => {
    document.querySelectorAll('input[type="radio"][value="Hadir"]').forEach(radio => {
        radio.checked = true;
    });
});


