document.addEventListener('DOMContentLoaded', function () {
  const mobileBreakpoint = 768;
  const isMobile = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`);

  const bigContainer = document.querySelector('.features-blocks');
  const smallViewport = document.querySelector('.features-blocks-small'); // viewport
  const indicator = document.querySelector('.slider-indicator');
  if (!bigContainer || !smallViewport || !indicator) return;

  let currentSlide = 0; // 0 — большие, 1..N — маленькие
  let dots = [];
  let smallSlidesCount = 0;

  // сохраним исходные карточки
  const originalSmallCards = Array.from(smallViewport.children);

  // создаём/получаем трек внутри viewport
  function ensureTrack() {
    let track = smallViewport.querySelector('.features-track');
    if (!track) {
      track = document.createElement('div');
      track.className = 'features-track';
      // перенесём все текущие узлы внутрь трека
      while (smallViewport.firstChild) {
        track.appendChild(smallViewport.firstChild);
      }
      smallViewport.appendChild(track);
    }
    return track;
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function rebuildDots(total) {
    indicator.innerHTML = '';
    dots = [];
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('span');
      dot.className = 'slider-indicator__dot';
      dot.addEventListener('click', () => {
        currentSlide = i;
        updateLayout();
      });
      indicator.appendChild(dot);
      dots.push(dot);
    }
  }

  function setActiveDot() {
    dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
  }

  function transformSmallBlocks() {
    if (!isMobile.matches) {
      // вернём исходную разметку на десктопе
      const track = smallViewport.querySelector('.features-track');
      if (track) {
        track.remove();
      }
      smallViewport.innerHTML = '';
      originalSmallCards.forEach(c => smallViewport.appendChild(c));
      return 0;
    }

    const track = ensureTrack();

    // если уже есть .slide — просто посчитаем
    let slides = track.querySelectorAll('.slide');
    if (slides.length) return slides.length;

    // создаём .slide по 2 карточки
    track.innerHTML = '';
    for (let i = 0; i < originalSmallCards.length; i += 2) {
      const slide = document.createElement('div');
      slide.className = 'slide';
      slide.appendChild(originalSmallCards[i]);
      if (originalSmallCards[i + 1]) slide.appendChild(originalSmallCards[i + 1]);
      track.appendChild(slide);
    }
    slides = track.querySelectorAll('.slide');
    return slides.length; // например, 2 при 4 карточках
  }

  function updateLayout() {
    if (isMobile.matches) {
      const track = ensureTrack();
      smallSlidesCount = track.querySelectorAll('.slide').length;
      const totalSlides = 1 + smallSlidesCount; // 1 (большие) + маленькие
      currentSlide = clamp(currentSlide, 0, totalSlides - 1);

      if (currentSlide === 0) {
        bigContainer.style.display = 'flex';
        smallViewport.style.display = 'none';
        track.style.transform = 'translateX(0)';
      } else {
        bigContainer.style.display = 'none';
        smallViewport.style.display = 'block';
        const smallIndex = currentSlide - 1; // 0..smallSlidesCount-1
        track.style.transform = `translateX(-${smallIndex * 100}%)`;
      }
      setActiveDot();
    } else {
      // сброс
      bigContainer.removeAttribute('style');
      smallViewport.removeAttribute('style');
    }
  }

  function init() {
    const count = transformSmallBlocks();      // создаём слайды (мобилка) или возвращаем исходник (десктоп)
    const totalDots = isMobile.matches ? (1 + count) : 0;
    if (isMobile.matches) {
      rebuildDots(totalDots);
      if (currentSlide > totalDots - 1) currentSlide = totalDots - 1;
      if (currentSlide < 0) currentSlide = 0;
    } else {
      indicator.innerHTML = ''; // на десктопе нет точек
      currentSlide = 0;
    }
    updateLayout();
  }

  init();
  isMobile.addEventListener('change', () => { currentSlide = 0; init(); });
});
