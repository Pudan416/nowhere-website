(() => {
  const buttons = Array.from(document.querySelectorAll('[data-canvas-moment]'));
  const preview = document.getElementById('diary-preview');
  const title = document.getElementById('canvas-preview-title');
  const status = document.getElementById('canvas-selection-status');
  if (!preview) return;
  const momentPicker = document.querySelector('.moment-examples');
  momentPicker?.classList.toggle('is-inviting', buttons.length > 0 && !buttons.some(button => button.getAttribute('aria-pressed') === 'true'));
  let invitationObserver = null;
  let pickerInView = false;
  const syncInvitationVisibility = () => {
    momentPicker?.classList.toggle('is-on-screen', momentPicker.classList.contains('is-inviting') && pickerInView && !document.hidden);
  };
  if (momentPicker?.classList.contains('is-inviting')) {
    if ('IntersectionObserver' in window) {
      invitationObserver = new IntersectionObserver(entries => {
        pickerInView = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.1);
        syncInvitationVisibility();
      }, { threshold: 0.1 });
      invitationObserver.observe(momentPicker);
    } else {
      pickerInView = true;
      syncInvitationVisibility();
    }
    document.addEventListener('visibilitychange', syncInvitationVisibility);
  }
  const stopInvitation = () => {
    momentPicker?.classList.remove('is-inviting', 'is-on-screen');
    invitationObserver?.disconnect();
    document.removeEventListener('visibilitychange', syncInvitationVisibility);
  };

  const pointCount = 120;
  const radius = 135;
  const duration = 400;
  const fullTurn = Math.PI * 2;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const states = new Map();
  const angles = Array.from({ length: pointCount }, (_, index) => index * fullTurn / pointCount);
  const circle = angles.map(angle => [164 * Math.cos(angle), 164 * Math.sin(angle)]);
  const pathData = points => `${points.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(3)},${y.toFixed(3)}`).join(' ')} Z`;
  const circlePath = pathData(circle);
  const fit = points => {
    const maximum = Math.max(...points.map(([x, y]) => Math.hypot(x, y)));
    return points.map(([x, y]) => [x * radius / maximum, y * radius / maximum]);
  };

  // Native contours: MetalShapeSoftClover, MetalShapeBasic rounded hex,
  // and MetalShapeContour with the catalog's genome.soft-drift parameters.
  const clover = fit(angles.map(angle => {
    const r = 0.52 + 0.48 * Math.pow(Math.abs(Math.cos(2 * (angle - Math.PI / 4))), 0.64);
    return [r * Math.cos(angle), r * Math.sin(angle)];
  }));
  const hex = fit(angles.map(angle => {
    const sector = Math.PI / 3;
    const localAngle = angle - sector * Math.floor((angle + sector / 2) / sector);
    const r = 0.88 * (Math.cos(Math.PI / 6) / Math.cos(localAngle)) + 0.12 * 0.94;
    return [r * Math.cos(angle), r * Math.sin(angle)];
  }));
  const softDriftRadius = angle => {
    const a = Math.pow(Math.abs(Math.cos(2 * angle / 4)), 2.5);
    const b = Math.pow(Math.abs(Math.sin(2 * angle / 4)), 1.65);
    const base = Math.pow(Math.max(a + b, 0.00001), -1 / 2.1);
    return Math.max(base * (1 + 0.055 * Math.cos(3 * angle + 1.2)), 0.00001);
  };
  const blobNormalization = 1 / Math.max(...Array.from({ length: 512 }, (_, index) => softDriftRadius(index * fullTurn / 512)));
  const blob = fit(angles.map(angle => {
    const r = Math.min(Math.max(softDriftRadius(angle) * blobNormalization, 0.72), 1);
    const x = Math.cos(angle) * r * 0.92;
    const y = Math.sin(angle) * r * 1.12;
    return [x * Math.cos(0.22) - y * Math.sin(0.22) - 0.05,
      x * Math.sin(0.22) + y * Math.cos(0.22) + 0.025];
  }));
  const contours = { first: clover, second: hex, third: blob };
  // Circular native Chill contours sampled from the supplied384x848 Canvas.
  // Keep relative radii61:22:38 in both the controls and the phone result.
  const ring = size => angles.map(angle => [size * Math.cos(angle), size * Math.sin(angle)]);
  const chillContours = {first: ring(135), second: ring(135 * 22 / 61), third: ring(135 * 38 / 61)};
  const labelFor = button => button.getAttribute('aria-label') || button.textContent.replace(/\s+/g, ' ').trim();

  function render(state, points) {
    state.points = points;
    const data = pathData(points);
    if (state.path) state.path.setAttribute('d', data);
    if (state.circleElement) state.circleElement.setAttribute('d', data);
  }

  function morph(state, selected) {
    if (state.frame !== null) cancelAnimationFrame(state.frame);
    state.frame = null;
    const target = selected ? state.target : circle;
    if (!state.path || reducedMotion.matches) {
      render(state, target);
      return;
    }
    const from = state.points.map(point => point.slice());
    const started = performance.now();
    const tick = now => {
      const progress = Math.min(Math.max((now - started) / duration, 0), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      render(state, from.map(([x, y], index) => [
        x + (target[index][0] - x) * eased,
        y + (target[index][1] - y) * eased
      ]));
      state.frame = progress < 1 ? requestAnimationFrame(tick) : null;
    };
    state.frame = requestAnimationFrame(tick);
  }

  function updateTitle() {
    const labels = buttons.filter(button => button.getAttribute('aria-pressed') === 'true').map(labelFor);
    if (title) title.textContent = labels.length
      ? `Your Canvas preview: ${labels.join(', ')}.`
      : 'Your Canvas preview. No moments selected.';
    return labels;
  }

  const greenForms = Array.from(preview.querySelectorAll('[data-green-form]'));
  const yellowForms = Array.from(preview.querySelectorAll('[data-yellow-form]'));
  const chillForms = Array.from(preview.querySelectorAll('[data-chill-form]'));
  const theme = () => document.documentElement.dataset.theme;
  const configure = (state, key) => {
    const chill = theme() === 'chill';
    state.target = chill ? chillContours[key] : contours[key];
    const style = chill
      ? {first:['none','#ae4259','7'],second:['none','#d0cfbb','6'],third:['url(#demo-chill-orb)','none','0']}[key]
      : {first:['url(#demo-flower)','none','14'],second:['none','#e5c0e8','14'],third:['url(#demo-drop)','none','14']}[key];
    state.path.setAttribute('fill', style[0]);
    state.path.setAttribute('stroke', style[1]);
    state.path.setAttribute('stroke-width', style[2]);
    state.path.setAttribute('filter', chill ? 'url(#demo-chill-soft)' : 'url(#demo-soft)');
  };
  buttons.forEach(button => {
    const key = button.dataset.canvasMoment;
    const target = contours[key];
    const form = greenForms.find(item => item.dataset.greenForm === key);
    const yellowForm = yellowForms.find(item => item.dataset.yellowForm === key);
    if (!target || !form) return;
    const path = button.querySelector('[data-morph-path]');
    const circleElement = button.querySelector('.moment-circle');
    const resultPath = form.querySelector('[data-result-path]');
    const style = {first: ['url(#demo-flower)', 'none'], second: ['none', '#e5c0e8'], third: ['url(#demo-drop)', 'none']}[key];
    path.setAttribute('fill', style[0]);
    path.setAttribute('stroke', style[1]);
    path.setAttribute('stroke-width', '14');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('filter', 'url(#demo-soft)');
    const chillForm = chillForms.find(item => item.dataset.chillForm === key);
    if (chillForm) chillForm.querySelector('[data-result-path]').setAttribute('d', pathData(chillContours[key]));
    const selected = button.getAttribute('aria-pressed') === 'true';
    if (circleElement) circleElement.setAttribute('d', circlePath);
    if (resultPath) resultPath.setAttribute('d', pathData(target));
    const state = { path, circleElement, target, points: selected ? target : circle, frame: null };
    configure(state, key);
    states.set(button, state);
    render(state, state.points);
    button.setAttribute('aria-pressed', String(selected));
    form.classList.toggle('is-visible', selected);
    yellowForm?.classList.toggle('is-visible', selected);
    chillForm?.classList.toggle('is-visible', selected);
    form.setAttribute('aria-hidden', String(!selected));
    // Native button activation supplies click for pointer, Enter, and Space;
    // retaining the same element also retains focus through every morph.
    button.addEventListener('click', () => {
      stopInvitation();
      const nextSelected = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(nextSelected));
      form.classList.toggle('is-visible', nextSelected);
      yellowForm?.classList.toggle('is-visible', nextSelected);
      chillForm?.classList.toggle('is-visible', nextSelected);
      form.setAttribute('aria-hidden', String(!nextSelected));
      if (theme() !== 'yellow') morph(state, nextSelected);
      const labels = updateTitle();
      if (status) status.textContent = `${labelFor(button)} ${nextSelected ? 'added to' : 'removed from'} your Canvas. ${labels.length} ${labels.length === 1 ? 'moment' : 'moments'} selected.`;
    });
  });
  const reset = () => {
    states.forEach((state, button) => {
      if (state.frame !== null) cancelAnimationFrame(state.frame);
      state.frame = null;
      button.setAttribute('aria-pressed', 'false');
      configure(state, button.dataset.canvasMoment);
      render(state, circle);
    });
    [...greenForms, ...yellowForms, ...chillForms].forEach(form => {form.classList.remove('is-visible');form.setAttribute('aria-hidden','true');});
    updateTitle();
    if (status) status.textContent = '';
  };
  window.addEventListener('nowhere:theme', reset);
  updateTitle();
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) states.forEach((state, button) => morph(state, button.getAttribute('aria-pressed') === 'true'));
  });
})();
