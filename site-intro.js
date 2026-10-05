// A short brand opening, independent of image and recording downloads.
(() => {
  const intro = document.getElementById('site-intro');
  if (!intro) return;
  let timer;
  const finish = () => {
    if (window.NowhereIntro?.done) return;
    clearTimeout(timer);
    document.documentElement.classList.remove('is-entering');
    window.NowhereIntro.done = true;
    window.dispatchEvent(new Event('nowhere:intro-ended'));
  };
  intro.addEventListener('animationend', event => {
    if (event.animationName === 'intro-clear') finish();
  });
  intro.addEventListener('pointerdown', finish);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || document.hidden) {
    finish();
  } else {
    // The CSS animation also clears the overlay if a later script fails.
    timer = setTimeout(finish, 1200);
  }
})();
