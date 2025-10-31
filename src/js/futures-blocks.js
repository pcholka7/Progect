(() => {
  const BREAKPOINT = 768; // слайдер работает при ширине <= 768px
  let initialized = false;
  let teardown = null;

  function buildUnifiedSlider() {
    const root = document.querySelector('.features-blocks');
    if (!root) return () => {};

    const indicator = root.querySelector('.slider-indicator');
    const smallContainer = root.querySelector(':scope > .features-blocks-small');

    // 1) Собираем ВСЕ карточки (большие + маленькие)
    const bigCards   = Array.from(root.querySelectorAll(':scope > .feature-block'));
    const smallCards = smallContainer ? Array.from(smallContainer.children) : [];
    const cards = [...bigCards, ...smallCards];

    if (!cards.length || !indicator) return () => {};

    // 2) Запоминаем исходные позиции для восстановления
    const positions = cards.map(node => ({
      node,
      parent: node.parentNode,
      next: node.nextSibling
    }));

    // 3) Строим DOM: track -> slides (по 2 карточки на слайд)
    root.classList.add('features-slider');
    const track = document.createElement('div');
    track.className = 'features-track';
    track.setAttribute('role', 'region');
    track.setAttribute('aria-roledescription', 'carousel');

    const slides = [];
    for (let i = 0; i < cards.length; i += 2) {
      const slide = document.createElement('div');
      slide.className = 'features-slide';
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', `${Math.floor(i/2)+1} из ${Math.ceil(cards.length/2)}`);

      slide.appendChild(cards[i]);
      if (cards[i + 1]) slide.appendChild(cards[i + 1]); // вашу заглушку не создаю

      track.appendChild(slide);
      slides.push(slide);
    }

    // Вставляем track перед индикатором
    root.insertBefore(track, indicator);
    if (smallContainer) smallContainer.style.display = 'none';

    // 4) Индикатор-точки
    function rebuildDots() {
      indicator.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'slider-indicator__dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goTo(i));
        indicator.appendChild(dot);
      });
    }
    rebuildDots();
    const getDots = () => Array.from(indicator.querySelectorAll('.slider-indicator__dot'));

    // ===== ключевая правка: правильная ширина страницы
    const pageW = () => {
      if (!slides.length) return root.getBoundingClientRect().width;
      return slides[0].getBoundingClientRect().width; // ширина 1-го слайда = ширина страницы
    };

    // 5) Перемещение
    let index = 0;

    function setActiveDot() {
      getDots().forEach((d, i) => d.classList.toggle('active', i === index));
    }

    function goTo(i, animate = true) {
      index = Math.max(0, Math.min(i, slides.length - 1));
      track.style.transition = animate ? 'transform 400ms ease' : 'none';
      const w = pageW();
      const x = -index * w;
      track.style.transform = `translate3d(${Math.round(x)}px, 0, 0)`;
      setActiveDot();
    }

    // 6) Свайп/drag (Pointer Events)
    let dragging = false, startX = 0, startY = 0, startT = 0, startTransform = 0, activePointerId = null;

    function onPointerDown(e) {
      activePointerId = e.pointerId;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startT = e.timeStamp;
      startTransform = -index * pageW();
      root.classList.add('features-slider--dragging');
      track.style.transition = 'none';
      track.setPointerCapture(activePointerId);
    }

    function onPointerMove(e) {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dy) > Math.abs(dx)) return; // отдаём вертикальный скролл
      const x = startTransform + dx;
      track.style.transform = `translate3d(${Math.round(x)}px, 0, 0)`;
    }

    function onPointerUp(e) {
      if (!dragging) return;
      dragging = false;
      root.classList.remove('features-slider--dragging');
      try { track.releasePointerCapture(activePointerId); } catch(_) {}

      const dx = e.clientX - startX;
      const dt = Math.max(1, e.timeStamp - startT);
      const v  = Math.abs(dx) / dt;         // скорость, px/ms
      const w  = pageW();
      const shouldFlip = Math.abs(dx) > w * 0.25 || v > 0.6;

      if (shouldFlip) {
        if (dx < 0 && index < slides.length - 1) index++;
        else if (dx > 0 && index > 0) index--;
      }
      goTo(index, true);
    }

    track.addEventListener('pointerdown', onPointerDown);
    track.addEventListener('pointermove', onPointerMove);
    track.addEventListener('pointerup', onPointerUp);
    track.addEventListener('pointercancel', onPointerUp);

    // 7) Клавиатура
    root.setAttribute('tabindex', '0');
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') goTo(index + 1);
      if (e.key === 'ArrowLeft')  goTo(index - 1);
    });

    // 8) Пересчёт при изменении размеров (ориентация, адресная строка и т.д.)
    const ro = new ResizeObserver(() => goTo(index, false));
    ro.observe(root);
    ro.observe(track); // на всякий случай, если меняется внутренняя ширина

    // Стартовая позиция
    goTo(0, false);

    // 9) Возврат исходного DOM на >768px
    function cleanup() {
      ro.disconnect();
      track.removeEventListener('pointerdown', onPointerDown);
      track.removeEventListener('pointermove', onPointerMove);
      track.removeEventListener('pointerup', onPointerUp);
      track.removeEventListener('pointercancel', onPointerUp);

      root.classList.remove('features-slider', 'features-slider--dragging');
      if (smallContainer) smallContainer.style.display = '';
      track.remove();

      positions.forEach(({ node, parent, next }) => {
        if (next && next.parentNode === parent) parent.insertBefore(node, next);
        else parent.appendChild(node);
      });

      indicator.innerHTML = '';
    }

    return cleanup;
  }

  function handleMode() {
    const isMobile = window.matchMedia(`(max-width: ${BREAKPOINT}px)`).matches;
    if (isMobile && !initialized) {
      teardown = buildUnifiedSlider();
      initialized = true;
    } else if (!isMobile && initialized) {
      teardown && teardown();
      teardown = null;
      initialized = false;
    }
  }

  document.addEventListener('DOMContentLoaded', handleMode);
  window.addEventListener('resize', handleMode);
})();