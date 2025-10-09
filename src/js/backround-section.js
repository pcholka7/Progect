document.addEventListener('DOMContentLoaded', () => {
  const mq = window.matchMedia('(max-width: 767px)');
  const viewport  = document.querySelector('.tariff-blocks-wrapper');
  const indicator = document.querySelector('.tariff-indicator');
  if (!viewport || !indicator) return;

  let current = 0;
  let dots = [];


  const getTrack  = () => viewport.querySelector('.tariff-track');
  const getSlides = () => Array.from(viewport.querySelectorAll('.tariff-slide'));

  function getCards() {
    return Array.from(viewport.querySelectorAll('.tariff-block'));
  }

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
    slides = getSlides();

    slides.forEach(slide => { slide.style.flex = '0 0 100%'; });
    return slides;
  }

  function restoreDesktop() {
    const track = getTrack();
    if (track) {
      const cards = Array.from(track.querySelectorAll('.tariff-block'));
      viewport.innerHTML = '';
      cards.forEach(c => viewport.appendChild(c));
    }
    indicator.innerHTML = '';
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
    const track  = getTrack();
    const slides = getSlides();
    const slide  = slides[i];
    if (!slide || !track) return;
    const targetLeft = slide.offsetLeft;
    track.style.transition = 'transform .4s ease';
    track.style.transform  = `translateX(-${targetLeft}px)`;
    current = i;
    setActive(current);
  }

  function init() {
    if (mq.matches) {
      const slides = buildSlides();
      rebuildDots(slides.length);
      viewport.style.display = 'block';
      indicator.style.display = 'flex';
      goTo(0);
      attachSwipe();
    } else {
      detachSwipe();
      restoreDesktop();
      viewport.removeAttribute('style');
      indicator.removeAttribute('style');
      current = 0;
    }
  }

  let startX = 0, startY = 0, dragging = false, baseOffset = 0;

  function getCurrentOffsetPx() {
    const slide = getSlides()[current];
    return slide ? slide.offsetLeft : 0;
  }

  function onTouchStart(e) {
    if (!mq.matches) return;
    const track = getTrack();
    if (!track) return;
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    dragging = false;
    baseOffset = getCurrentOffsetPx();
    track.style.transition = 'none'; // во время перетаскивания без анимации
  }

  function onTouchMove(e) {
    if (!mq.matches) return;
    const track = getTrack();
    if (!track) return;
    const t = e.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    // определяем жест как горизонтальный
    if (!dragging) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return; // маленький шум
      dragging = Math.abs(dx) > Math.abs(dy);           // горизонталь?
      if (!dragging) {
        // вертикальный скролл — отдаём странице
        track.style.transition = '';
        return;
      }
    }
    // тянем трек вслед за пальцем
    const preview = Math.max(0, Math.min(baseOffset - dx, getMaxOffset()));
    track.style.transform = `translateX(-${preview}px)`;
  }

  function onTouchEnd(e) {
    if (!mq.matches) return;
    const slides = getSlides();
    if (!slides.length) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;

    const threshold = Math.min(80, viewport.clientWidth * 0.2); // порог свайпа
    if (dragging && Math.abs(dx) > threshold) {
      if (dx < 0 && current < slides.length - 1) {
        goTo(current + 1);
      } else if (dx > 0 && current > 0) {
        goTo(current - 1);
      } else {
        goTo(current);
      }
    } else {
      goTo(current); // вернёмся, если свайп короткий/вертикальный
    }
  }

  function getMaxOffset() {
    const slides = getSlides();
    if (!slides.length) return 0;
    const last = slides[slides.length - 1];
    return last.offsetLeft; // последняя страница
  }

  function attachSwipe() {
    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchmove',  onTouchMove,  { passive: true });
    viewport.addEventListener('touchend',   onTouchEnd,   { passive: true });
  }
  function detachSwipe() {
    viewport.removeEventListener('touchstart', onTouchStart);
    viewport.removeEventListener('touchmove',  onTouchMove);
    viewport.removeEventListener('touchend',   onTouchEnd);
  }

  window.addEventListener('resize', () => { if (mq.matches) goTo(current); });
  mq.addEventListener('change', () => { current = 0; init(); });

  init();
});
