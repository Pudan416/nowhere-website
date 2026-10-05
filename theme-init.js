// Pick a new complete day before first paint on every visit, including old theme links.
(() => {
  const choices = ['green', 'yellow', 'chill'];
  const theme = choices[Math.floor(Math.random() * choices.length)];
  document.documentElement.dataset.theme = theme;
})();
