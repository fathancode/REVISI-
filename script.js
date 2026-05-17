/* =========================================
   1. VARIABEL GLOBAL
========================================= */
let isPlaying = false;
let audioObj = document.getElementById('bg-music');
let isAutoScrolling = false;
let autoScrollFrame;
let lastScrollTime = 0;
const SCROLL_SPEED = 60; // Pixels per second

/* =========================================
   2. BUKA UNDANGAN & MULAI ANIMASI (ZOOM IN)
========================================= */
function openInvitation() {
    const cover = document.getElementById('cover');
    const mainContent = document.getElementById('main-content');
    const bottomNav = document.getElementById('bottom-navbar');
    const musicIcon = document.getElementById('music-icon');
    const scrollBtn = document.getElementById('auto-scroll-btn');
    
    // Putar Musik Otomatis
    if (audioObj) {
        audioObj.play().then(() => {
            isPlaying = true;
            musicIcon.classList.add('action-active');
        }).catch(() => console.log("Autoplay dicegah browser"));
    }
    
    // Animasi Kebuka (Masuk ke dalam / Zoom in smooth)
    cover.style.transition = 'transform 1.5s cubic-bezier(0.77, 0, 0.175, 1), opacity 1.2s ease, filter 1.2s ease';
    cover.style.transform = 'scale(2.2) translateY(-10vh)'; 
    cover.style.opacity = '0';
    cover.style.filter = 'blur(15px)';
    
    setTimeout(() => {
        cover.style.display = 'none';
        mainContent.style.display = 'block';
        bottomNav.style.display = 'flex'; 
        scrollBtn.style.display = 'flex'; 
        
        startCountdown();
        
        // PERBAIKAN: Pastikan halaman dimulai dari paling atas (Home) agar tidak melangkahi bagian awal
        window.scrollTo(0, 0);
        
        // Mulai auto-scroll perlahan setelah animasi buka undangan selesai (jeda 1 detik)
        setTimeout(() => {
            if (!isAutoScrolling) toggleAutoScroll(); 
        }, 1000);
    }, 1200);
}

