const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxzdt7494I3nRsPj3bS_JFJWQdzwBFluFnwl-4RloWVOvJ_8DjENpiS4mNSH_U2jyEh/exec";
const KUNCI_RAHASIA = "Mus4"; // HARUS SAMA PERSIS

// ... (kode rekap.js lainnya)

async function initRekap() {
    // ...
    try {
        // UBAH BARIS INI
        const response = await fetch(`${SCRIPT_URL}?action=getJadwal&kunci=${KUNCI_RAHASIA}`);
        // ...
    } catch (error) { /*...*/ }
}

async function tampilkanRekap() {
    // ...
    try {
        // UBAH BARIS INI
        const response = await fetch(`${SCRIPT_URL}?action=getRekap&kelas=${kelas}&tanggal=${tanggal}&kunci=${KUNCI_RAHASIA}`);
        // ...
    } catch (error) { /*...*/ }
}
