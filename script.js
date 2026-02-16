const VIDEO_ID = 'jrdRW7_7X44'; // RECUERDA CAMBIAR ESTO POR TU ID
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
    // Detectamos si estamos en un servidor web (http/https) o archivo local (file)
    // YouTube bloquea 'origin' si es 'file://', así que solo lo enviamos si es web.
    const origin = window.location.protocol.startsWith('http') ? window.location.origin : undefined;

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
            'origin': origin, // Corrección automática del origen
            'host': 'https://www.youtube.com' // Ayuda con restricciones de privacidad
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerReady(event) {
    isVideoReady = true;
    
    btnVer.innerText = "Ver";
    btnVer.style.opacity = "1";
    btnVer.style.pointerEvents = "auto";
    btnVer.style.cursor = "pointer";
    
    player.setPlaybackQuality('highres'); 
    resizePlayer(); 
}

function onPlayerError(event) {
    console.error("Error en reproductor de YouTube:", event.data);
    if(event.data === 150 || event.data === 101) {
        alert("Error: Este video tiene bloqueada la reproducción externa. Si es tuyo, ve a YouTube Studio > Detalles > Mostrar más > y marca 'Permitir inserción'.");
    }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        player.setPlaybackQuality('highres');

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
