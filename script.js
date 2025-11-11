// Ketinggian dan Visual Konstan (DATA PATEN)
const BASE_ELEVATION = 1000; 
const MAX_ELEVATION = 3600; 
const ELEVATION_INCREMENT = 180; 

// Visual Mapping (DATA PATEN): 
const PIXELS_PER_100_MDPL = 40; 
const HORIZONTAL_UNIT = 180; // Satuan pergeseran horizontal (untuk normalisasi perhitungan X dan Y)

// Data peserta, kini memiliki kontrol kemiringan individu (DATA PATEN)
let participants = [
    { id: 1, name: 'Tim Gn. Ciremai', elevation: BASE_ELEVATION, xPos: '5%', imgFile: 'ciremai.png', horizontalPx: 10, direction: 5 }, 
    { id: 2, name: 'Tim Gn. Guntur', elevation: BASE_ELEVATION, xPos: '19%', imgFile: 'guntur.png', horizontalPx: 6, direction: 5 }, 
    { id: 3, name: 'Tim Gn. Gede', elevation: BASE_ELEVATION, xPos: '33%', imgFile: 'gede.png', horizontalPx: 3, direction: 4.5 }, 
    { id: 4, name: 'Tim Gn. Cikuray', elevation: BASE_ELEVATION, xPos: '47%', imgFile: 'cikuray.png', horizontalPx: 0, direction: 0 }, 
    { id: 5, name: 'Tim Gn. Papandayan', elevation: BASE_ELEVATION, xPos: '61%', imgFile: 'papandayan.png', horizontalPx: 3, direction: -4.5 }, 
    { id: 6, name: 'Tim Gn. Tangkuban', elevation: BASE_ELEVATION, xPos: '75%', imgFile: 'tangkuban.png', horizontalPx: 6, direction: -4.3 }, 
    { id: 7, name: 'Tim Gn. Malabar', elevation: BASE_ELEVATION, xPos: '89%', imgFile: 'malabar.png', horizontalPx: 10, direction: -4.5 } 
];

// ====================================================
// --- FUNGSI BARU: AUDIO UTILITY ---
// ====================================================

/**
 * Memutar elemen audio berdasarkan ID.
 * @param {string} audioId - ID dari elemen <audio> (misal: 'sound-click').
 */
function playSound(audioId) {
    const audio = document.getElementById(audioId);
    if (audio) {
        // Reset waktu putar ke awal (agar bisa diputar berkali-kali dengan cepat)
        audio.currentTime = 0; 
        audio.play().catch(error => {
            // Log error jika browser memblokir pemutaran otomatis
            console.warn("Audio Playback Error:", error);
        });
    }
}

// ====================================================
// --- LOGIKA PERGERAKAN ---
// ====================================================

function calculateXOffset(stepCount, xPosBase, participant) {
    // Total piksel pergeseran dihitung menggunakan data 'horizontalPx' dan 'direction'
    // Perhitungan di bawah menyesuaikan dengan ELEVATION_INCREMENT 180
    const normalizedSteps = (stepCount * ELEVATION_INCREMENT) / HORIZONTAL_UNIT;

    const totalOffset = normalizedSteps * participant.horizontalPx * participant.direction;
    return `calc(${xPosBase} + ${totalOffset}px)`;
}

function calculateYPosition(elevation) {
    // Total MDPL yang dicapai sejak BASE_ELEVATION
    const totalElevationGain = elevation - BASE_ELEVATION;

    // Kenaikan visual dihitung berdasarkan PIXELS_PER_100_MDPL (40px per 100 mdpl)
    const verticalOffset = (totalElevationGain / HORIZONTAL_UNIT) * PIXELS_PER_100_MDPL;
    
    return `translateY(-${verticalOffset}px)`;
}

function handleIconClick(id) {
    const participant = participants.find(p => p.id === id);

    if (participant && participant.elevation < MAX_ELEVATION) {
        
        // 🚨 Suara 1: Klik Biasa
        playSound('sound-click'); 

        // Cek apakah klik ini akan mencapai puncak
        const willReachMax = (participant.elevation + ELEVATION_INCREMENT) >= MAX_ELEVATION;

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
        if (participant.elevation === MAX_ELEVATION && willReachMax) {
            // 🚨 Suara 2: Mencapai Puncak
            playSound('sound-puncak'); 

            elevationDisplay.textContent = `PUNCAK! ${MAX_ELEVATION} mdpl`;
            iconElement.style.boxShadow = '0 0 15px 5px gold'; 
            iconElement.style.cursor = 'default'; 
            
            // Hapus event listener untuk mencegah klik ganda pada puncak
            // Gunakan cloneNode untuk mereplace element agar event lama hilang
            const newIcon = iconElement.cloneNode(true);
            iconElement.parentNode.replaceChild(newIcon, iconElement);
        }
    }
}

// ====================================================
// --- LOGIKA RANKING DAN MODAL ---
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
        // 🚨 Suara 3: Klik Buka Ranking
        playSound('sound-ranking'); 

        renderRanking(); // Render ranking sebelum menampilkan
        modal.classList.remove('modal-hidden');
    } else {
        modal.classList.add('modal-hidden');
    }
}

// ====================================================
// --- FUNGSI RENDER AWAL DAN INISIALISASI ---
// ====================================================

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

function startBGM() {
    const bgm = document.getElementById('background-music');
    if (bgm) {
        bgm.volume = 0.3; // Opsional: Atur volume BGM agar tidak terlalu keras
        bgm.play().catch(error => {
            // Biarkan kosong, karena ini akan terjadi jika tidak ada interaksi pengguna
            console.warn("BGM Playback Blocked:", error);
        });
    }
}

// Panggil fungsi render saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    // 1. Panggil renderScoreboard awal
    renderScoreboard(); 

    // 2. Coba mulai BGM (mungkin diblokir)
    startBGM(); 

    // 3. Tombol Show Ranking
    document.getElementById('show-ranking-btn').addEventListener('click', () => {
        toggleRankingModal(true);
    });

    // 4. Tombol Close (x)
    document.querySelector('.close-btn').addEventListener('click', () => {
        toggleRankingModal(false);
    });

    // 5. Menutup modal saat klik di luar area modal
    document.getElementById('ranking-modal').addEventListener('click', (e) => {
        if (e.target.id === 'ranking-modal') {
            toggleRankingModal(false);
        }
    });
    
    // 6. KUNCI: Pemicu BGM pada interaksi pertama
    // Jika BGM diblokir, interaksi pertama (klik karakter atau tombol) akan memicunya.
    document.body.addEventListener('click', startBGM, { once: true });
});