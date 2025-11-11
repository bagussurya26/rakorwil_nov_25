// Ketinggian dan Visual Konstan (REVISI MAX MDPL)
const BASE_ELEVATION = 1000; 
const MAX_ELEVATION = 3600; // BATAS MAKSIMAL MDPL BARU
const ELEVATION_INCREMENT = 180; // Naik 100 mdpl per klik

// Visual Mapping: 
// Total langkah: (3600 - 1000) / 100 = 26 langkah
const PIXELS_PER_100_MDPL = 40; // Disesuaikan agar total pergerakan vertikal tetap muat di layar
// Jika 26 langkah * 20px/langkah = 520px total pergerakan vertikal
// Anda mungkin perlu menyesuaikan nilai ini bersama dengan 'bottom: 180px;' di CSS

// Data peserta, kini memiliki kontrol kemiringan individu
let participants = [
    { id: 1, name: 'Adi', elevation: BASE_ELEVATION, xPos: '5%', imgFile: 'karakter_1.png', horizontalPx: 10, direction: 5 }, // Paling miring (ke Kanan)
    { id: 2, name: 'Budi', elevation: BASE_ELEVATION, xPos: '19%', imgFile: 'karakter_2.png', horizontalPx: 6, direction: 5 }, 
    { id: 3, name: 'Cici', elevation: BASE_ELEVATION, xPos: '33%', imgFile: 'karakter_3.png', horizontalPx: 3, direction: 4.5 }, 
    { id: 4, name: 'Dina', elevation: BASE_ELEVATION, xPos: '47%', imgFile: 'karakter_4.png', horizontalPx: 0, direction: 0 }, // Lurus
    { id: 5, name: 'Eko', elevation: BASE_ELEVATION, xPos: '61%', imgFile: 'karakter_5.png', horizontalPx: 3, direction: -4.5 }, 
    { id: 6, name: 'Fani', elevation: BASE_ELEVATION, xPos: '75%', imgFile: 'karakter_6.png', horizontalPx: 6, direction: -4.3 }, 
    { id: 7, name: 'Gita', elevation: BASE_ELEVATION, xPos: '89%', imgFile: 'karakter_7.png', horizontalPx: 10, direction: -4.5 } // Paling miring (ke Kiri)
];

// ----------------------------------------------------
// Fungsi untuk menghitung pergeseran Horizontal (X)
// ----------------------------------------------------
function calculateXOffset(stepCount, xPosBase, participant) {
    // Total piksel pergeseran dihitung menggunakan data 'horizontalPx' dan 'direction'
    const totalOffset = stepCount * participant.horizontalPx * participant.direction;
    
    // Gunakan fungsi calc() CSS untuk menambahkan offset piksel ke persentase dasar
    return `calc(${xPosBase} + ${totalOffset}px)`;
}


// ----------------------------------------------------
// Fungsi untuk menghitung posisi vertikal (Y)
// ----------------------------------------------------
function calculateYPosition(elevation) {
    // Hitung berapa kali kenaikan (100 mdpl) yang sudah dicapai
    const stepCount = (elevation - BASE_ELEVATION) / ELEVATION_INCREMENT; 
    return `translateY(-${stepCount * PIXELS_PER_100_MDPL}px)`;
}

// ----------------------------------------------------
// Fungsi yang dipanggil saat ikon diklik
// ----------------------------------------------------
function handleIconClick(id) {
    const participant = participants.find(p => p.id === id);

    if (participant && participant.elevation < MAX_ELEVATION) {
        
        // 1. Update Data Ketinggian (dibatasi hingga MAX_ELEVATION)
        participant.elevation = Math.min(participant.elevation + ELEVATION_INCREMENT, MAX_ELEVATION);

        // 2. Hitung Langkah Baru
        const newStepCount = (participant.elevation - BASE_ELEVATION) / ELEVATION_INCREMENT;

        // 3. Update Tampilan (DOM)
        const iconElement = document.getElementById(`icon-${id}`);
        const elevationDisplay = iconElement.querySelector('.elevation-display'); 
        
        // Hitung dan Terapkan posisi X dan Y yang baru
        const newXPos = calculateXOffset(newStepCount, participant.xPos, participant); 
        iconElement.style.transform = calculateYPosition(participant.elevation); // Pergerakan Vertikal
        iconElement.style.left = newXPos; // Pergerakan Horizontal

        // Perbarui teks ketinggian
        elevationDisplay.textContent = `${participant.elevation} mdpl`;

        // Logika Puncak
        if (participant.elevation === MAX_ELEVATION) {
            elevationDisplay.textContent = `PUNCAK! ${MAX_ELEVATION} mdpl`;
            iconElement.style.boxShadow = '0 0 15px 5px gold'; 
            iconElement.style.cursor = 'default'; 
            // Hentikan event listener
            iconElement.removeEventListener('click', handleIconClick);
        }
    }
}

