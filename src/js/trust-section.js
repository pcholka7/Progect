document.addEventListener('DOMContentLoaded', () => {
  const mq = window.matchMedia('(max-width: 767px)');
  const track = document.querySelector('.reviews-wrapper');
  const indicator = document.querySelector('.slider-indicator--reviews');
  const prevBtn = document.querySelector('.prev-arrow');
  const nextBtn = document.querySelector('.next-arrow');
  if (!track) return;

  let current = 0;
  let mode = 'desktop'; // текущее собранное состояние

  function unwrap() {
    // развернуть все .review-slide обратно в .review-card
    const slides = Array.from(track.querySelectorAll('.review-slide'));
    slides.forEach(slide => {
      while (slide.firstChild) track.insertBefore(slide.firstChild, slide);
      slide.remove();
    });
  }

  function wrap(perPage, layout) {
    // layout: 'desktop' | 'mobile'
    const cards = Array.from(track.querySelectorAll('.review-card'));
    const frag = document.createDocumentFragment();
    for (let i = 0; i < cards.length; i += perPage) {
      const slide = document.createElement('div');
      slide.className = 'review-slide';
      for (let j = i; j < Math.min(i + perPage, cards.length); j++) {
        slide.appendChild(cards[j]);
      }
      frag.appendChild(slide);
    }
    track.appendChild(frag);

    // общий трек как лента страниц
    track.style.display = 'flex';
    track.style.gap = '0';
    track.style.marginLeft = '0';
    track.style.marginRight = '0';
    track.style.width = '100%';

    // стили каждой страницы (inline, чтобы не ломать твой SCSS)
    Array.from(track.children).forEach(slide => {
      slide.style.flex = '0 0 100%';
      if (layout === 'desktop') {
        // 3 карточки в строку
        slide.style.display = 'grid';
        slide.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
        slide.style.columnGap = '20px';
        slide.style.rowGap = '0';
        slide.style.alignItems = 'stretch';
      } else {
        // 2 карточки вертикально
        slide.style.display = 'flex';
        slide.style.flexDirection = 'column';
        slide.style.gap = '20px';
        slide.style.alignItems = 'stretch';
      }
    });
  }

  function clearInline() {
    track.style.display = '';
    track.style.gap = '';
    track.style.marginLeft = '';
    track.style.marginRight = '';
    track.style.width = '';
    track.style.transform = '';
    Array.from(track.children).forEach(el => {
      el.style.flex = '';
      el.style.display = '';
      el.style.flexDirection = '';
      el.style.gap = '';
      el.style.alignItems = '';
      el.style.gridTemplateColumns = '';
      el.style.columnGap = '';
      el.style.rowGap = '';
    });
  }

  function buildIndicator() {
    if (!indicator) return;
    indicator.innerHTML = '';
    const slides = track.querySelectorAll('.review-slide');
    slides.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'slider-indicator__dot' + (i === current ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      indicator.appendChild(dot);
    });
    indicator.style.display = 'flex';
  }

  function goTo(page) {
    const slides = track.querySelectorAll('.review-slide');
    const max = Math.max(0, slides.length - 1);
    current = Math.min(Math.max(page, 0), max);
    track.style.transform = `translateX(${-current * 100}%)`;
    // обновить индикатор (мобилка)
    if (indicator) {
      Array.from(indicator.children).forEach((d, i) => d.classList.toggle('active', i === current));
    }
  }

  // кнопки (десктоп)
  function bindArrows() {
    if (!prevBtn || !nextBtn) return;
    prevBtn.onclick = () => goTo(current - 1);
    nextBtn.onclick = () => goTo(current + 1);
  }

  function mountDesktop() {
    if (mode === 'desktop') return;
    unwrap();
    clearInline();
    wrap(3, 'desktop'); // <<< показываем по 3 карточки
    if (indicator) indicator.innerHTML = ''; // индикатор прячется по CSS на десктопе
    current = 0;
    goTo(0);
    bindArrows();
    mode = 'desktop';
  }

  function mountMobile() {
    if (mode === 'mobile') return;
    unwrap();
    clearInline();
    wrap(2, 'mobile'); // <<< по 2 карточки вертикально
    current = 0;
    goTo(0);
    buildIndicator();
    mode = 'mobile';
  }

  // свайп только на мобилке
  let sx = 0, dx = 0;
  track.addEventListener('touchstart', e => {
    if (mode !== 'mobile') return;
    sx = e.touches[0].clientX; dx = 0;
  }, { passive: true });
  track.addEventListener('touchmove', e => {
    if (mode !== 'mobile') return;
    dx = e.touches[0].clientX - sx;
  }, { passive: true });
  track.addEventListener('touchend', () => {
    if (mode !== 'mobile') return;
    if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  // init
  mq.matches ? mountMobile() : mountDesktop();
  mq.addEventListener('change', e => (e.matches ? mountMobile() : mountDesktop()));
});
