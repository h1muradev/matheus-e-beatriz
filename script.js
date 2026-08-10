const VIDEO_ID = '2C29r956v40';

const openButton = document.getElementById('openExperience');
const openButtonLabel = openButton?.querySelector('.enter-button-label');
const entrySection = document.getElementById('inicio');
const story = document.getElementById('story');
const replayButton = document.getElementById('replay');
const heartsLayer = document.querySelector('.floating-hearts');
const heartTransition = document.getElementById('heartTransition');
const heartTransitionCanvas = document.getElementById('heartTransitionCanvas');
const loveProgress = document.getElementById('loveProgress');
const musicControl = document.getElementById('musicControl');
const musicAction = musicControl?.querySelector('.music-action');
const fallbackPlayer = document.getElementById('fallbackPlayer');
const daysLabel = document.getElementById('daysLabel');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

let youtubePlayer = null;
let youtubeReady = false;
let experienceOpened = false;
let musicPlaying = false;
let fallbackActive = false;
let heartAnimationFrame = null;
let activeAudioVideo = null;
let musicPausedByVideo = false;

function unlockExperience() {
  if (!openButton) return;
  openButton.disabled = false;
  if (openButtonLabel) openButtonLabel.textContent = 'entrar no meu coração';
}

function loadYouTubeApi() {
  if (window.YT?.Player) {
    window.onYouTubeIframeAPIReady();
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://www.youtube.com/iframe_api';
  script.async = true;
  script.addEventListener('error', unlockExperience, { once: true });
  document.head.appendChild(script);
}

window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
  if (youtubePlayer || !document.getElementById('youtubePlayer')) return;

  youtubePlayer = new window.YT.Player('youtubePlayer', {
    width: 1,
    height: 1,
    videoId: VIDEO_ID,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      playsinline: 1,
      rel: 0,
      modestbranding: 1
    },
    events: {
      onReady: () => {
        youtubeReady = true;
        youtubePlayer.setVolume(72);
        unlockExperience();
      },
      onStateChange: ({ data }) => {
        const states = window.YT.PlayerState;
        if (data === states.PLAYING) setMusicState(true);
        if (data === states.PAUSED || data === states.ENDED) setMusicState(false);
      },
      onError: () => {
        youtubeReady = false;
        if (experienceOpened && !fallbackActive) startFallbackPlayer();
      }
    }
  });
};

function setMusicState(isPlaying) {
  musicPlaying = isPlaying;
  if (!musicControl) return;

  musicControl.classList.toggle('is-playing', isPlaying);
  musicControl.setAttribute('aria-pressed', String(isPlaying));
  musicControl.setAttribute('aria-label', isPlaying ? 'Pausar nossa música' : 'Continuar nossa música');
  if (musicAction) musicAction.textContent = isPlaying ? 'Ⅱ' : '▶';
}

function sendFallbackCommand(command) {
  fallbackPlayer?.contentWindow?.postMessage(
    JSON.stringify({ event: 'command', func: command, args: [] }),
    '*'
  );
}

function startFallbackPlayer() {
  if (!fallbackPlayer) return;

  fallbackActive = true;
  fallbackPlayer.src = `https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&controls=0&disablekb=1&playsinline=1&rel=0&enablejsapi=1`;
  setMusicState(true);
}

function startMusic() {
  if (musicControl) musicControl.hidden = false;

  if (youtubeReady && youtubePlayer?.playVideo) {
    youtubePlayer.unMute();
    youtubePlayer.setVolume(72);
    youtubePlayer.playVideo();
    setMusicState(true);
    return;
  }

  startFallbackPlayer();
}

function pauseBackgroundMusic() {
  if (!musicPlaying) return false;

  if (fallbackActive) {
    sendFallbackCommand('pauseVideo');
    setMusicState(false);
    return true;
  }

  if (youtubeReady && youtubePlayer?.pauseVideo) {
    youtubePlayer.pauseVideo();
    setMusicState(false);
    return true;
  }

  return false;
}

function resumeBackgroundMusic() {
  if (fallbackActive) {
    sendFallbackCommand('playVideo');
    setMusicState(true);
    return;
  }

  if (youtubeReady && youtubePlayer?.playVideo) {
    youtubePlayer.unMute();
    youtubePlayer.playVideo();
    setMusicState(true);
    return;
  }

  startMusic();
}

