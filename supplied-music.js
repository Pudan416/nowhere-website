(() => {
  const players = [...document.querySelectorAll('.day-music')];
  const tracks = players.map(player => player.querySelector('audio'));
  const clock = seconds => {
    const value = Math.max(0, Math.floor(seconds || 0));
    return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
  };
  players.forEach(player => {
    const audio = player.querySelector('audio');
    const button = player.querySelector('.day-music-toggle');
    const seekRow = player.querySelector('.day-music-seek');
    const seek = seekRow.querySelector('input');
    const time = player.querySelector('.day-music-time');
    const status = player.querySelector('.day-music-status');
    const title = player.dataset.track;
    const sync = () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : 30;
      const playing = !audio.paused && !audio.ended;
      button.textContent = audio.ended ? 'Replay' : playing ? 'Pause' : 'Play';
      button.setAttribute('aria-label', `${button.textContent} ${title}`);
      button.setAttribute('aria-pressed', String(playing));
      seek.disabled = audio.readyState < 1 || !Number.isFinite(audio.duration);
      seek.max = duration;
      seek.value = audio.currentTime;
      seek.setAttribute('aria-valuetext', `${clock(audio.currentTime)} of ${clock(duration)}`);
      time.textContent = `${clock(audio.currentTime)} / ${clock(duration)}`;
    };
    button.addEventListener('click', () => {
      status.textContent = '';
      if (!audio.paused) {
        audio.pause();
        return;
      }
      tracks.forEach(other => { if (other !== audio) other.pause(); });
      if (audio.error) audio.load();
      if (audio.ended) audio.currentTime = 0;
      audio.play().catch(error => {
        if (error.name !== 'AbortError') status.textContent = 'Audio could not play. Try Play again.';
        sync();
      });
    });
    audio.addEventListener('play', () => {
      tracks.forEach(other => { if (other !== audio) other.pause(); });
      sync();
    });
    audio.addEventListener('waiting', () => {
      if (!audio.paused) status.textContent = 'Loading audio…';
    });
    audio.addEventListener('playing', () => { status.textContent = ''; });
    audio.addEventListener('pause', () => { status.textContent = ''; sync(); });
    audio.addEventListener('error', () => {
      status.textContent = 'Audio could not load. Try Play again.';
      sync();
    });
    ['loadedmetadata', 'durationchange', 'timeupdate', 'ended'].forEach(event => audio.addEventListener(event, sync));
    seek.addEventListener('input', () => {
      if (Number.isFinite(audio.duration)) audio.currentTime = Number(seek.value);
      sync();
    });
    audio.controls = false;
    audio.hidden = true;
    button.hidden = false;
    seekRow.hidden = false;
    sync();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) tracks.forEach(audio => audio.pause());
  });
})();
