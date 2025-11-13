document.addEventListener('DOMContentLoaded', () => {
  const mqMobile = window.matchMedia('(max-width: 767px)');
  const mqTablet = window.matchMedia('(min-width: 768px) and (max-width: 1439px)');

  const viewport = document.querySelector('.tariff-blocks-wrapper');
  const indicator = document.querySelector('.tariff-indicator');
  if (!viewport || !indicator) return;

  let mode = 'desktop';
  let current = 0;
  let dots = [];
  let touchAttached = false;

  const getTrack = () => viewport.querySelector('.tariff-track');
  const getSlides = () => Array.from(viewport.querySelectorAll('.tariff-slide'));
  const getCards = () => Array.from(viewport.querySelectorAll('.tariff-block'));

  function ensureTrack() {
    let track = getTrack();
    if (!track) {
      track = document.createElement('div');
      track.className = 'tariff-track';
      const cards = getCards();
      cards.forEach(card => track.appendChild(card));
      viewport.innerHTML = '';
      viewport.appendChild(track);
    }
    return track;
  }

  function buildSlides() {
    const track = ensureTrack();
    let slides = getSlides();
    if (slides.length) return slides;

    const cards = Array.from(track.children);
    track.innerHTML = '';
    cards.forEach(card => {
      const slide = document.createElement('div');
      slide.className = 'tariff-slide';
      slide.appendChild(card);
      track.appendChild(slide);
    });
    return getSlides();
  }

  function restoreDesktop() {
    const track = getTrack();
    if (track) {
      const cards = Array.from(track.querySelectorAll('.tariff-block'));
      viewport.innerHTML = '';
      cards.forEach(c => {
        c.removeAttribute('style');
        viewport.appendChild(c);
      });
    }
    indicator.innerHTML = '';
    indicator.style.display = 'none';
    dots = [];
  }

  function pagesCount() {
    const slides = getSlides();
    if (mode === 'mobile') return slides.length;                 // по 1 карте
    if (mode === 'tablet') {
      const perView = 2;
      return Math.max(1, Math.ceil(slides.length / perView));
    }
    return 0;
  }

  function maxIndex() {
    return Math.max(0, pagesCount() - 1);
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function rebuildDots(n) {
    indicator.innerHTML = '';
    dots = [];
    if (n <= 1) {
      indicator.style.display = 'none';
      return;
    }
    indicator.style.display = 'flex';

    for (let i = 0; i < n; i++) {
      const dot = document.createElement('span');
      dot.className = 'slider-indicator__dot' + (i === current ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      indicator.appendChild(dot);
      dots.push(dot);
    }
  }

  function setActive(i) {
    dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
  }

  function applySlideBasis() {
    const slides = getSlides();
    if (!slides.length) return;

    if (mode === 'mobile') {
      slides.forEach(s => {
        s.style.flex = '0 0 100%';
      });
    } else if (mode === 'tablet') {
      slides.forEach(s => {
        s.style.flex = '0 0 calc(50% - 15px)';
      });
    } else {
      slides.forEach(s => {
        s.style.flex = '';
      });
    }
  }

  function goTo(i) {
    const slides = getSlides();
    const track = getTrack();
    if (!slides.length || !track) return;

    current = clamp(i, 0, maxIndex());

    const perView = (mode === 'tablet') ? 2 : 1;
    const startIndex = current * perView;
    const targetSlide = slides[startIndex] || slides[slides.length - 1];
    const targetLeft = targetSlide.offsetLeft;

    track.style.transition = 'transform .4s ease';
    track.style.transform = `translateX(-${targetLeft}px)`;
    setActive(current);
  }

  // === свайпы ===
  let startX = 0, startY = 0, dragging = false, baseOffset = 0;

  function currentOffsetPx() {
    const slides = getSlides();
    const perView = (mode === 'tablet') ? 2 : 1;
    const startIndex = current * perView;
    const s = slides[startIndex];
    return s ? s.offsetLeft : 0;
  }

  function onTouchStart(e) {
    if (!(mqMobile.matches || mqTablet.matches)) return;
    const track = getTrack();
    if (!track) return;

    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    dragging = false;
    baseOffset = currentOffsetPx();
    track.style.transition = 'none';
  }

  function onTouchMove(e) {
    if (!(mqMobile.matches || mqTablet.matches)) return;
    const track = getTrack();
    if (!track) return;

    const t = e.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    if (!dragging) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      dragging = Math.abs(dx) > Math.abs(dy);
      if (!dragging) {
        track.style.transition = '';
        return;
      }
    }

    const slides = getSlides();
    if (!slides.length) return;

    const perView = (mode === 'tablet') ? 2 : 1;
    const lastPage = maxIndex();
    const lastStartIndex = lastPage * perView;
    const lastSlide = slides[lastStartIndex] || slides[slides.length - 1];
    const maxOffset = lastSlide ? lastSlide.offsetLeft : 0;

    const preview = clamp(baseOffset - dx, 0, maxOffset);
    track.style.transform = `translateX(-${preview}px)`;
  }

  function onTouchEnd(e) {
    if (!(mqMobile.matches || mqTablet.matches)) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;

    const threshold = Math.min(80, viewport.clientWidth * 0.18);
    if (dragging && Math.abs(dx) > threshold) {
      if (dx < 0 && current < maxIndex()) goTo(current + 1);
      else if (dx > 0 && current > 0) goTo(current - 1);
      else goTo(current);
    } else {
      goTo(current);
    }
  }

  function attachSwipe() {
    if (touchAttached) return;
    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchmove', onTouchMove, { passive: true });
    viewport.addEventListener('touchend', onTouchEnd, { passive: true });
    touchAttached = true;
  }

  function detachSwipe() {
    if (!touchAttached) return;
    viewport.removeEventListener('touchstart', onTouchStart);
    viewport.removeEventListener('touchmove', onTouchMove);
    viewport.removeEventListener('touchend', onTouchEnd);
    touchAttached = false;
  }

  // === режимы ===
  function init() {
    const newMode = mqMobile.matches ? 'mobile' : (mqTablet.matches ? 'tablet' : 'desktop');

    if (newMode === 'desktop') {
      detachSwipe();
      restoreDesktop();
      mode = 'desktop';
      current = 0;
      return;
    }

    mode = newMode;

    buildSlides();
    applySlideBasis();

    current = 0;
    rebuildDots(pagesCount());
    goTo(current);
    attachSwipe();
  }

  window.addEventListener('resize', () => {
    if (mode !== 'desktop') {
      applySlideBasis();
      goTo(current);
    }
  });

  mqMobile.addEventListener('change', init);
  mqTablet.addEventListener('change', init);

  init();
});
