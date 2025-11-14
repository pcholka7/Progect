  (function () {
    var banner = document.getElementById('cookie-consent');
    var acceptBtn = document.getElementById('cookie-accept');
    var STORAGE_KEY = 'cookie_consent_accepted';

    function shouldShowBanner() {
      try {
        return localStorage.getItem(STORAGE_KEY) !== 'true';
      } catch (e) {
        return true; // если localStorage недоступен
      }
    }

    function showBanner() {
      if (banner) {
        banner.classList.add('cookie-consent--visible');
      }
    }

    function hideBanner() {
      if (banner) {
        banner.classList.remove('cookie-consent--visible');
      }
    }

    if (shouldShowBanner()) {
      showBanner();
    }

    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        try {
          localStorage.setItem(STORAGE_KEY, 'true');
        } catch (e) {}
        hideBanner();
      });
    }
  })();