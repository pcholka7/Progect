(() => {
  const BREAKPOINT = 768;
  let mounted = false;
  let teardown = null;

  function initFeaturesSlider() {
    const root = document.querySelector('.features-blocks');
    if (!root) return () => {};

    const indicator = root.querySelector('.slider-indicator');
    const smallContainer = root.querySelector(':scope > .features-blocks-small');
    const bigCards   = Array.from(root.querySelectorAll(':scope > .feature-block'));
    const smallCards = smallContainer ? Array.from(smallContainer.children) : [];
    const cards = [...bigCards, ...smallCards];
    if (!cards.length || !indicator) return () => {};

    const positions = cards.map(n => ({ n, p: n.parentNode, next: n.nextSibling }));

    root.classList.add('features-slider');

    // трек
    const track = document.createElement('div');
    track.className = 'features-track';
    track.setAttribute('role','region');
    track.setAttribute('aria-roledescription','carousel');

    // слайды по 2 карточки
    const slides = [];
    for (let i = 0; i < cards.length; i += 2) {
      const slide = document.createElement('div');
      slide.className = 'features-slide';
      slide.setAttribute('role','group');
      slide.setAttribute('aria-roledescription','slide');
      slide.setAttribute('aria-label', `${Math.floor(i/2)+1} из ${Math.ceil(cards.length/2)}`);

      slide.appendChild(cards[i]);
      if (cards[i+1]) {
        slide.appendChild(cards[i+1]);
      } else {
        const ghost = cards[i].cloneNode(false);
        ghost.className = (ghost.className || '') + ' feature-block-small--ghost feature-block--ghost';
        slide.appendChild(ghost);
      }

      track.appendChild(slide);
      slides.push(slide);
    }

    // вставка перед индикатором
    root.insertBefore(track, indicator);
    if (smallContainer) smallContainer.style.display = 'none';

    // линии-кнопки: берём любые span внутри индикатора
    const getDots = () => Array.from(indicator.children);
    getDots().forEach((dot, i) => {
      dot.addEventListener('click', () => goTo(i));

      // визуальный отклик на нажатие
      dot.addEventListener('pointerdown', () => dot.classList.add('is-pressed'));
      const clearPress = () => dot.classList.remove('is-pressed');
      dot.addEventListener('pointerup', clearPress);
      dot.addEventListener('pointercancel', clearPress);
      dot.addEventListener('pointerleave', clearPress);
      dot.addEventListener('pointerout', clearPress);
    });

    function setActiveDot() {
      getDots().forEach((d, i) => d.classList.toggle('active', i === index));
    }

    const pageW = () => slides[0]?.getBoundingClientRect().width || root.getBoundingClientRect().width;

    let index = 0;

    function goTo(i, animate = true) {
      index = Math.max(0, Math.min(i, slides.length - 1));
      track.style.transition = animate ? 'transform 400ms ease' : 'none';
      track.style.transform  = `translate3d(${-Math.round(index * pageW())}px,0,0)`;
      setActiveDot();
      equalizeHeightsGlobal();
    }

    // одинаковая высота ДЛЯ ВСЕХ карточек секции
    function equalizeHeightsGlobal() {
      const allItems = Array.from(
        root.querySelectorAll('.feature-block, .feature-block-small, .feature-block--ghost, .feature-block-small--ghost')
      );
      allItems.forEach(el => { el.style.minHeight = ''; });

      let maxH = 0;
      allItems.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.height) maxH = Math.max(maxH, rect.height);
      });

      const h = Math.ceil(maxH);
      allItems.forEach(el => { el.style.minHeight = h + 'px'; });
    }

    // свайп/drag
    let dragging=false, startX=0, startY=0, startT=0, startTransform=0, ptrId=null;
    function onDown(e){
      ptrId=e.pointerId; dragging=true;
      startX=e.clientX; startY=e.clientY; startT=e.timeStamp;
      startTransform=-index*pageW();
      root.classList.add('features-slider--dragging');
      track.style.transition='none';
      track.setPointerCapture(ptrId);
    }
    function onMove(e){
      if(!dragging) return;
      const dx=e.clientX-startX, dy=e.clientY-startY;
      if(Math.abs(dy)>Math.abs(dx)) return;
      track.style.transform=`translate3d(${Math.round(startTransform+dx)}px,0,0)`;
    }
    function onUp(e){
      if(!dragging) return; dragging=false;
      root.classList.remove('features-slider--dragging');
      try{ track.releasePointerCapture(ptrId);}catch(_){}
      const dx=e.clientX-startX, dt=Math.max(1,e.timeStamp-startT), v=Math.abs(dx)/dt, w=pageW();
      const flip = Math.abs(dx)>w*0.25 || v>0.6;
      if(flip){
        if(dx<0 && index<slides.length-1) index++;
        else if(dx>0 && index>0) index--;
      }
      goTo(index,true);
    }
    track.addEventListener('pointerdown', onDown);
    track.addEventListener('pointermove', onMove);
    track.addEventListener('pointerup', onUp);
    track.addEventListener('pointercancel', onUp);

    // клавиатура
    root.setAttribute('tabindex','0');
    root.addEventListener('keydown', e => {
      if(e.key==='ArrowRight') goTo(index+1);
      if(e.key==='ArrowLeft')  goTo(index-1);
    });

    // ресайз
    const ro = new ResizeObserver(() => { goTo(index,false); equalizeHeightsGlobal(); });
    ro.observe(root);
    slides.forEach(s => ro.observe(s));

    // загрузка картинок/шрифтов
    const imgs = root.querySelectorAll('img');
    let pending = imgs.length;
    const doneOnce = () => equalizeHeightsGlobal();
    if (pending === 0) doneOnce();
    imgs.forEach(img => {
      if (img.complete) { if(--pending===0) doneOnce(); }
      else img.addEventListener('load', () => { if(--pending===0) doneOnce(); }, { once:true });
    });
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(doneOnce).catch(()=>{}); }

    // старт
    goTo(0,false);

    // teardown
    function cleanup(){
      ro.disconnect();
      track.removeEventListener('pointerdown', onDown);
      track.removeEventListener('pointermove', onMove);
      track.removeEventListener('pointerup', onUp);
      track.removeEventListener('pointercancel', onUp);
      root.classList.remove('features-slider','features-slider--dragging');
      if (smallContainer) smallContainer.style.display = '';
      track.remove();
      positions.forEach(({ n,p,next }) => {
        if(next && next.parentNode===p) p.insertBefore(n,next);
        else p.appendChild(n);
      });
    }
    return cleanup;
  }

  function handleMode() {
    const isMobile = window.matchMedia(`(max-width: ${BREAKPOINT-1}px)`).matches;
    if (isMobile && !mounted) {
      teardown = initFeaturesSlider();
      mounted = true;
    } else if (!isMobile && mounted) {
      teardown && teardown();
      teardown = null;
      mounted = false;
    }
  }

  document.addEventListener('DOMContentLoaded', handleMode);
  window.addEventListener('resize', handleMode);
})();
