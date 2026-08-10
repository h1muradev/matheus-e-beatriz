const openBtn = document.getElementById('openExperience');
const experience = document.getElementById('experience');
const replay = document.getElementById('replay');
const hearts = document.querySelector('.hearts');
const daysTogether = document.getElementById('daysTogether');
const spotifyNote = document.querySelector('.spotify-note');

let spotifyController = null;
let spotifyReady = false;
let fallbackEnabled = false;

function enableHeartButton() {
  if (!openBtn) return;
  openBtn.disabled = false;
  openBtn.textContent = 'entrar no meu coração ♡';
}

function reveal() {
  experience?.classList.add('open');
  setTimeout(() => experience?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  for (let i = 0; i < 12; i++) setTimeout(spawnHeart, i * 90);
}

if (openBtn) {
  openBtn.disabled = true;
  openBtn.textContent = 'carregando nossa música...';

  openBtn.addEventListener('click', () => {
    // O play acontece dentro do mesmo gesto do clique para aumentar a
    // compatibilidade com as regras de autoplay dos navegadores.
    if (spotifyController && spotifyReady) {
      try {
        spotifyController.play();
      } catch (error) {
        console.warn('Não foi possível iniciar o Spotify automaticamente.', error);
      }
    }

    reveal();
  });
}

replay?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

function spawnHeart() {
  if (!hearts) return;
  const el = document.createElement('span');
  el.className = 'heart-float';
  el.textContent = Math.random() > .45 ? '♡' : '♥';
  el.style.left = Math.random() * 100 + 'vw';
  el.style.fontSize = 12 + Math.random() * 18 + 'px';
  el.style.animationDuration = 7 + Math.random() * 8 + 's';
  hearts.appendChild(el);
  setTimeout(() => el.remove(), 16000);
}

setInterval(spawnHeart, 650);
for (let i = 0; i < 7; i++) setTimeout(spawnHeart, i * 280);

function updateDays() {
  if (!daysTogether) return;
  const start = new Date('2026-08-07T00:00:00-03:00');
  const now = new Date();
  const diff = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
  daysTogether.textContent = String(diff);
}
updateDays();

// Spotify iFrame API oficial. Mantemos o iframe normal até a API estar pronta,
// então substituímos pelo player controlável.
window.onSpotifyIframeApiReady = (IFrameAPI) => {
  const currentPlayer = document.getElementById('spotifyPlayer');
  if (!currentPlayer) {
    enableHeartButton();
    return;
  }

  const mount = document.createElement('div');
  mount.id = 'spotifyPlayer';
  currentPlayer.replaceWith(mount);

  const options = {
    width: '100%',
    height: 152,
    uri: 'spotify:track:6r6IPuFvUX72kQGc9b46rk'
  };

  IFrameAPI.createController(mount, options, (EmbedController) => {
    spotifyController = EmbedController;

    const markReady = () => {
      if (spotifyReady) return;
      spotifyReady = true;
      enableHeartButton();
      if (spotifyNote) {
        spotifyNote.textContent = 'quando você tocar em “entrar no meu coração”, eu vou tentar começar nossa música junto com a surpresa ♡';
      }
    };

    EmbedController.addListener('ready', markReady);

    // Alguns navegadores entregam o controller antes do evento visual de ready.
    setTimeout(markReady, 900);
  });
};

const spotifyApiScript = document.createElement('script');
spotifyApiScript.src = 'https://open.spotify.com/embed/iframe-api/v1';
spotifyApiScript.async = true;
document.body.appendChild(spotifyApiScript);

// Se a API do Spotify estiver bloqueada por extensão, rede ou navegador,
// não impedimos que a carta seja aberta.
setTimeout(() => {
  if (!spotifyReady && !fallbackEnabled) {
    fallbackEnabled = true;
    enableHeartButton();
  }
}, 5000);