function stopVideoAudio({ resumeMusic = true } = {}) {
  if (!activeAudioVideo) return;

  const video = activeAudioVideo;
  const card = video.closest('[data-love-video-card]');
  const soundButton = card?.querySelector('[data-video-sound]');
  const soundLabel = card?.querySelector('[data-video-sound-label]');

  video.muted = true;
  card?.classList.remove('is-listening');
  soundButton?.setAttribute('aria-pressed', 'false');
  if (soundLabel) soundLabel.textContent = 'ouvir este momento';

  activeAudioVideo = null;

  if (resumeMusic && musicPausedByVideo) {
    resumeBackgroundMusic();
  }

  musicPausedByVideo = false;
}

function toggleMusic() {
  if (activeAudioVideo) {
    stopVideoAudio({ resumeMusic: false });
  }

  if (fallbackActive) {
    sendFallbackCommand(musicPlaying ? 'pauseVideo' : 'playVideo');
    setMusicState(!musicPlaying);
    return;
  }

  if (youtubeReady && youtubePlayer) {
    if (musicPlaying) youtubePlayer.pauseVideo();
    else {
      youtubePlayer.unMute();
      youtubePlayer.playVideo();
    }
    return;
  }

  if (!fallbackActive) {
    startFallbackPlayer();
  }
}

function spawnHeart(delay = 0) {
  if (!heartsLayer) return;

  window.setTimeout(() => {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = Math.random() > 0.4 ? '♡' : '♥';
    heart.style.left = `${4 + Math.random() * 92}vw`;
    heart.style.fontSize = `${12 + Math.random() * 18}px`;
    heart.style.setProperty('--duration', `${6.5 + Math.random() * 5}s`);
    heart.style.setProperty('--drift', `${-45 + Math.random() * 90}px`);
    heartsLayer.appendChild(heart);
    window.setTimeout(() => heart.remove(), 12000);
  }, delay);
}

