// ===================================================================================
// PENTING: Ganti URL dan KUNCI RAHASIA di bawah ini
// ===================================================================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxzdt7494I3nRsPj3bS_JFJWQdzwBFluFnwl-4RloWVOvJ_8DjENpiS4mNSH_U2jyEh/exec";
const KUNCI_RAHASIA = "Mus4"; // HARUS SAMA PERSIS dengan di file lainnya
// ===================================================================================

// === ELEMEN DOM HALAMAN REKAP ===
const kelasSelect = document.getElementById('pilihKelasRekap');
const tanggalSelect = document.getElementById('pilihTanggalRekap');
const btnTampilkan = document.getElementById('btnTampilkanRekap');
const rekapView = document.getElementById('rekap-view');
const promptRekap = document.getElementById('prompt-rekap');
const judulRekap = document.getElementById('judulRekap');
const rekapListBody = document.getElementById('rekap-list-body');
const btnCetak = document.getElementById('btnCetakRekap');

/**
 * Inisialisasi halaman rekap
 */
async function initRekap() {
    tanggalSelect.valueAsDate = new Date();
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getJadwal&kunci=${KUNCI_RAHASIA}`);
        const result = await response.json();
        if (result.status === "sukses") {
            const kelasUnik = [...new Set(result.data.map(item => item.kelas))];
            kelasSelect.innerHTML = '<option value="">-- Pilih Kelas --</option>';
            kelasUnik.forEach(kelas => {
                kelasSelect.add(new Option(kelas, kelas));
            });
        } else {
            alert(`Gagal memuat daftar kelas: ${result.message}`);
            kelasSelect.innerHTML = `<option value="">${result.message}</option>`;
        }
    } catch (error) {
        console.error("Error fetching kelas:", error);
        kelasSelect.innerHTML = '<option value="">Error</option>';
    }
}

/**
 * Mengambil dan menampilkan data rekap
 */
async function tampilkanRekap() {
    const kelas = kelasSelect.value;
    const tanggal = tanggalSelect.value;

    if (!kelas || !tanggal) {
        alert("Silakan pilih kelas dan tanggal terlebih dahulu.");
        return;
    }

    btnTampilkan.disabled = true;
    btnTampilkan.textContent = "Memuat...";
    promptRekap.style.display = 'block'; // Tampilkan prompt saat loading
    rekapView.style.display = 'none';

    try {
        const response = await fetch(`${SCRIPT_URL}?action=getRekap&kelas=${kelas}&tanggal=${tanggal}&kunci=${KUNCI_RAHASIA}`);
        const result = await response.json();
        
        if (result.status === "sukses") {
            if (result.data.length > 0) {
                judulRekap.textContent = `Rekap Absensi Kelas ${kelas} - ${new Date(tanggal + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
                rekapListBody.innerHTML = ''; 
                
                result.data.forEach((item, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${item.nis}</td>
                        <td>${item.nama}</td>
                        <td>${item.status}</td>
                        <td>${item.jamMasuk} - ${item.jamSelesai}</td>
                        <td>${item.keterangan || '-'}</td>
                    `;
                    rekapListBody.appendChild(row);
                });
                rekapView.style.display = 'block';
                promptRekap.style.display = 'none';
            } else {
                alert(`Tidak ada data absensi ditemukan untuk kelas ${kelas} pada tanggal tersebut.`);
                promptRekap.style.display = 'block';
            }
        } else {
             alert(`Gagal memuat rekap: ${result.message}`);
             promptRekap.style.display = 'block';
        }

    } catch (error) {
        console.error("Error fetching rekap:", error);
        alert("Terjadi kesalahan saat mengambil data rekap.");
        promptRekap.style.display = 'block';
    } finally {
        btnTampilkan.disabled = false;
        btnTampilkan.textContent = "Tampilkan Rekap";
    }
}

/**
 * Mencetak Halaman Rekap
 */
function cetakRekap() {
    const style = document.createElement('style');
    style.innerHTML = `@media print {
        body * { visibility: hidden; }
        .rekap-view, .rekap-view * { visibility: visible; }
        .rekap-view { position: absolute; left: 0; top: 0; width: 100%; }
        .rekap-header .btn { display: none !important; }
    }`;
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
}

// === EVENT LISTENERS ===
document.addEventListener('DOMContentLoaded', initRekap);
btnTampilkan.addEventListener('click', tampilkanRekap);
btnCetak.addEventListener('click', cetakRekap);
