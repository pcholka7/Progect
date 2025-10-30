document.addEventListener('DOMContentLoaded', () => {
  const MOBILE_BP = 767;
  const mq = window.matchMedia(`(max-width: ${MOBILE_BP}px)`);

  const blocksRoot = document.querySelector('.features-blocks');
  const bigBlocks  = blocksRoot ? Array.from(blocksRoot.querySelectorAll(':scope > .feature-block')) : [];
  const smallHost  = document.querySelector('.features-blocks-small');
  const indicatorHost = document.querySelector('.slider-indicator');
  if (!blocksRoot || !smallHost) return;

  // Кнопки будем хранить как переменные (можем создать, если не найдём)
  let prevBtn = document.querySelector('.features-prev') || document.querySelector('.prev-arrow') || null;
  let nextBtn = document.querySelector('.features-next') || document.querySelector('.next-arrow') || null;

  const originalSmallCards = Array.from(smallHost.querySelectorAll('.feature-block-small'));

  let sliderEl = null;      // .features-slider
  let wrapperEl = null;     // .features-slider__wrapper
  let slides = [];          // .features-slider__item[]
  let current = 0;
  let touchBound = false;
  let btnBound = false;
  let clickBound = false;

  // ===== перенос и откат DOM =====
  const moved = []; // [{ node, placeholder }]
  function makePlaceholder(node) {
    const ph = document.createComment('ph');
    node.parentNode.insertBefore(ph, node);
    return ph;
  }
  function rememberAndMove(node, target) {
    const placeholder = makePlaceholder(node);
    moved.push({ node, placeholder });
    target.appendChild(node);
  }
  function restoreAll() {
    for (const { node, placeholder } of moved) {
      if (placeholder.parentNode) placeholder.replaceWith(node);
    }
    moved.length = 0;
  }

  // ===== утилиты =====
  function isMobile() { return mq.matches; }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  // ===== индикатор (3 линии/точки ↔ N слайдов) =====
  function lineIndexForSlide(slideIdx, totalSlides, totalLines) {
    if (!totalLines || !totalSlides) return 0;
    return Math.min(totalLines - 1, Math.floor((slideIdx * totalLines) / totalSlides));
  }
  function firstSlideForLine(lineIdx, totalSlides, totalLines) {
    if (!totalLines) return 0;
    return Math.min(totalSlides - 1, Math.floor((lineIdx * totalSlides) / totalLines));
  }
  function setActiveIndicator() {
    if (!indicatorHost) return;
    const lines = Array.from(indicatorHost.querySelectorAll('.slider-indicator__line, .slider-indicator__dot'));
    if (!lines.length) return;
    const li = lineIndexForSlide(current, slides.length, lines.length);
    lines.forEach((el, i) => el.classList.toggle('active', i === li));
  }

  // Делегирование кликов по линиям/точкам
  if (indicatorHost) {
    indicatorHost.addEventListener('click', (e) => {
      const line = e.target.closest('.slider-indicator__line, .slider-indicator__dot');
      if (!line) return;
      e.preventDefault();
      e.stopPropagation();

      const lines = Array.from(indicatorHost.querySelectorAll('.slider-indicator__line, .slider-indicator__dot'));
      const idx = lines.indexOf(line);
      if (idx < 0) return;

      if (!isMobile()) return;
      if (!sliderEl) buildSlider();

      const targetSlide = firstSlideForLine(idx, slides.length, lines.length);
      goTo(targetSlide);
    });
  }

  // ===== кнопки и клавиатура =====
  function ensureNavButtons() {
    // Если кнопки есть в макете — используем их. Если нет — создаём внутри слайдера.
    if (!sliderEl) return;

    if (!prevBtn) {
      prevBtn = document.createElement('button');
      prevBtn.className = 'features-nav features-prev';
      prevBtn.type = 'button';
      prevBtn.setAttribute('aria-label', 'Предыдущий слайд');
      prevBtn.innerHTML = '<span aria-hidden="true">←</span>';
      sliderEl.appendChild(prevBtn);
    }
    if (!nextBtn) {
      nextBtn = document.createElement('button');
      nextBtn.className = 'features-nav features-next';
      nextBtn.type = 'button';
      nextBtn.setAttribute('aria-label', 'Следующий слайд');
      nextBtn.innerHTML = '<span aria-hidden="true">→</span>';
      sliderEl.appendChild(nextBtn);
    }
  }

  function updateButtons() {
    if (!prevBtn || !nextBtn) return;
    const atStart = current <= 0;
    const atEnd = current >= (slides.length - 1);
    prevBtn.disabled = atStart;
    nextBtn.disabled = atEnd;
    prevBtn.setAttribute('aria-disabled', String(atStart));
    nextBtn.setAttribute('aria-disabled', String(atEnd));
    prevBtn.classList.toggle('is-disabled', atStart);
    nextBtn.classList.toggle('is-disabled', atEnd);
  }

  function bindButtons() {
    if (btnBound) return;
    if (prevBtn) prevBtn.addEventListener('click', onPrevClick);
    if (nextBtn) nextBtn.addEventListener('click', onNextClick);
    window.addEventListener('keydown', onKey);
    btnBound = true;
  }
  function unbindButtons() {
    if (!btnBound) return;
    if (prevBtn) prevBtn.removeEventListener('click', onPrevClick);
    if (nextBtn) nextBtn.removeEventListener('click', onNextClick);
    window.removeEventListener('keydown', onKey);
    btnBound = false;
  }
  function onPrevClick(e){ e.preventDefault(); e.stopPropagation(); prev(); }
  function onNextClick(e){ e.preventDefault(); e.stopPropagation(); next(); }
  function onKey(e){ if (!isMobile()) return; if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next(); }

  // ===== размеры и листание =====
  const ANIM_MS = 300;
  function sizeWrapper() {
    if (!wrapperEl) return;
    const n = slides.length || 1;
    wrapperEl.style.width = `${n * 100}%`;
    slides.forEach(slide => {
      slide.style.width = `${100 / n}%`;
      slide.style.flex = `0 0 ${100 / n}%`;
      slide.style.display = 'flex';
      slide.style.flexDirection = 'column'; // 2 карточки вертикально
      slide.style.gap = '30px';
    });
  }

  function goTo(index) {
    if (!wrapperEl) return;
    const n = slides.length || 1;
    current = Math.max(0, Math.min(index, n - 1));
    wrapperEl.style.transition = `transform ${ANIM_MS}ms ease`;
    wrapperEl.style.transform  = `translateX(-${(100 / n) * current}%)`;
    setActiveIndicator();
    updateButtons();
  }
  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  // ===== свайп + клик по полотну =====
  let startX = 0, startY = 0, deltaX = 0, dragging = false;
  const SWIPE_THRESHOLD = 40;

  function attachTouch() {
    if (!sliderEl || touchBound) return;

    const passive = { passive: true };

    function onStart(e) {
      const t = (e.touches && e.touches[0]) || e;
      startX = t.clientX; startY = t.clientY; deltaX = 0;
      dragging = true;
      if (wrapperEl) wrapperEl.style.transition = 'none';
    }
    function onMove(e) {
      if (!dragging) return;
      const t = (e.touches && e.touches[0]) || e;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dy) > Math.abs(dx)) return; // вертикальный скролл важнее
      if (e.cancelable) e.preventDefault();
      deltaX = dx;
      if (!wrapperEl) return;
      const n = slides.length || 1;
      const base = -((100 / n) * current);
      const vw = sliderEl.getBoundingClientRect().width || 1;
      const shiftPct = (dx / vw) * (100 / n);
      wrapperEl.style.transform = `translateX(calc(${base}% + ${shiftPct}%))`;
    }
    function onEnd() {
      if (!dragging) return;
      dragging = false;
      if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
        deltaX < 0 ? next() : prev();
      } else {
        goTo(current);
      }
      deltaX = 0;
    }

    // touch
    sliderEl.addEventListener('touchstart', onStart, passive);
    sliderEl.addEventListener('touchmove',  onMove,  { passive: false });
    sliderEl.addEventListener('touchend',   onEnd,   passive);

    // mouse (для теста)
    let mouseDown = false;
    sliderEl.addEventListener('mousedown', (e) => { mouseDown = true; onStart(e); });
    window.addEventListener('mousemove', (e) => { if (mouseDown) onMove(e); });
    window.addEventListener('mouseup',   () => { if (mouseDown) { mouseDown = false; onEnd(); } });

    touchBound = true;
  }

  function attachClickAdvance() {
    if (!sliderEl || clickBound) return;
    sliderEl.addEventListener('click', (e) => {
      if (e.target.closest('.slider-indicator, .features-prev, .features-next, .prev-arrow, .next-arrow, a, button')) return;
      if (Math.abs(deltaX) > 3 || dragging) return; // не реагируем на drag
      next();
    });
    clickBound = true;
  }

  // ===== построение/снос слайдера =====
  function detachSlider() {
    if (!sliderEl) return;
    sliderEl.remove();
    sliderEl = null;
    wrapperEl = null;
    slides = [];
    current = 0;
    touchBound = false;
    clickBound = false;

    // сброс подсветки линий/точек
    if (indicatorHost) {
      const lines = Array.from(indicatorHost.querySelectorAll('.slider-indicator__line, .slider-indicator__dot'));
      lines.forEach(l => l.classList.remove('active'));
    }

    restoreAll();
    unbindButtons();
  }

  function buildSlider() {
    if (!isMobile()) return;
    if (blocksRoot.dataset.sliderInit === '1') return;
    blocksRoot.dataset.sliderInit = '1';

    const old = blocksRoot.querySelector('.features-slider');
    if (old) old.remove();

    sliderEl = document.createElement('div');
    sliderEl.className = 'features-slider';
    wrapperEl = document.createElement('div');
    wrapperEl.className = 'features-slider__wrapper';
    sliderEl.appendChild(wrapperEl);

    // все карточки: большие + малые
    const allCards = [];
    bigBlocks.forEach(card => allCards.push(card));
    originalSmallCards.forEach(card => allCards.push(card));

    // группируем по 2 на слайд
    for (let i = 0; i < allCards.length; i += 2) {
      const slide = document.createElement('div');
      slide.className = 'features-slider__item';
      rememberAndMove(allCards[i], slide);
      if (allCards[i + 1]) rememberAndMove(allCards[i + 1], slide);
      wrapperEl.appendChild(slide);
    }

    // вставляем слайдер перед .features-blocks-small, чтобы индикатор остался внизу
    blocksRoot.insertBefore(sliderEl, smallHost);

    slides = Array.from(wrapperEl.children);

    // гарантируем кнопки
    ensureNavButtons();

    sizeWrapper();
    wrapperEl.style.transform = 'translateX(0)';

    attachTouch();
    attachClickAdvance();
    bindButtons();
    setActiveIndicator(); // подсветка на старте
    updateButtons();
  }

  function rebuild() {
    if (isMobile()) {
      buildSlider();
      goTo(0);
    } else {
      blocksRoot.dataset.sliderInit = '0';
      detachSlider();
      // вернуть малые карточки в контейнер, если вдруг
      if (!smallHost.querySelector('.feature-block-small')) {
        clear(smallHost);
        originalSmallCards.forEach(c => smallHost.appendChild(c));
      }
    }
  }

  // старт
  rebuild();

  // слушатели
  mq.addEventListener?.('change', rebuild);
  window.addEventListener('resize', () => {
    if (!sliderEl) return;
    sizeWrapper();
    goTo(current);
  });
});
