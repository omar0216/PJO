const VIDEO_ID = 'HnL2pXGPBZs'; // RECUERDA CAMBIAR ESTO POR TU ID
const REDIRECT_URL = 'https://omar0216.github.io/Sara/';

let player;
let isVideoReady = false;
let currentZoomFactor = 1.35; // Zoom inicial fuerte para ocultar HUD

// Elementos del DOM
const introScreen = document.getElementById('intro-screen');
const btnVer = document.getElementById('btn-ver');
const videoContainer = document.getElementById('video-container');
const blackCurtain = document.getElementById('black-curtain');
const playerWrapper = document.getElementById('player-wrapper');

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
            'origin': window.location.origin
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    isVideoReady = true;
    resizePlayer(); // Ajustar tamaño inicial con zoom
}

function onPlayerStateChange(event) {
    // --- ESTADO: REPRODUCIENDO ---
    if (event.data === YT.PlayerState.PLAYING) {
        
        // 1. Quitar cortina negra para mostrar el video
        setTimeout(() => {
            blackCurtain.style.opacity = '0';
            setTimeout(() => {
                blackCurtain.style.display = 'none';
            }, 500);
        }, 800);

        // 2. Quitar el Zoom después de 4 segundos
        setTimeout(() => {
            currentZoomFactor = 1.0; // Volver a tamaño normal (cover)
            
            // Añadir transición para que el "des-zoom" sea suave
            playerWrapper.style.transition = 'width 1.5s ease-in-out, height 1.5s ease-in-out';
            
            resizePlayer(); // Aplicar nuevo tamaño
        }, 4000);
    }

    // --- ESTADO: TERMINADO (ENDED) ---
    if (event.data === YT.PlayerState.ENDED) {
        // 1. Cortar a negro inmediatamente para tapar sugerencias
        blackCurtain.style.display = 'block';
        
        // Forzamos la opacidad a 1 sin transición para que sea instantáneo
        blackCurtain.style.transition = 'none'; 
        blackCurtain.style.opacity = '1';

        // 2. Redirección inmediata
        window.location.href = REDIRECT_URL;
    }
}

btnVer.addEventListener('click', () => {
    if (!isVideoReady) return;

    requestFullScreenAndOrientation();

    // Desvanecer intro
    introScreen.style.opacity = '0';
    
    setTimeout(() => {
        introScreen.classList.add('hidden');
        videoContainer.style.opacity = '1';
        
        player.unMute();
        player.setVolume(100);
        player.playVideo();
        
        // Forzar resize nuevamente al mostrar
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

    // Calcular dimensiones base para cubrir la pantalla (object-fit: cover manual)
    if (windowRatio > videoRatio) {
        // La pantalla es más ancha que el video
        newWidth = w;
        newHeight = w / videoRatio;
    } else {
        // La pantalla es más alta que el video
        newHeight = h;
        newWidth = h * videoRatio;
    }

    // Aplicar el factor de zoom actual (1.35 al inicio, 1.0 después)
    playerWrapper.style.width = (newWidth * currentZoomFactor) + 'px';
    playerWrapper.style.height = (newHeight * currentZoomFactor) + 'px';
}

window.addEventListener('resize', resizePlayer);

function requestFullScreenAndOrientation() {
    const docEl = document.documentElement;

    // Intentar pantalla completa
    if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(err => {});
    } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
    } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
    }

    // Intentar bloquear orientación horizontal (solo Android/Móvil compatible)
    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(err => {});
    }
}
