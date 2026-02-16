// 1. CONFIGURACIÓN
// ----------------
const VIDEO_URL = 'https://www.dropbox.com/scl/fi/seuoupq2wdii0h3y0p88n/VN20260216_074152.mp4?rlkey=85k9isxiq0vonww9a92z0x6j2&st=3g7uv586&raw=1'; 

const REDIRECT_URL = 'https://omar0216.github.io/Sara/';

// Elementos
const introScreen = document.getElementById('intro-screen');
const btnVer = document.getElementById('btn-ver');
const loadingText = document.getElementById('loading-text');
const videoContainer = document.getElementById('video-container');
const mainVideo = document.getElementById('main-video');
const blackCurtain = document.getElementById('black-curtain');

// Asignar fuente al video
mainVideo.src = VIDEO_URL;

// 2. ESTADO DE CARGA ESTRICTO
// ---------------------------
btnVer.disabled = true;
btnVer.innerText = "Cargando 0%...";
loadingText.innerText = "Preparando reproducción fluida..."; // Texto informativo
loadingText.style.display = "block";

// CAMBIO 1: Monitorear progreso de descarga para dar feedback visual
mainVideo.addEventListener('progress', () => {
    if (mainVideo.duration > 0 && mainVideo.buffered.length > 0) {
        // Calculamos cuánto se ha descargado del buffer actual
        const bufferedEnd = mainVideo.buffered.end(mainVideo.buffered.length - 1);
        const duration = mainVideo.duration;
        const percent = Math.min(100, Math.round((bufferedEnd / duration) * 100));
        
        // Actualizamos el botón solo si aún está deshabilitado
        if (btnVer.disabled) {
            btnVer.innerText = `Cargando ${percent}%...`;
        }
    }
});

// CAMBIO 2: Usar 'canplaythrough' en lugar de 'canplay'
// Esto obliga al navegador a esperar hasta calcular que puede reproducir TODO el video sin pausas.
mainVideo.addEventListener('canplaythrough', () => {
    btnVer.disabled = false;
    btnVer.innerText = "Ver";
    btnVer.style.cursor = "pointer";
    loadingText.style.display = "none";
});

// Evento: Si hay error cargando el video
mainVideo.addEventListener('error', (e) => {
    console.error("Error cargando video", e);
    btnVer.innerText = "Error";
    loadingText.innerText = "No se pudo cargar el video (posiblemente muy pesado para tu red).";
    loadingText.style.color = "red";
});


// 3. LÓGICA DE REPRODUCCIÓN
// -------------------------
btnVer.addEventListener('click', () => {
    // Intentar Fullscreen
    requestFullScreenAndOrientation();

    // Reproducir
    mainVideo.play().then(() => {
        // 1. Transición visual
        introScreen.style.opacity = '0';
        videoContainer.style.opacity = '1';
        
        setTimeout(() => {
            introScreen.classList.add('hidden');
            blackCurtain.style.opacity = '0';
        }, 800);

    }).catch(error => {
        console.log("Bloqueo de autoplay. Intentando sin sonido...", error);
        mainVideo.muted = true;
        mainVideo.play();
    });
});

// Evento: Cuando el video termina
mainVideo.addEventListener('ended', () => {
    blackCurtain.style.opacity = '1';
    blackCurtain.style.display = 'block';
    
    setTimeout(() => {
        window.location.href = REDIRECT_URL;
    }, 100); 
});


// 4. UTILIDADES
// -------------
function requestFullScreenAndOrientation() {
    const docEl = document.documentElement;

    if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
    } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
    }

    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
    }
}

document.addEventListener('contextmenu', event => event.preventDefault());