// ----------------------------------------------------
// Fungsi untuk merender seluruh Scoreboard
// ----------------------------------------------------
function renderScoreboard() {
    const appContainer = document.getElementById('mountain-app');
    appContainer.innerHTML = ''; 

    participants.forEach(p => {
        const stepCount = (p.elevation - BASE_ELEVATION) / ELEVATION_INCREMENT;
        const currentXPos = calculateXOffset(stepCount, p.xPos, p); 

        // --- 1. Ikon Karakter (Container Utama yang Bergerak) ---
        const icon = document.createElement('div');
        icon.id = `icon-${p.id}`;
        icon.className = 'peserta-icon';
        icon.style.left = currentXPos; // Posisi Horizontal Awal
        icon.style.transform = calculateYPosition(p.elevation); // Posisi Vertikal Awal
        
        // Gambar Karakter
        const charImage = document.createElement('img');
        charImage.src = p.imgFile; 
        charImage.alt = p.name;
        icon.appendChild(charImage);

        // --- 2. Teks Nama (CHILD DARI IKON) ---
        const nameDisplay = document.createElement('div');
        nameDisplay.className = 'peserta-label name'; 
        nameDisplay.textContent = p.name;
        icon.appendChild(nameDisplay); 

        // --- 3. Teks Ketinggian MDPL (CHILD DARI IKON) ---
        const elevationDisplay = document.createElement('div');
        elevationDisplay.className = 'peserta-label mdpl elevation-display'; 
        elevationDisplay.textContent = `${p.elevation} mdpl`;
        icon.appendChild(elevationDisplay); 
        
        // Event listener
        icon.addEventListener('click', () => handleIconClick(p.id));
        
        appContainer.appendChild(icon);
    });
}

// ====================================================
// --- FUNGSI BARU: LOGIKA RANKING DAN MODAL ---
// ====================================================

/**
 * Mengurutkan peserta berdasarkan ketinggian (tertinggi ke terendah) dan merender ke modal.
 */
function renderRanking() {
    // 1. Salin dan Urutkan peserta berdasarkan elevation
    const sortedParticipants = [...participants].sort((a, b) => b.elevation - a.elevation);
    
    const rankingList = document.getElementById('ranking-list');
    rankingList.innerHTML = ''; // Bersihkan daftar lama

    sortedParticipants.forEach((p, index) => {
        const rankDiv = document.createElement('div');
        rankDiv.innerHTML = `
            <span class="rank-item">#${index + 1}</span>
            <span>${p.name}</span>
            <span>${p.elevation} mdpl</span>
        `;
        rankingList.appendChild(rankDiv);
    });
}

/**
 * Menampilkan atau menyembunyikan modal.
 */
function toggleRankingModal(show) {
    const modal = document.getElementById('ranking-modal');
    if (show) {
        renderRanking(); // Render ranking sebelum menampilkan
        modal.classList.remove('modal-hidden');
    } else {
        modal.classList.add('modal-hidden');
    }
}

// Panggil fungsi render saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    // Panggil renderScoreboard awal
    renderScoreboard(); 

    // Tombol Show Ranking
    document.getElementById('show-ranking-btn').addEventListener('click', () => {
        toggleRankingModal(true);
    });

    // Tombol Close (x)
    document.querySelector('.close-btn').addEventListener('click', () => {
        toggleRankingModal(false);
    });

    // Menutup modal saat klik di luar area modal
    document.getElementById('ranking-modal').addEventListener('click', (e) => {
        if (e.target.id === 'ranking-modal') {
            toggleRankingModal(false);
        }
    });
});