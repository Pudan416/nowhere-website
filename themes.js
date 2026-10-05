(() => {
  const themes = {
    green: {
      name: 'Green', color: '#e5efda',
      scene: 'assets/hero-green.png',
      sceneAlt: 'A green still life with a phone, leaves, a book and a cup',
      poster: 'assets/flow-03-filled-canvas.png',
      posterAlt: 'A green Nowhere Canvas with a yellow clover, pink hexagon and pale green form',
      heroPoster: 'assets/hero-green-final-v14.png', heroWidth: 486, heroHeight: 1080,
      backdrop: 'assets/canvas-demo-base-v9.png',
      video: 'assets/hero-green-v14.mp4', videoEnd: null,
      videoAlt: 'Nowhere launch, empty Canvas, three moments selected, app unlocked, then the green Canvas',
      width: 1179, height: 2556, backdropWidth: 852, backdropHeight: 1846,
      choice: 'assets/flow-04-unlock-options.png', active: 'assets/flow-05-unlocked-apps.png',
      labels: ['Went outside', 'Took a pause', 'Read a little'],
      lines: ['Went<br>outside', 'Took<br>a pause', 'Read<br>a little']
    },
    yellow: {
      name: 'Yellow', color: '#f1edc5',
      scene: 'assets/hero-blue-gold-v12.png',
      sceneAlt: 'A blue and yellow still life with a phone, coffee, a croissant, water and sunglasses',
      poster: 'assets/canvas-native-v12.png',
      posterAlt: 'A Nowhere Canvas with blue, gold and teal rays for a hangover, coffee and lunch',
      heroPoster: 'assets/hero-yellow-final-v14.png', heroWidth: 576, heroHeight: 1280,
      backdrop: 'assets/canvas-demo-base-v12.png',
      video: 'assets/hero-yellow-v14.mp4', videoEnd: null,
      videoAlt: 'Nowhere launch, empty Canvas, three moments selected, app unlocked, then the yellow Canvas',
      width: 576, height: 1280, backdropWidth: 841, backdropHeight: 1870,
      choice: 'assets/feeds-instagram-choice-v15.png', active: 'assets/feeds-active-native-v12.png',
      labels: ['Had a hangover', 'Had coffee', 'Had lunch'],
      lines: ['Had a<br>hangover', 'Had<br>coffee', 'Had<br>lunch']
    },
    chill: {
      name: 'Chill', color: '#f4e8d8',
      scene: 'assets/hero-chill-v16.png',
      sceneAlt: 'A warm cream, peach and olive still life with a phone, headphones and a soft throw',
      poster: 'assets/canvas-chill-native-v16.png',
      posterAlt: 'A Nowhere Canvas with a burgundy ring for staying home, a pale ring for chilling and a cream orb for listening to music',
      heroPoster: 'assets/hero-chill-final-v16.png', heroWidth: 384, heroHeight: 848,
      backdrop: 'assets/canvas-chill-base-v16.png',
      video: 'assets/hero-chill-v16.mp4', videoEnd: null,
      videoAlt: 'Nowhere launch, empty Canvas, Stayed home, Chilled and Listened to music selected, Instagram unlocked, then the warm Canvas',
      width: 384, height: 848, backdropWidth: 844, backdropHeight: 1863,
      choice: 'assets/feeds-chill-instagram-choice-v16.png', active: 'assets/feeds-chill-active-v16.png',
      labels: ['Stayed home', 'Chilled', 'Listened to music'],
      lines: ['Stayed<br>home', 'Chilled', 'Listened<br>to music']
    }
  };
  const buttons = Array.from(document.querySelectorAll('[data-theme-choice]'));
  const current = () => themes[document.documentElement.dataset.theme] || themes.yellow;
  const source = (selector, src, width, height, alt) => {
    const image = document.querySelector(selector);
    if (!image) return;
    image.src = src;
    image.width = width;
    image.height = height;
    if (alt !== undefined) image.alt = alt;
  };
  function apply(theme, announce = true) {
    if (!themes[theme]) return;
    document.documentElement.dataset.theme = theme;
    const config = current();
    document.querySelector('meta[name="theme-color"]').content = config.color;
    source('.scene-photo', config.scene, 1536, 1024, config.sceneAlt);
    source('#hero-poster', config.heroPoster, config.heroWidth, config.heroHeight, config.posterAlt);
    source('#diary-chrome', config.poster, config.width, config.height);
    source('#diary-backdrop', config.backdrop, config.backdropWidth, config.backdropHeight);
    source('#feeds-choice', config.choice, config.width, config.height, 'Choose 10, 30 or 60 minutes to unlock Instagram');
    source('#feeds-active', config.active, config.width, config.height);
    document.querySelector('#hero-video').setAttribute('aria-label', config.videoAlt);
    const rayFiles = ['hangover', 'coffee', 'lunch'];
    document.querySelectorAll('[data-canvas-moment]').forEach((button, index) => {
      button.setAttribute('aria-label', config.labels[index]);
      button.querySelector('.moment-label').innerHTML = config.lines[index];
      button.querySelector('.moment-ray').src = `assets/ray-${rayFiles[index]}-figma.png`;
    });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme)));
    window.dispatchEvent(new CustomEvent('nowhere:theme', { detail: { theme, config } }));
    if (announce) document.querySelector('#theme-status').textContent = `${config.name} colors selected.`;
  }
  window.NowhereTheme = { current, apply };
  buttons.forEach(button => button.addEventListener('click', () => {
    if (button.dataset.themeChoice !== document.documentElement.dataset.theme) apply(button.dataset.themeChoice);
  }));
  apply(document.documentElement.dataset.theme, false);
})();
