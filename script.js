const VIDEO_ID = 'jrdRW7_7X44'; // RECUERDA CAMBIAR ESTO POR TU ID
const REDIRECT_URL = 'https://omar0216.github.io/Sara/';

let player;
let isVideoReady = false;
let currentZoomFactor = 1.15; // Zoom inicial fuerte para ocultar HUD

// Elementos del DOM
const introScreen = document.getElementById('intro-screen');
const btnVer = document.getElementById('btn-ver');
const videoContainer = document.getElementById('video-container');
const blackCurtain = document.getElementById('black-curtain');
const playerWrapper = document.getElementById('player-wrapper');

// --- MEJORA 1: FEEDBACK DE CARGA ---
// Deshabilitamos el botón visualmente hasta que la API esté lista
btnVer.innerText = "Cargando...";
btnVer.style.opacity = "0.5";
btnVer.style.pointerEvents = "none";
btnVer.style.cursor = "default";

// Cargar API de YouTube
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        videoId: VIDEO_ID,
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'disablekb': 1,
            'fs': 0,
            'iv_load_policy': 3,
            'modestbranding': 1,
            'rel': 0,
            'showinfo': 0,
            'playsinline': 1,
            'enablejsapi': 1,
            'origin': window.location.origin // Importante para seguridad
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError // --- MEJORA 2: DETECCIÓN DE ERRORES ---
        }
    });
}

function onPlayerReady(event) {
    isVideoReady = true;
    
    // Habilitar el botón solo cuando el video esté listo para reproducirse
    btnVer.innerText = "Ver";
    btnVer.style.opacity = "1";
    btnVer.style.pointerEvents = "auto";
    btnVer.style.cursor = "pointer";
    
    // INTENTO DE FORZAR CALIDAD MÁXIMA (4K/HighRes)
    player.setPlaybackQuality('highres'); 
    
    resizePlayer(); 
}

// Nueva función para manejar errores de carga del video
function onPlayerError(event) {
    console.error("Error en reproductor de YouTube:", event.data);
    // Códigos de error comunes:
    // 2: ID inválido
    // 100: Video no encontrado o privado
    // 101/150: El dueño del video no permite reproducción en sitios externos
    if(event.data === 150 || event.data === 101) {
        alert("El dueño de este video no permite reproducirlo fuera de YouTube. Por favor cambia el VIDEO_ID por uno que permita incrustación.");
    }
}

function onPlayerStateChange(event) {
    // --- ESTADO: REPRODUCIENDO ---
    if (event.data === YT.PlayerState.PLAYING) {
        
        player.setPlaybackQuality('highres');

        // 1. Quitar cortina negra
        setTimeout(() => {
            blackCurtain.style.opacity = '0';
            setTimeout(() => {
                blackCurtain.style.display = 'none';
            }, 500);
        }, 800);

        // 2. Quitar el Zoom después de 4 segundos
        setTimeout(() => {
            currentZoomFactor = 1.0; 
            playerWrapper.style.transition = 'width 1.5s ease-in-out, height 1.5s ease-in-out';
            resizePlayer(); 
        }, 4000);
    }

    // --- ESTADO: TERMINADO (ENDED) ---
    if (event.data === YT.PlayerState.ENDED) {
        blackCurtain.style.display = 'block';
        blackCurtain.style.transition = 'none'; 
        blackCurtain.style.opacity = '1';
        window.location.href = REDIRECT_URL;
    }
}

btnVer.addEventListener('click', () => {
    if (!isVideoReady) return;

    requestFullScreenAndOrientation();

    // --- MEJORA CRÍTICA: REPRODUCCIÓN INMEDIATA ---
    // Ejecutamos playVideo() INMEDIATAMENTE al hacer clic, sin setTimeout.
    // Esto asegura que el navegador (Chrome/Safari/Incógnito) reconozca
    // la intención del usuario y permita el sonido.
    
    player.unMute();
    player.setVolume(100);
    player.setPlaybackQuality('highres');
    player.playVideo();

    // Manejo visual (Desvanecimiento) separado del comando de video
    introScreen.style.opacity = '0';
    videoContainer.style.opacity = '1'; 
    
    setTimeout(() => {
        introScreen.classList.add('hidden');
        resizePlayer();
    }, 800);
});

// Función de Zoom/Recorte dinámico
function resizePlayer() {
    if (!playerWrapper) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const windowRatio = w / h;
    const videoRatio = 16 / 9;
    
    let newWidth, newHeight;

    if (windowRatio > videoRatio) {
        newWidth = w;
        newHeight = w / videoRatio;
    } else {
        newHeight = h;
        newWidth = h * videoRatio;
    }

    playerWrapper.style.width = (newWidth * currentZoomFactor) + 'px';
    playerWrapper.style.height = (newHeight * currentZoomFactor) + 'px';
}

window.addEventListener('resize', resizePlayer);

function requestFullScreenAndOrientation() {
    const docEl = document.documentElement;

    if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(err => {});
    } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
    } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
    }

    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(err => {});
    }
}
