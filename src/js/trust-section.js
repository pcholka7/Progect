document.addEventListener('DOMContentLoaded', () => {
  const mq = window.matchMedia('(max-width: 767px)');
  const viewport = document.querySelector('.reviews-viewport');
  const track = document.querySelector('.reviews-wrapper');
  const nav = document.querySelector('.reviews-navigation');
  const prevBtn = document.querySelector('.prev-arrow');
  const nextBtn = document.querySelector('.next-arrow');
  const indicator = document.querySelector('.slider-indicator--reviews');
  if (!viewport || !track) return;

  const slides = () => Array.from(track.querySelectorAll('.review-slide'));
  const cards = () => Array.from(track.querySelectorAll('.review-card'));

  let mobPage = 0;
  let dots = [];
  let touchAttached = false;

  function buildMobileSlides() {
    if (slides().length) return;
    const list = cards();
    if (!list.length) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < list.length; i += 2) {
      const slide = document.createElement('div');
      slide.className = 'review-slide';
      slide.appendChild(list[i]);
      if (list[i + 1]) slide.appendChild(list[i + 1]);
      frag.appendChild(slide);
    }
    track.innerHTML = '';
    track.appendChild(frag);
    slides().forEach(s => { s.style.flex = '0 0 100%'; });
  }

  function restoreDesktopFromMobile() {
    const list = slides();
    if (list.length) {
      const frag = document.createDocumentFragment();
      list.forEach(s => Array.from(s.children).forEach(c => frag.appendChild(c)));
      track.innerHTML = '';
      track.appendChild(frag);
    }
    track.style.transform = '';
  }

  function rebuildDots(n) {
    if (!indicator) return;
    indicator.innerHTML = '';
    dots = [];
    for (let i = 0; i < n; i++) {
      const dot = document.createElement('span');
      dot.className = 'slider-indicator__dot' + (i === mobPage ? ' active' : '');
      dot.addEventListener('click', () => goToMobile(i));
      indicator.appendChild(dot);
      dots.push(dot);
    }
  }

  function setActiveDot(i) {
    dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
  }

  function goToMobile(i) {
    const list = slides();
    if (!list.length) return;
    mobPage = Math.max(0, Math.min(i, list.length - 1));
    const x = list[mobPage].offsetLeft;
    track.style.transition = 'transform .4s ease';
    track.style.transform = `translateX(-${x}px)`;
    setActiveDot(mobPage);
  }

  let startX = 0, startY = 0, dragging = false, baseX = 0;
  const pageWidth = () => viewport.clientWidth;
  const maxMobPage = () => Math.max(0, slides().length - 1);
  const curOffset = () => mobPage * pageWidth();

  function onTouchStart(e) {
    const t = e.touches[0];
    startX = t.clientX; startY = t.clientY;
    dragging = false;
    baseX = curOffset();
    track.style.transition = 'none';
  }
  function onTouchMove(e) {
    const t = e.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if (!dragging) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      dragging = Math.abs(dx) > Math.abs(dy);
      if (!dragging) { track.style.transition = ''; return; }
    }
    const maxPx = maxMobPage() * pageWidth();
    let preview = baseX - dx;
    preview = Math.max(0, Math.min(preview, maxPx));
    track.style.transform = `translateX(-${preview}px)`;
  }
  function onTouchEnd(e) {
    const dx = e.changedTouches[0].clientX - startX;
    track.style.transition = 'transform .4s ease';
    const threshold = Math.min(80, viewport.clientWidth * 0.2);
    if (dragging && Math.abs(dx) > threshold) {
      goToMobile(mobPage + (dx < 0 ? 1 : -1));
    } else {
      goToMobile(mobPage);
    }
  }

  function attachTouch() {
    if (touchAttached) return;
    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchmove', onTouchMove, { passive: true });
    viewport.addEventListener('touchend', onTouchEnd, { passive: true });
    touchAttached = true;
  }
  function detachTouch() {
    if (!touchAttached) return;
    viewport.removeEventListener('touchstart', onTouchStart);
    viewport.removeEventListener('touchmove', onTouchMove);
    viewport.removeEventListener('touchend', onTouchEnd);
    touchAttached = false;
  }

  let deskPage = 0;

  function desktopMetrics() {
    const list = cards();
    if (!list.length) return null;
    const GAP = 20;
    const cardWidth = list[0].getBoundingClientRect().width;
    const perView = 3;
    const stepPerCard = cardWidth + GAP;
    const maxPage = Math.max(0, Math.ceil(list.length / perView) - 1);
    return { list, GAP, cardWidth, perView, stepPerCard, maxPage };
  }

  function updateDesktopButtons(maxPage) {
    if (!prevBtn || !nextBtn) return;
    prevBtn.disabled = deskPage === 0;
    nextBtn.disabled = deskPage >= maxPage;
    const prevPath = prevBtn.querySelector('svg path');
    const nextPath = nextBtn.querySelector('svg path');
    if (prevPath) prevPath.setAttribute('fill', prevBtn.disabled ? '#B0B0B0' : '#333333');
    if (nextPath) nextPath.setAttribute('fill', nextBtn.disabled ? '#B0B0B0' : '#333333');
  }

  function goToDesktopPage(newPage) {
    const m = desktopMetrics();
    if (!m) return;
    const { stepPerCard, perView, maxPage } = m;
    deskPage = Math.max(0, Math.min(newPage, maxPage));
    const firstIndex = deskPage * perView;
    const offset = -(firstIndex * stepPerCard);
    track.style.transition = 'transform .4s ease';
    track.style.transform = `translateX(${offset}px)`;
    updateDesktopButtons(maxPage);
  }

  function onPrev() { goToDesktopPage(deskPage - 1); }
  function onNext() { goToDesktopPage(deskPage + 1); }

  function attachDesktopArrows() {
    prevBtn?.addEventListener('click', onPrev);
    nextBtn?.addEventListener('click', onNext);
  }
  function detachDesktopArrows() {
    prevBtn?.removeEventListener('click', onPrev);
    nextBtn?.removeEventListener('click', onNext);
  }

  function init() {
    if (mq.matches) {
      detachDesktopArrows();
      nav && nav.classList.add('is-hidden');
      buildMobileSlides();
      rebuildDots(slides().length);
      if (indicator) indicator.style.display = 'flex';
      viewport.style.touchAction = 'pan-y';
      attachTouch();
      mobPage = 0;
      goToMobile(0);
    } else {
      detachTouch();
      restoreDesktopFromMobile();
      if (indicator) { indicator.style.display = 'none'; indicator.innerHTML = ''; }
      nav && nav.classList.remove('is-hidden');
      attachDesktopArrows();
      deskPage = 0;
      goToDesktopPage(0);
    }
  }

  window.addEventListener('resize', () => {
    if (mq.matches) {
      goToMobile(mobPage);
    } else {
      goToDesktopPage(deskPage);
    }
  });

  mq.addEventListener('change', init);
  init();
});
