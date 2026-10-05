// Pick a new complete day before first paint on every visit, including old theme links.
(() => {
  const choices = ['green', 'yellow', 'chill'];
  const theme = choices[Math.floor(Math.random() * choices.length)];
  document.documentElement.dataset.theme = theme;
  const colors = { green: '#e5efda', yellow: '#f1edc5', chill: '#f4e8d8' };
  document.querySelector('meta[name="theme-color"]').content = colors[theme];
})();
