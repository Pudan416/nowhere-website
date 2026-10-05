// Trimmed native recording: one muted introduction, then the final native still.
(() => {
  const video = document.getElementById('hero-video');
  const poster = document.getElementById('hero-poster');
  const display = document.getElementById('hero-display');
  const control = document.getElementById('hero-playback');
  if (!video || !poster || !display || !control) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false, finished = false, userPaused = false, manual = false, attempt = 0;
  const label = text => {
    control.querySelector('span').textContent = text;
    control.setAttribute('aria-label', text);
  };
  const showPoster = () => { video.hidden = true; poster.hidden = false; };
  const pause = () => { ++attempt; video.pause(); label(finished ? 'Replay video' : 'Play video'); };
  const finish = () => {
    finished = true;
    pause();
    showPoster();
  };
  async function sync() {
    if (finished || userPaused || (reducedMotion.matches && !manual) || !visible || document.hidden) {
      pause(); return;
    }
    if (!video.paused) return;
    if (!video.src) video.src = window.NowhereTheme.current().video;
    const request = ++attempt;
    try {
      await video.play();
      if (request !== attempt || finished || userPaused || !visible || document.hidden) {
        video.pause(); return;
      }
      video.hidden = false;
      poster.hidden = true;
      label('Pause video');
    } catch {
      userPaused = true;
      showPoster();
      label('Play video');
    }
  }
  control.hidden = false;
  control.addEventListener('click', () => {
    if (!video.paused) {
      userPaused = true;
      pause();
      return;
    }
    if (finished) video.currentTime = 0;
    finished = false;
    userPaused = false;
    manual = true;
    sync();
  });
  window.addEventListener('nowhere:theme', () => {
    pause();
    video.removeAttribute('src');
    video.load();
    finished = false; userPaused = false; manual = false;
    showPoster();
    label('Play video');
    sync();
  });
  video.addEventListener('timeupdate', () => {
    const end = window.NowhereTheme.current().videoEnd;
    if (end !== null && video.currentTime >= end) finish();
  });
  video.addEventListener('ended', finish);
  video.addEventListener('error', () => { finish(); control.hidden = true; });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      userPaused = true;
      manual = false;
      pause();
      showPoster();
    }
  });
  document.addEventListener('visibilitychange', sync);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  }, { threshold: 0 }).observe(display);
})();
