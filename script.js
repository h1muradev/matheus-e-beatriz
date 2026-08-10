const openBtn = document.getElementById('openExperience');
const experience = document.getElementById('experience');
const replay = document.getElementById('replay');
const hearts = document.querySelector('.hearts');
const daysTogether = document.getElementById('daysTogether');
const musicCard = document.getElementById('musicCard');
const musicFrame = document.getElementById('youtubeMusicFrame');
const musicStatus = document.getElementById('musicStatus');
const musicFallback = document.getElementById('musicFallback');

let musicStarted = false;
const musicUrl = 'https://www.youtube.com/embed/eQVPwzsTY1U?autoplay=1&playsinline=1&controls=1&rel=0';

function startMusic(restart = false) {
  if (!musicFrame) return;

  if (musicStarted && !restart) return;

  if (restart) {
    musicFrame.src = 'about:blank';
  }

  const loadMusic = () => {
    musicFrame.src = musicUrl;
    musicStarted = true;
    musicCard?.classList.add('started');
    if (musicStatus) musicStatus.textContent = 'tocando nossa música ♫';
    if (musicFallback) musicFallback.textContent = 'reiniciar nossa música ♫';
  };

  if (restart) {
    setTimeout(loadMusic, 40);
  } else {
    loadMusic();
  }
}

function reveal() {
  experience?.classList.add('open');
  for (let i = 0; i < 14; i++) setTimeout(spawnHeart, i * 80);
  setTimeout(() => experience?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 160);
}

openBtn?.addEventListener('click', () => {
  // A navegação do player acontece no mesmo clique que abre a surpresa.
  // Isso dá ao navegador uma interação explícita do usuário para iniciar o áudio.
  startMusic();
  reveal();
});

musicFallback?.addEventListener('click', () => {
  startMusic(true);
});

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