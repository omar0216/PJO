const VIDEO_ID = 'dQw4w9WgXcQ'; // RECUERDA CAMBIAR ESTO POR TU ID
const REDIRECT_URL = 'https://omar0216.github.io/Sara/';

let player;
let isVideoReady = false;
let currentZoomFactor = 1.15; // Zoom inicial

// Elementos del DOM
const introScreen = document.getElementById('intro-screen');
const btnVer = document.getElementById('btn-ver');
const videoContainer = document.getElementById('video-container');
const blackCurtain = document.getElementById('black-curtain');
const playerWrapper = document.getElementById('player-wrapper');

// --- FEEDBACK DE CARGA ---
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
    // Configuración base del reproductor
    let playerConfig = {
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
            'host': 'https://www.youtube.com' // Ayuda a validar la sesión en incógnito/seguro
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    };

    // Solo si estamos en un servidor web real (http/https), enviamos el origen explícito.
    // Esto ayuda a cumplir las políticas de seguridad de YouTube.
    if (window.location.protocol.startsWith('http')) {
        playerConfig.playerVars.origin = window.location.origin;
    }

    player = new YT.Player('player', playerConfig);
}

function onPlayerReady(event) {
    isVideoReady = true;
    
    btnVer.innerText = "Ver";
    btnVer.style.opacity = "1";
    btnVer.style.pointerEvents = "auto";
    btnVer.style.cursor = "pointer";
    
    // Intentar forzar calidad, pero sin bloquear si falla
    try {
        player.setPlaybackQuality('highres'); 
    } catch(e) {}
    
    resizePlayer(); 
}

function onPlayerError(event) {
    console.error("Error en reproductor de YouTube:", event.data);
    
    // Lógica detallada de errores para depuración
    if(event.data === 150 || event.data === 101) {
        let errorMsg = "No se puede reproducir el video.";
        
        // Si detectamos que se está ejecutando desde un archivo local
        if (window.location.protocol === 'file:') {
            errorMsg = "⚠️ ERROR DE ENTORNO LOCAL:\n\nYouTube bloquea la reproducción de videos con Copyright cuando abres el archivo HTML directamente (doble clic).\n\nSOLUCIÓN: Debes subir estos archivos a un servidor (como GitHub Pages) o usar un 'Localhost'. Al subirlo a la web, funcionará.";
        } else {
            errorMsg = "⚠️ BLOQUEO DE COPYRIGHT/PRIVACIDAD:\n\nYouTube ha bloqueado la reproducción externa.\n\nCAUSA PROBABLE: El video contiene música con Copyright (Sony, UMG, etc.) que prohíbe la reproducción fuera de YouTube.com, o estás en modo Incógnito estricto.\n\nPRUEBA: Cambia el VIDEO_ID por uno genérico para descartar errores de código.";
        }
        
        alert(errorMsg);
    }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        // Reintentar calidad alta
        try { player.setPlaybackQuality('highres'); } catch(e) {}

        setTimeout(() => {
            blackCurtain.style.opacity = '0';
            setTimeout(() => {
                blackCurtain.style.display = 'none';
            }, 500);
        }, 800);

        setTimeout(() => {
            currentZoomFactor = 1.0; 
            playerWrapper.style.transition = 'width 1.5s ease-in-out, height 1.5s ease-in-out';
            resizePlayer(); 
        }, 4000);
    }

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

    player.unMute();
    player.setVolume(100);
    
    // Importante: setPlaybackQuality es una sugerencia, no una orden estricta
    player.setPlaybackQuality('highres');
    
    player.playVideo();

    introScreen.style.opacity = '0';
    videoContainer.style.opacity = '1'; 
    
    setTimeout(() => {
        introScreen.classList.add('hidden');
        resizePlayer();
    }, 800);
});

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
