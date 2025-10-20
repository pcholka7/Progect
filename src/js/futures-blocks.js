document.addEventListener('DOMContentLoaded', function () {
  const mobileBreakpoint = 768;
  const isMobile = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`);

  const bigContainer = document.querySelector('.features-blocks');
  const smallViewport = document.querySelector('.features-blocks-small');
  const indicator = document.querySelector('.slider-indicator');

  if (bigContainer == null || smallViewport == null || indicator == null) {
    return;
  }

  let currentSlide = 0;
  let dots = [];
  let totalSlides = 0;

  const originalSmallCards = Array.from(smallViewport.children);
  const originalBigCards = Array.from(bigContainer.children);

  function ensureTrack() {
    let track = smallViewport.querySelector('.features-track');
    if (track == null) {
      track = document.createElement('div');
      track.className = 'features-track';
      while (smallViewport.firstChild) {
        track.appendChild(smallViewport.firstChild);
      }
      smallViewport.appendChild(track);
    }
    return track;
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function rebuildDots(total) {
    indicator.innerHTML = '';
    dots = [];
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('span');
      dot.className = 'slider-indicator__dot';
      dot.addEventListener('click', function () {
        currentSlide = i;
        snapToSlide();
        setActiveDot();
      });
      indicator.appendChild(dot);
      dots.push(dot);
    }
    setActiveDot();
  }

  function setActiveDot() {
    dots.forEach(function (d, i) {
      d.classList.toggle('active', i === currentSlide);
    });
  }

  function buildTrackForMobile() {
    const track = ensureTrack();
    track.innerHTML = '';

    const bigSlide = document.createElement('div');
    bigSlide.className = 'slide slide--big';
    originalBigCards.forEach(function (node) {
      bigSlide.appendChild(node.cloneNode(true));
    });
    track.appendChild(bigSlide);

    for (let i = 0; i < originalSmallCards.length; i += 2) {
      const slide = document.createElement('div');
      slide.className = 'slide';

      slide.appendChild(originalSmallCards[i].cloneNode(true));
      if (originalSmallCards[i + 1] != null) {
        slide.appendChild(originalSmallCards[i + 1].cloneNode(true));
      }

      track.appendChild(slide);
    }

    return track.querySelectorAll('.slide').length;
  }

  function teardownMobileTrack() {
    const track = smallViewport.querySelector('.features-track');
    if (track != null) {
      track.remove();
    }
    smallViewport.innerHTML = '';
    originalSmallCards.forEach(function (c) {
      smallViewport.appendChild(c);
    });
  }

  function snapToSlide() {
    const track = smallViewport.querySelector('.features-track');
    if (track == null) {
      return;
    }
    track.style.transition = '.4s ease transform';
    track.style.transform = `translate3d(-${currentSlide * 100}%, 0, 0)`;
  }

  function setTransformPercent(percent) {
    const track = smallViewport.querySelector('.features-track');
    if (track == null) {
      return;
    }
    track.style.transition = 'none';
    track.style.transform = `translate3d(-${percent}%, 0, 0)`;
  }

  function updateLayout() {
    if (isMobile.matches) {
      bigContainer.style.display = 'none';
      smallViewport.style.display = 'block';
      snapToSlide();
    } else {
      bigContainer.removeAttribute('style');
      smallViewport.removeAttribute('style');
      teardownMobileTrack();
      indicator.innerHTML = '';
      currentSlide = 0;
    }
  }

  function init() {
    if (isMobile.matches) {
      totalSlides = buildTrackForMobile();
      rebuildDots(totalSlides);
      currentSlide = clamp(currentSlide, 0, totalSlides - 1);
      attachSwipe();
      updateLayout();
    } else {
      detachSwipe();
      updateLayout();
    }
  }

  let dragging = false;
  let startX = 0;
  let startY = 0;
  let lastDeltaX = 0;
  let lockedAxis = null;

  function onPointerDown(e) {
    if (isMobile.matches === false) {
      return;
    }
    const track = ensureTrack();
    dragging = true;
    lockedAxis = null;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    lastDeltaX = 0;
    track.style.transition = 'none';
  }

  function onPointerMove(e) {
    if (dragging === false) {
      return;
    }
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = x - startX;
    const dy = y - startY;

    if (lockedAxis == null) {
      lockedAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (lockedAxis === 'y') {
      return;
    }

    e.preventDefault();
    lastDeltaX = dx;

    const vpWidth = smallViewport.clientWidth || 1;
    const deltaPct = (dx / vpWidth) * 100;

    let percent = currentSlide * 100 - deltaPct;

    if ((currentSlide === 0 && dx > 0) || (currentSlide === totalSlides - 1 && dx < 0)) {
      percent = currentSlide * 100 - deltaPct * 0.35;
    }

    setTransformPercent(percent);
  }

  function onPointerUp() {
    if (dragging === false) {
      return;
    }
    dragging = false;

    const vpWidth = smallViewport.clientWidth || 1;
    const thresholdPx = Math.max(50, vpWidth * 0.2);

    if (lastDeltaX > thresholdPx) {
      currentSlide = clamp(currentSlide - 1, 0, totalSlides - 1);
    } else if (lastDeltaX < -thresholdPx) {
      currentSlide = clamp(currentSlide + 1, 0, totalSlides - 1);
    }

    snapToSlide();
    setActiveDot();
  }

  function attachSwipe() {
    detachSwipe();

    const usePointer = ('onpointerdown' in window);

    if (usePointer) {
      smallViewport.addEventListener('pointerdown', onPointerDown, { passive: true });
      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp, { passive: true });
      window.addEventListener('pointercancel', onPointerUp, { passive: true });
    } else {
      smallViewport.addEventListener('touchstart', onPointerDown, { passive: true });
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('touchend', onPointerUp, { passive: true });
      window.addEventListener('touchcancel', onPointerUp, { passive: true });
      smallViewport.addEventListener('mousedown', onPointerDown);
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);
    }
  }

  function detachSwipe() {
    const usePointer = ('onpointerdown' in window);

    if (usePointer) {
      smallViewport.removeEventListener('pointerdown', onPointerDown, { passive: true });
      window.removeEventListener('pointermove', onPointerMove, { passive: false });
      window.removeEventListener('pointerup', onPointerUp, { passive: true });
      window.removeEventListener('pointercancel', onPointerUp, { passive: true });
    } else {
      smallViewport.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('touchcancel', onPointerUp);
      smallViewport.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
    }
  }

  init();

  isMobile.addEventListener('change', function () {
    currentSlide = 0;
    init();
  });

  window.addEventListener('resize', function () {
    if (isMobile.matches) {
      snapToSlide();
    }
  });
});