function celebrateOpening() {
  if (motionPreference.matches) return;

  for (let index = 0; index < 22; index += 1) {
    spawnHeart(index * 90);
  }
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function createHeartParticles(width, height) {
  const particles = [];
  const centerX = width / 2;
  const centerY = height / 2 - Math.min(28, height * 0.035);
  const scale = Math.min(width / 38, height / 39);
  const words = ['♡', '♡', 'amor', 'Bia'];

  for (let layer = 2; layer <= 10; layer += 1) {
    const layerScale = layer / 10;
    const step = layer < 6 ? 0.25 : 0.18;

    for (let angle = 0; angle < Math.PI * 2; angle += step) {
      const heartX = 16 * Math.pow(Math.sin(angle), 3);
      const heartY = -(13 * Math.cos(angle)
        - 5 * Math.cos(2 * angle)
        - 2 * Math.cos(3 * angle)
        - Math.cos(4 * angle));
      const startAngle = Math.random() * Math.PI * 2;
      const startRadius = Math.max(width, height) * (0.46 + Math.random() * 0.28);

      particles.push({
        startX: centerX + Math.cos(startAngle) * startRadius,
        startY: centerY + Math.sin(startAngle) * startRadius,
        targetX: centerX + heartX * scale * layerScale,
        targetY: centerY + heartY * scale * layerScale,
        delay: Math.random() * 440,
        size: layer > 7 ? 11 + Math.random() * 4 : 8 + Math.random() * 3,
        word: words[Math.floor(Math.random() * words.length)],
        hue: Math.random()
      });
    }
  }

  return { particles, centerX, centerY };
}

function animateHeartTransition() {
  if (!heartTransitionCanvas || motionPreference.matches) return;

  if (heartAnimationFrame) cancelAnimationFrame(heartAnimationFrame);

  const context = heartTransitionCanvas.getContext('2d');
  if (!context) return;

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  heartTransitionCanvas.width = Math.round(width * pixelRatio);
  heartTransitionCanvas.height = Math.round(height * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const { particles, centerX, centerY } = createHeartParticles(width, height);
  const startedAt = performance.now();

  function draw(now) {
    const elapsed = now - startedAt;
    context.clearRect(0, 0, width, height);
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    const pulse = elapsed > 820 ? 1 + Math.sin((elapsed - 820) / 115) * 0.018 : 1;

    particles.forEach((particle) => {
      const rawProgress = Math.max(0, Math.min(1, (elapsed - particle.delay) / 760));
      const progress = easeOutCubic(rawProgress);
      const targetX = centerX + (particle.targetX - centerX) * pulse;
      const targetY = centerY + (particle.targetY - centerY) * pulse;
      const x = particle.startX + (targetX - particle.startX) * progress;
      const y = particle.startY + (targetY - particle.startY) * progress;
      const alpha = Math.min(0.92, rawProgress * (particle.hue > 0.72 ? 0.92 : 0.66));

      context.font = `${particle.word.length > 1 ? particle.size * 0.72 : particle.size}px ${particle.word.length > 1 ? '"DM Sans", sans-serif' : 'Georgia, serif'}`;
      context.fillStyle = particle.hue > 0.72
        ? `rgba(244, 169, 188, ${alpha})`
        : `rgba(213, 103, 135, ${alpha})`;
      context.fillText(particle.word, x, y);
    });

    if (elapsed < 1580) {
      heartAnimationFrame = requestAnimationFrame(draw);
    } else {
      heartAnimationFrame = null;
    }
  }

  heartAnimationFrame = requestAnimationFrame(draw);
}

function openExperience() {
  if (experienceOpened || !story) return;
  experienceOpened = true;

  startMusic();
  celebrateOpening();
  openButton?.setAttribute('aria-busy', 'true');
  if (openButton) openButton.disabled = true;
  if (openButtonLabel) openButtonLabel.textContent = 'abrindo meu coração...';

  const reducedMotion = motionPreference.matches;
  const revealDelay = reducedMotion ? 40 : 830;
  const scrollDelay = reducedMotion ? 80 : 1240;
  const fadeDelay = reducedMotion ? 100 : 1150;
  const cleanupDelay = reducedMotion ? 220 : 1740;

  document.body.classList.add('is-transitioning');
  entrySection?.classList.add('is-leaving');
  heartTransition?.classList.remove('is-fading');
  heartTransition?.classList.add('is-active');
  animateHeartTransition();

  window.setTimeout(() => {
    story.classList.add('is-open');
    story.removeAttribute('inert');
  }, revealDelay);

  window.setTimeout(() => {
    heartTransition?.classList.add('is-fading');
    document.body.classList.remove('is-transitioning');
  }, fadeDelay);

  window.setTimeout(() => {
    story.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }, scrollDelay);

  window.setTimeout(() => {
    heartTransition?.classList.remove('is-active', 'is-fading');
    entrySection?.classList.remove('is-leaving');
    document.body.classList.remove('is-transitioning');
    openButton?.removeAttribute('aria-busy');
    if (openButtonLabel) openButtonLabel.textContent = 'meu coração está aberto';
  }, cleanupDelay);
}

function updateDaysTogether() {
  if (!daysLabel) return;

  const firstDay = new Date('2026-08-07T00:00:00-03:00');
  const elapsed = Math.max(0, Math.floor((Date.now() - firstDay.getTime()) / 86400000));

  if (elapsed === 0) daysLabel.textContent = 'desde hoje';
  else if (elapsed === 1) daysLabel.textContent = 'há 1 dia';
  else daysLabel.textContent = `há ${elapsed} dias`;
}

function waitForImage(image) {
  if (image.complete && image.naturalWidth > 0) return Promise.resolve();

  return new Promise((resolve, reject) => {
    image.addEventListener('load', resolve, { once: true });
    image.addEventListener('error', reject, { once: true });
  });
}

function hasIncompletePixels(image) {
  try {
    const canvas = document.createElement('canvas');
    const size = 32;
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0, size, size);

    const pixels = context.getImageData(0, 0, size, size).data;
    const buckets = new Map();
    let bottomPixels = 0;
    let transparentPixels = 0;

    for (let y = 11; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const offset = (y * size + x) * 4;
        const alpha = pixels[offset + 3];
        bottomPixels += 1;

        if (alpha < 240) {
          transparentPixels += 1;
          continue;
        }

        const red = Math.round(pixels[offset] / 8) * 8;
        const green = Math.round(pixels[offset + 1] / 8) * 8;
        const blue = Math.round(pixels[offset + 2] / 8) * 8;
        const key = `${red}-${green}-${blue}`;
        buckets.set(key, (buckets.get(key) || 0) + 1);
      }
    }

    const largestColorBlock = Math.max(0, ...buckets.values());
    return transparentPixels / bottomPixels > 0.5 || largestColorBlock / bottomPixels > 0.7;
  } catch {
    return false;
  }
}

async function validatePhotoCard(card) {
  const image = card.querySelector('img');
  if (!image) return false;

  image.loading = 'eager';

  try {
    await waitForImage(image);
    if (image.decode) await image.decode();

    const healthy = image.naturalWidth >= 180 && image.naturalHeight >= 240 && !hasIncompletePixels(image);
    card.classList.remove('is-pending');
    card.classList.add(healthy ? 'is-valid' : 'is-invalid');
    if (healthy) card.hidden = false;
    return healthy;
  } catch {
    card.classList.remove('is-pending');
    card.classList.add('is-invalid');
    return false;
  }
}

