document.addEventListener('DOMContentLoaded', () => {
  const mqMobile = window.matchMedia('(max-width: 767px)');
  const mqTablet = window.matchMedia('(min-width: 768px) and (max-width: 1439px)');

  const viewport  = document.querySelector('.tariff-blocks-wrapper');
  const indicator = document.querySelector('.tariff-indicator');
  if (!viewport || !indicator) return;

  let mode = 'desktop';
  let current = 0;
  let dots = [];
  let touchAttached = false;

  const getTrack  = () => viewport.querySelector('.tariff-track');
  const getSlides = () => Array.from(viewport.querySelectorAll('.tariff-slide'));
  const getCards  = () => Array.from(viewport.querySelectorAll('.tariff-block'));

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

  // Оборачиваем каждую карточку в .tariff-slide (делаем один раз на входе в «слайдерный» режим)
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

  // Возврат к обычной сетке для десктопа
  function restoreDesktop() {
    const track = getTrack();
    if (track) {
      const cards = Array.from(track.querySelectorAll('.tariff-block'));
      viewport.innerHTML = '';
      cards.forEach(c => {
        // чистим инлайны, которые могли остаться
        c.removeAttribute('style');
        viewport.appendChild(c);
      });
    }
    indicator.innerHTML = '';
    indicator.removeAttribute('style');
    dots = [];
  }

  function pagesCount() {
    const slides = getSlides();
    if (mode === 'mobile') return slides.length;                     // по 1 карточке
    if (mode === 'tablet') return Math.max(1, slides.length - 1);    // окно = 2 карточки, шаг = 1
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

  function goTo(i) {
    const slides = getSlides();
    const track  = getTrack();
    if (!slides.length || !track) return;

    current = clamp(i, 0, maxIndex());
    const targetSlide = slides[current];       // выравниваем по левой карточке окна
    const targetLeft  = targetSlide.offsetLeft;

    track.style.transition = 'transform .4s ease';
    track.style.transform  = `translateX(-${targetLeft}px)`;
    setActive(current);
  }

  // ===== Ширина «слайда» по режимам (страховка от «залипших» inline-стилей) =====
  function applySlideBasis() {
    const slides = getSlides();
    if (!slides.length) return;

    if (mode === 'mobile') {
      slides.forEach(s => { s.style.flex = '0 0 100%'; });
    } else if (mode === 'tablet') {
      // две карточки в окне, gap: 30px → каждая ~ (50% - 15px)
      slides.forEach(s => { s.style.flex = '0 0 calc(50% - 15px)'; });
    } else {
      slides.forEach(s => { s.style.flex = ''; });
    }
  }

  // ===== Свайп =====
  let startX = 0, startY = 0, dragging = false, baseOffset = 0;

  function currentOffsetPx() {
    const s = getSlides()[current];
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
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return; // фильтр шума
      dragging = Math.abs(dx) > Math.abs(dy);           // горизонтальный жест?
      if (!dragging) { track.style.transition = ''; return; }
    }

    const slides = getSlides();
    // Последняя допустимая «левая» карточка
    const lastIndexForOffset = (mode === 'mobile')
      ? slides.length - 1
      : Math.max(0, slides.length - 2);

    const maxOffset = slides[lastIndexForOffset]?.offsetLeft ?? 0;
    const preview   = clamp(baseOffset - dx, 0, maxOffset);
    track.style.transform = `translateX(-${preview}px)`;
  }

  function onTouchEnd(e) {
    if (!(mqMobile.matches || mqTablet.matches)) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;

    const threshold = Math.min(80, viewport.clientWidth * 0.18);
    if (dragging && Math.abs(dx) > threshold) {
      if (dx < 0 && current < maxIndex()) goTo(current + 1);
      else if (dx > 0 && current > 0)     goTo(current - 1);
      else                                goTo(current);
    } else {
      goTo(current);
    }
  }

  function attachSwipe() {
    if (touchAttached) return;
    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchmove',  onTouchMove,  { passive: true });
    viewport.addEventListener('touchend',   onTouchEnd,   { passive: true });
    touchAttached = true;
  }

  function detachSwipe() {
    if (!touchAttached) return;
    viewport.removeEventListener('touchstart', onTouchStart);
    viewport.removeEventListener('touchmove',  onTouchMove);
    viewport.removeEventListener('touchend',   onTouchEnd);
    touchAttached = false;
  }

  // ===== Инициализация/переключение режимов =====
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

    buildSlides();      // создаём .tariff-slide, если их ещё нет
    applySlideBasis();  // страхуем ширины для режима

    rebuildDots(pagesCount());
    indicator.style.display = 'flex';

    attachSwipe();
  }

  // Пересчёт позиции при ресайзе (offsetLeft меняется)
  window.addEventListener('resize', () => {
    if (mode !== 'desktop') {
      applySlideBasis();
    }
  });

  mqMobile.addEventListener('change', init);
  mqTablet.addEventListener('change', init);

  init();
});
 // проделана работа над планшетом 
 // все работает !