/* =========================================
   3. GULIR MULUS VIA MENU
========================================= */
function scrollToSection(sectionId, event) {
    if(event) event.preventDefault();
    if(isAutoScrolling) toggleAutoScroll(); 

    if (sectionId === 'home') {
        // Karena #home bersifat sticky, scrollIntoView seringkali berhenti saat #mempelai masih menutupinya.
        // Menggunakan window.scrollTo(0) memastikan layar kembali ke titik nol mutlak.
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    const targetSection = document.getElementById(sectionId);
    if(targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/* =========================================
   4. KONTROL TEMA, MUSIK, & AUTO SCROLL
========================================= */
function toggleTheme(event) {
    if(event) event.preventDefault();
    document.body.classList.toggle('dark-mode');
    const themeIcon = document.getElementById('theme-icon');
    
    if (document.body.classList.contains('dark-mode')) {
        themeIcon.className = 'fa-solid fa-sun action-active'; 
    } else {
        themeIcon.className = 'far fa-moon'; 
    }
}

function toggleMusic(event) {
    if(event) event.preventDefault();
    const musicIcon = document.getElementById('music-icon');
    
    if (isPlaying) {
        audioObj.pause();
        musicIcon.className = 'fas fa-volume-mute'; 
        musicIcon.classList.remove('action-active');
    } else {
        audioObj.play();
        musicIcon.className = 'fas fa-music action-active'; 
    }
    isPlaying = !isPlaying;
}

function toggleAutoScroll(event) {
    if(event) event.preventDefault();
    const scrollIcon = document.getElementById('scroll-icon');

    if (isAutoScrolling) {
        cancelAnimationFrame(autoScrollFrame);
        scrollIcon.className = 'fas fa-play';
        isAutoScrolling = false;
    } else {
        scrollIcon.className = 'fas fa-pause';
        isAutoScrolling = true;
        smoothStep();
    }

    function smoothStep() {
        if (!isAutoScrolling) return;

        // Menggunakan 1px per frame untuk menghindari jitter sub-pixel di browser tertentu
        window.scrollBy(0, 1); 
        
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 2) {
            cancelAnimationFrame(autoScrollFrame);
            scrollIcon.className = 'fas fa-play';
            isAutoScrolling = false;
            return;
        }
        autoScrollFrame = requestAnimationFrame(smoothStep);
    }
}

window.addEventListener('wheel', () => { if(isAutoScrolling) toggleAutoScroll(); });
window.addEventListener('touchstart', () => { if(isAutoScrolling) toggleAutoScroll(); });

/* =========================================
   5. DETEKSI SCROLL UNTUK ANIMASI & MENU AKTIF
========================================= */
// FUNGSI UNTUK UPDATE MENU NAVIGASI AKTIF BERDASARKAN POSISI SCROLL
function updateActiveNav() {
    const navItems = document.querySelectorAll('.nav-item');
    const scrollSections = document.querySelectorAll('.scroll-section');
    let currentSectionId = "home"; // Default awal

    scrollSections.forEach(section => {
        const sectionTop = section.offsetTop;
        // Menggunakan offset 200px agar transisi menu terasa lebih responsif
        if (window.scrollY >= sectionTop - 200) {
            currentSectionId = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        const href = item.getAttribute('href');
        if (href === `#${currentSectionId}`) {
            item.classList.add('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('rsvp-form');
    const wishesBox = document.getElementById('wishes-box');
    const scriptURL = 'https://script.google.com/macros/s/AKfycbxAjM_HjFnjm6fCNvrzuVAtCIhsKokNeUhBDfGfRxFcKa9AnSatWlayxSstdhgM7hOG/exec';

    window.addEventListener('scroll', () => {
        // Jalankan update menu navigasi aktif setiap kali user scroll
        updateActiveNav();
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, { 
        threshold: 0.15, // Pemicu sedikit lebih dalam agar transisi 'timbul' terlihat jelas oleh user
        rootMargin: "0px 0px -20px 0px" // Offset kecil agar elemen tidak muncul terlalu mepet dengan bawah layar
    });

    document.querySelectorAll('.scroll-section, .morph-element, .morph-mempelai, .brush-name, .brush-date, .brush-right-to-left, .quran-verse-anim').forEach(el => {
        observer.observe(el);
    });

    // --- GUEST BOOK LOGIC ---
    function loadMessages() {
        wishesBox.innerHTML = '<p style="text-align:center; font-size:0.85rem; padding: 10px;">Memuat pesan dari tamu lain... <i class="fas fa-spinner fa-spin"></i></p>';
        
        fetch(scriptURL)
            .then(response => response.json())
            .then(data => {
                wishesBox.innerHTML = ''; // Bersihkan tulisan "Memuat..."
                
                if (data.length === 0) {
                    wishesBox.innerHTML = '<p style="text-align:center; font-size:0.85rem; padding: 10px;">Belum ada pesan. Jadilah yang pertama!</p>';
                    return;
                }

                // Tampilkan semua pesan yang ditarik dari Spreadsheet
                data.forEach(item => {
                    // Cek jika datanya kosong lewati saja
                    if(!item.nama && !item.pesan) return; 

                    const badgeClass = item.kehadiran === 'Hadir' ? 'badge-color' : 'badge-red';
                    const wishCard = document.createElement('div');
                    wishCard.className = 'wish-card';
                    wishCard.innerHTML = `
                        <h4>${item.nama} <span class="badge ${badgeClass}">${item.kehadiran}</span></h4>
                        <p class="wish-text">${item.pesan}</p>
                    `;
                    wishesBox.appendChild(wishCard);
                });
            })
            .catch(error => {
                console.error('Error loading messages:', error);
                wishesBox.innerHTML = '<p style="text-align:center; font-size:0.85rem; color:red;">Gagal memuat pesan riwayat.</p>';
            });
    }

    // Jalankan fungsi ambil pesan saat web pertama kali dibuka
    loadMessages();


    // 2. FUNGSI UNTUK MENGIRIM PESAN BARU
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault(); 
            const btnSubmit = form.querySelector('button');
            const originalText = btnSubmit.innerHTML;
            
            btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
            btnSubmit.disabled = true;

            const inputNama = form.nama.value;
            const inputKehadiran = form.kehadiran.value;
            const inputPesan = form.pesan.value;
            const badgeClass = inputKehadiran === 'Hadir' ? 'badge-color' : 'badge-red';

            // Elemen visual sementara agar terlihat instan oleh pengirim
            const newWish = document.createElement('div');
            newWish.classList.add('wish-card');
            newWish.innerHTML = `
                <h4>${inputNama} <span class="badge ${badgeClass}">${inputKehadiran}</span></h4>
                <p class="wish-text">${inputPesan}</p>
            `;

            const formData = new FormData(form);

            fetch(scriptURL, { method: 'POST', body: formData })
                .then(response => {
                    // Masukkan pesan baru ke urutan paling atas di layar pengirim
                    wishesBox.prepend(newWish); 
                    form.reset();
                    btnSubmit.innerHTML = originalText;
                    btnSubmit.disabled = false;
                    
                    showToast("Pesan Anda sudah terkirim! Terima kasih."); 
                })
                .catch(error => {
                    console.error('Error!', error.message);
                    showToast("Maaf, pesan gagal dikirim. Silakan coba lagi.");
                    btnSubmit.innerHTML = originalText;
                    btnSubmit.disabled = false;
                });
        });
    }

    // --- NAME FROM URL LOGIC ---
    const urlParams = new URLSearchParams(window.location.search);
    const namaTamu = urlParams.get('to');
    const elemenNamaTamu = document.getElementById('nama-tamu');
    if (elemenNamaTamu) {
        elemenNamaTamu.innerText = namaTamu || "Tamu Undangan";
    }
});

/* =========================================
   6. HITUNG MUNDUR & UTILITIES
========================================= */
function startCountdown() {
    const countDownDate = new Date("Jun 02, 2026 09:00:00").getTime();
    const timer = setInterval(function() {
        const distance = countDownDate - new Date().getTime();
        if (distance < 0) {
            clearInterval(timer);
            return;
        }
        
        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("hari").innerText = String(d).padStart(2, '0');
        document.getElementById("jam").innerText = String(h).padStart(2, '0');
        document.getElementById("menit").innerText = String(m).padStart(2, '0');
        document.getElementById("detik").innerText = String(s).padStart(2, '0');
    }, 1000);
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-kaca';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function copyRekening() {
    const norek = document.getElementById("norek").innerText.trim();
    
    navigator.clipboard.writeText(norek).then(() => { 
        showToast("Nomor Rekening berhasil disalin!"); 
    }).catch(() => {
        showToast("Gagal menyalin rekening.");
    });
}