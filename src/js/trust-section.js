(() => {
  const perfNow = (typeof window !== 'undefined' && window.performance && typeof window.performance.now === 'function')
    ? () => window.performance.now()
    : () => Date.now();

  document.querySelectorAll('.reviews-section').forEach(initReviewsSlider);

  // Выравнивание высот карточек внутри каждого мобильного слайда
  function equalizeMobileReviewHeights(root) {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const wrapper = root.querySelector('.reviews-wrapper');
    if (!wrapper) return;

    // сброс высот перед измерением
    wrapper.querySelectorAll('.review-card').forEach(c => c.style.height = '');

    if (!isMobile) return; // только для мобилы

    const slides = wrapper.querySelectorAll('.review-slide');
    if (!slides.length) return;

    slides.forEach(slide => {
      const cards = slide.querySelectorAll('.review-card');
      if (!cards.length) return;
      let maxH = 0;
      cards.forEach(c => { maxH = Math.max(maxH, c.offsetHeight); });
      cards.forEach(c => { c.style.height = maxH + 'px'; });
    });
  }

  function initReviewsSlider(root) {
    const viewport = root.querySelector('.reviews-viewport');
    const wrapper = root.querySelector('.reviews-wrapper');
    if (!viewport || !wrapper) return;

    const prevBtn = root.querySelector('.reviews-navigation .prev-arrow');
    const nextBtn = root.querySelector('.reviews-navigation .next-arrow');
    const dotsBox = root.querySelector('.slider-indicator--reviews')
      || root.parentElement?.querySelector('.slider-indicator--reviews')
      || document.querySelector('.slider-indicator--reviews');

    // Брейкпоинт как в стилях
    const mql = window.matchMedia('(max-width: 768px)');

    let page = 0, pagesTotal = 1, grouped = false, slides = [];

    const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
    const getCards = () => Array.from(wrapper.querySelectorAll('.review-card'));

    const getGridCols = () => {
      const cs = (typeof window !== 'undefined' && typeof window.getComputedStyle === 'function')
        ? window.getComputedStyle(wrapper)
        : null;
      const tpl = cs && cs.gridTemplateColumns ? cs.gridTemplateColumns : '1fr 1fr 1fr';
      return tpl && tpl !== 'none' ? tpl.split(' ').filter(Boolean).length : 3;
    };

    const slideWidth = () => viewport.clientWidth;

    const clearInlineDisplay = () => {
      getCards().forEach(card => {
        card.style.display = '';
      });
    };

    const buildDots = () => {
      if (!dotsBox || !mql.matches) return;
      dotsBox.innerHTML = '';
      for (let i = 0; i < pagesTotal; i++) {
        const d = document.createElement('span');
        d.className = 'slider-indicator__dot' + (i === page ? ' active' : '');
        d.dataset.index = String(i);
        dotsBox.appendChild(d);
      }
    };
    const updateDotsActive = () => {
      if (!dotsBox) return;
    const updateDotsActive = () => {
      if (!dotsBox) return;
      dotsBox.querySelectorAll('.slider-indicator__dot').forEach((d, i) => d.classList.toggle('active', i === page));
    };
    const updateNavState = () => {
      if (prevBtn) prevBtn.disabled = page === 0;
      if (nextBtn) nextBtn.disabled = page >= pagesTotal - 1;
    };

    const groupForMobile = () => {
      if (grouped) return;
      clearInlineDisplay();
      const cards = getCards();
      if (!cards.length) return;

      const frag = document.createDocumentFragment();
      for (let i = 0; i < cards.length; i += 2) {
        const slide = document.createElement('div');
        slide.className = 'review-slide';
        slide.appendChild(cards[i]);
        if (cards[i + 1]) {
          slide.appendChild(cards[i + 1]);
        } else {
          const ghost = document.createElement('div');
          ghost.className = 'review-card review-card--ghost';
          ghost.setAttribute('aria-hidden', 'true');
          slide.appendChild(ghost);
        }
        frag.appendChild(slide);
      }
      wrapper.innerHTML = '';
      wrapper.appendChild(frag);
      grouped = true;
      slides = Array.from(wrapper.children);
    };

    const ungroupForDesktop = () => {
      if (!grouped) return;
      const allSlides = Array.from(wrapper.querySelectorAll('.review-slide'));
      const frag = document.createDocumentFragment();
      allSlides.forEach(sl => {
        while (sl.firstChild) frag.appendChild(sl.firstChild);
        sl.remove();
      });
      wrapper.innerHTML = '';
      wrapper.appendChild(frag);
      grouped = false;
      slides = [];
      wrapper.querySelectorAll('.review-card--ghost').forEach(g => g.remove());
      clearInlineDisplay();
    };

    const render = () => {
      if (mql.matches) {
        groupForMobile();
        slides = Array.from(wrapper.children);
        pagesTotal = Math.max(1, slides.length);
        page = clamp(page, 0, pagesTotal - 1);

        const offset = -page * slideWidth();
        wrapper.style.transform = `translate3d(${offset}px,0,0)`;

        buildDots();
        updateDotsActive();
        updateNavState();

        // ВЫРАВНИВАНИЕ ВЫСОТ НА МОБИЛКЕ
        equalizeMobileReviewHeights(root);
      } else {
        ungroupForDesktop();
        const cards = getCards();
        const perView = getGridCols();
        pagesTotal = Math.max(1, Math.ceil(cards.length / perView));
        page = clamp(page, 0, pagesTotal - 1);

        const start = page * perView;
        const end = start + perView - 1;
        cards.forEach((card, i) => {
          card.style.display = (i >= start && i <= end) ? '' : 'none';
        });

        wrapper.style.transform = 'translate3d(0,0,0)';
        updateNavState();
        updateDotsActive();

        // сбросим высоты, на десктопе не нужны
        equalizeMobileReviewHeights(root);
      }
    };

    const goTo = (next) => {
      page = clamp(next, 0, pagesTotal - 1);
      render();
    };
    const snapBack = () => {
      if (mql.matches) wrapper.style.transform = `translate3d(${-page * slideWidth()}px,0,0)`;
    };

    let dragging = false, startX = 0, currX = 0, startT = 0;
    const THRESHOLD = 50;

    const onPointerDown = (e) => {
      if (!mql.matches) return;
      dragging = true;
      startX = ('touches' in e) ? e.touches[0].clientX : (e.clientX ?? 0);
      currX = startX;
      startT = perfNow();
      wrapper.style.transition = 'none';
      window.addEventListener('pointermove', onPointerMove, {passive: true});
      window.addEventListener('pointerup', onPointerUp, {passive: true, once: true});
      window.addEventListener('touchmove', onPointerMove, {passive: true});
      window.addEventListener('touchend', onPointerUp, {passive: true, once: true});
    };
    const onPointerMove = (e) => {
      if (!dragging || !mql.matches) return;
      const x = ('touches' in e) ? (e.touches[0]?.clientX ?? currX) : (e.clientX ?? currX);
      const dx = x - startX;
      currX = x;
      const base = -page * slideWidth();
      wrapper.style.transform = `translate3d(${base + dx}px,0,0)`;
    };
    const onPointerUp = () => {
      if (!dragging) return;
      dragging = false;
      const dx = currX - startX;
      const dt = perfNow() - startT;
      const fast = dt < 250 && Math.abs(dx) > 20;
      wrapper.style.transition = '';
      if (Math.abs(dx) > THRESHOLD || fast) {
        goTo(page + (dx < 0 ? 1 : -1));
      } else {
        snapBack();
      }
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
    };

    prevBtn && prevBtn.addEventListener('click', () => goTo(page - 1));
    nextBtn && nextBtn.addEventListener('click', () => goTo(page + 1));
    dotsBox && dotsBox.addEventListener('click', (e) => {
      const dot = e.target.closest('.slider-indicator__dot');
      if (!dot) return;
      goTo(parseInt(dot.dataset.index, 10) || 0);
    });

    viewport.addEventListener('pointerdown', onPointerDown, {passive: true});
    viewport.addEventListener('touchstart', onPointerDown, {passive: true});

    // Ререндер при ресайзе / смене брейкпоинта
    window.addEventListener('resize', render, { passive: true });
    mql.addEventListener('change', render);

    // Пересчёт после изменения размеров контента
    const hasRO = typeof window !== 'undefined' && 'ResizeObserver' in window;
    const ro = hasRO ? new window.ResizeObserver(() => {
      if (mql.matches) render();
    }) : null;
    if (ro) ro.observe(wrapper);

    // Пересчёт после загрузки изображений/шрифтов
    window.addEventListener('load', () => equalizeMobileReviewHeights(root), { once: true });

    render();
  }

  // визуальный эффект на стрелках
  document.querySelectorAll('.reviews-navigation .nav-arrow').forEach(btn => {
    const on = () => btn.classList.add('is-pressed');
    const off = () => btn.classList.remove('is-pressed');
    btn.addEventListener('mousedown', on);
    btn.addEventListener('touchstart', on, {passive: true});
    ['mouseup', 'mouseleave', 'blur', 'touchend', 'touchcancel'].forEach(e =>
      btn.addEventListener(e, off, {passive: true})
    );
  });
})();
