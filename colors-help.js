(() => {
  const trigger = document.getElementById('colors-help');
  const dialog = document.getElementById('colors-info');
  if (!trigger || !dialog) return;

  trigger.addEventListener('click', () => dialog.showModal());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
})();