async function validatePhotoGallery() {
  const cards = [...document.querySelectorAll('[data-photo-card]')];
  await Promise.all(cards.map(validatePhotoCard));
}

function prepareScrollReveals() {
  const sections = document.querySelectorAll('.reveal-on-scroll');

  if (!('IntersectionObserver' in window)) {
    sections.forEach((section) => section.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  sections.forEach((section) => observer.observe(section));
}

function syncVideoButton(video) {
  const card = video.closest('[data-love-video-card]');
  const button = card?.querySelector('[data-video-play]');
  const icon = button?.querySelector('span');
  const paused = video.paused;

  card?.classList.toggle('is-paused', paused);
  if (button) button.setAttribute('aria-label', paused ? 'Reproduzir este vídeo' : 'Pausar este vídeo');
  if (icon) icon.textContent = paused ? '▶' : 'Ⅱ';
}

function initializeLoveVideos() {
  const videos = [...document.querySelectorAll('[data-love-video]')];
  if (!videos.length) return;

  videos.forEach((video) => {
    const card = video.closest('[data-love-video-card]');
    const playButton = card?.querySelector('[data-video-play]');
    const soundButton = card?.querySelector('[data-video-sound]');
    const soundLabel = card?.querySelector('[data-video-sound-label]');

    video.muted = true;
    video.dataset.userPaused = 'false';

    playButton?.addEventListener('click', () => {
      if (video.paused) {
        video.dataset.userPaused = 'false';
        video.play().catch(() => syncVideoButton(video));
      } else {
        video.dataset.userPaused = 'true';
        if (activeAudioVideo === video) stopVideoAudio();
        video.pause();
      }
    });

    soundButton?.addEventListener('click', () => {
      if (activeAudioVideo === video && !video.muted) {
        stopVideoAudio();
        return;
      }

      if (activeAudioVideo && activeAudioVideo !== video) {
        stopVideoAudio({ resumeMusic: false });
      }

      musicPausedByVideo = pauseBackgroundMusic();
      activeAudioVideo = video;
      video.muted = false;
      video.volume = 0.9;
      video.dataset.userPaused = 'false';
      card?.classList.add('is-listening');
      soundButton.setAttribute('aria-pressed', 'true');
      if (soundLabel) soundLabel.textContent = 'voltar à nossa música';
      video.play().catch(() => stopVideoAudio());
    });

    video.addEventListener('play', () => syncVideoButton(video));
    video.addEventListener('pause', () => syncVideoButton(video));
    video.addEventListener('ended', () => {
      if (activeAudioVideo === video) stopVideoAudio();
    });

    syncVideoButton(video);
  });

  if (!('IntersectionObserver' in window)) return;

  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;

      if (entry.isIntersecting && video.dataset.userPaused !== 'true') {
        video.play().catch(() => syncVideoButton(video));
        return;
      }

      if (!entry.isIntersecting) {
        if (activeAudioVideo === video) stopVideoAudio();
        video.pause();
      }
    });
  }, { threshold: 0.42 });

  videos.forEach((video) => videoObserver.observe(video));
}

function updateLoveProgress() {
  if (!loveProgress || !experienceOpened || !story) return;

  const storyTop = story.offsetTop;
  const availableDistance = Math.max(1, document.documentElement.scrollHeight - window.innerHeight - storyTop);
  const progress = Math.max(0, Math.min(1, (window.scrollY - storyTop) / availableDistance));
  loveProgress.style.transform = `scaleX(${progress})`;
}

let progressTicking = false;
window.addEventListener('scroll', () => {
  if (progressTicking) return;
  progressTicking = true;
  window.requestAnimationFrame(() => {
    updateLoveProgress();
    progressTicking = false;
  });
}, { passive: true });

window.addEventListener('resize', updateLoveProgress, { passive: true });

openButton?.addEventListener('click', openExperience);
musicControl?.addEventListener('click', toggleMusic);
replayButton?.addEventListener('click', () => {
  stopVideoAudio();
  document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

updateDaysTogether();
prepareScrollReveals();
validatePhotoGallery();
initializeLoveVideos();
loadYouTubeApi();

// O site continua abrindo mesmo se o YouTube estiver indisponível ou bloqueado.
window.setTimeout(unlockExperience, 2400);
