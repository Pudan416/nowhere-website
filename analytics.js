(() => {
  const measurementId = 'G-HX6C8CTSVR';
  const storageKey = 'nowhere-analytics-consent';
  const currentChoice = () => {
    try { return localStorage.getItem(storageKey); } catch { return null; }
  };
  let loaded = false;

  function loadAnalytics() {
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', measurementId);
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
  }

  function saveChoice(choice) {
    try { localStorage.setItem(storageKey, choice); } catch {}
    if (choice === 'accepted') loadAnalytics();
    if (choice === 'rejected' && loaded) {
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }
    document.querySelector('[data-analytics-banner]')?.remove();
    document.querySelector('[data-analytics-settings]')?.setAttribute('aria-expanded', 'false');
  }

  function showBanner() {
    if (document.querySelector('[data-analytics-banner]')) return;
    const banner = document.createElement('section');
    banner.className = 'analytics-banner';
    banner.dataset.analyticsBanner = '';
    banner.setAttribute('aria-label', 'Analytics preferences');
    banner.innerHTML = `
      <div class="analytics-note__topline"><span class="analytics-note__dot" aria-hidden="true"></span><span>A SMALL SITE THING</span><a href="/privacy.html">Privacy</a></div>
      <div class="analytics-note__copy">
        <strong>Can I collect basic site stats?</strong>
        <p>Page views and how people find this site.</p>
      </div>
      <div class="analytics-note__actions">
        <button type="button" data-analytics-choice="rejected" class="analytics-button analytics-button--quiet">No thanks</button>
        <button type="button" data-analytics-choice="accepted" class="analytics-button analytics-button--primary">Sure</button>
      </div>`;
    document.body.appendChild(banner);
    banner.querySelectorAll('[data-analytics-choice]').forEach(button => {
      button.addEventListener('click', () => saveChoice(button.dataset.analyticsChoice));
    });
  }

  function openSettings() {
    showBanner();
    document.querySelector('[data-analytics-banner]')?.scrollIntoView({ block: 'nearest' });
    document.querySelector('[data-analytics-settings]')?.setAttribute('aria-expanded', 'true');
  }

  function addSettingsControl() {
    const footer = document.querySelector('footer');
    if (!footer || footer.querySelector('[data-analytics-settings]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'analytics-settings-link';
    button.dataset.analyticsSettings = '';
    button.setAttribute('aria-expanded', 'false');
    button.textContent = 'Cookie settings';
    button.addEventListener('click', openSettings);
    const links = footer.querySelector('.footer-links, .footer-inner, .wrap') || footer;
    links.appendChild(button);
  }

  document.addEventListener('DOMContentLoaded', () => {
    addSettingsControl();
    if (currentChoice() === 'accepted') loadAnalytics();
    else if (currentChoice() !== 'rejected') showBanner();
  });
})();
