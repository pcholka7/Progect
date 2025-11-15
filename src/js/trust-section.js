(() => {
  const perfNow =
    (typeof window !== "undefined" &&
      window.performance &&
      typeof window.performance.now === "function")
      ? () => window.performance.now()
      : () => Date.now();

  document
    .querySelectorAll(".reviews-section")
    .forEach(initReviewsSlider);

  function equalizeMobileReviewHeights(root) {
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    const wrapper = root.querySelector(".reviews-wrapper");
    if (!wrapper) return;

    wrapper
      .querySelectorAll(".review-card")
      .forEach((c) => {
        c.style.height = "";
      });

    if (!isMobile) return;

    const realCards = Array.from(
      wrapper.querySelectorAll(".review-card:not(.review-card--ghost)")
    );
    if (!realCards.length) return;

    let maxH = 0;
    realCards.forEach((c) => {
      const h = c.offsetHeight;
      if (h > maxH) maxH = h;
    });

    wrapper
      .querySelectorAll(".review-card")
      .forEach((c) => {
        c.style.height = maxH + "px";
      });
  }

  function initReviewsSlider(root) {
    const viewport = root.querySelector(".reviews-viewport");
    const wrapper = root.querySelector(".reviews-wrapper");
    if (!viewport || !wrapper) return;

    const prevBtn = root.querySelector(".reviews-navigation .prev-arrow");
    const nextBtn = root.querySelector(".reviews-navigation .next-arrow");
    const dotsBox =
      root.querySelector(".slider-indicator--reviews") ||
      root.parentElement?.querySelector(".slider-indicator--reviews") ||
      document.querySelector(".slider-indicator--reviews");

    const mql = window.matchMedia("(max-width: 1023px)");

    let page = 0;
    let pagesTotal = 1;
    let grouped = false;
    let slides = [];

    const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
    const getCards = () =>
      Array.from(wrapper.querySelectorAll(".review-card"));

    const getGridCols = () => {
      const cs =
        typeof window !== "undefined" &&
        typeof window.getComputedStyle === "function"
          ? window.getComputedStyle(wrapper)
          : null;

      const tpl =
        cs && cs.gridTemplateColumns
          ? cs.gridTemplateColumns
          : "1fr 1fr 1fr";

      return tpl && tpl !== "none"
        ? tpl.split(" ").filter(Boolean).length
        : 3;
    };

    const slideWidth = () => viewport.clientWidth || 0;

    const clearInlineDisplay = () => {
      getCards().forEach((card) => {
        card.style.display = "";
      });
    };

    const buildDots = () => {
      if (!dotsBox || !mql.matches) return;
      dotsBox.innerHTML = "";
      for (let i = 0; i < pagesTotal; i++) {
        const d = document.createElement("span");
        d.className =
          "slider-indicator__dot" + (i === page ? " active" : "");
        d.dataset.index = String(i);
        dotsBox.appendChild(d);
      }
    };

    const updateDotsActive = () => {
      if (!dotsBox) return;
      dotsBox
        .querySelectorAll(".slider-indicator__dot")
        .forEach((d, i) => {
          d.classList.toggle("active", i === page);
        });
    };

    const updateNavState = () => {
      if (prevBtn) {
        const isDisabledPrev = page === 0;
        prevBtn.disabled = isDisabledPrev;
        prevBtn.classList.toggle("is-active", !isDisabledPrev);
      }

      if (nextBtn) {
        const isDisabledNext = page >= pagesTotal - 1;
        nextBtn.disabled = isDisabledNext;
        nextBtn.classList.toggle("is-active", !isDisabledNext);
      }
    };

    const groupForMobile = () => {
      if (grouped) return;
      clearInlineDisplay();

      const cards = getCards();
      if (!cards.length) return;

      const frag = document.createDocumentFragment();

      for (let i = 0; i < cards.length; i += 2) {
        const slide = document.createElement("div");
        slide.className = "review-slide";
        slide.appendChild(cards[i]);

        if (cards[i + 1]) {
          slide.appendChild(cards[i + 1]);
        } else {
          const ghost = document.createElement("div");
          ghost.className = "review-card review-card--ghost";
          ghost.setAttribute("aria-hidden", "true");
          slide.appendChild(ghost);
        }

        frag.appendChild(slide);
      }

      wrapper.innerHTML = "";
      wrapper.appendChild(frag);
      grouped = true;
      slides = Array.from(wrapper.children);
    };

    const ungroupForDesktop = () => {
      if (!grouped) return;

      const allSlides = Array.from(
        wrapper.querySelectorAll(".review-slide")
      );
      const frag = document.createDocumentFragment();

      allSlides.forEach((sl) => {
        while (sl.firstChild) {
          frag.appendChild(sl.firstChild);
        }
      });

      wrapper.innerHTML = "";
      wrapper.appendChild(frag);

      grouped = false;
      slides = [];

      wrapper
        .querySelectorAll(".review-card--ghost")
        .forEach((g) => g.remove());

      clearInlineDisplay();
    };

    const render = () => {
      if (mql.matches) {
        groupForMobile();
        slides = Array.from(wrapper.children);
        pagesTotal = Math.max(1, slides.length);
        page = clamp(page, 0, pagesTotal - 1);

        const offset = -page * slideWidth();
        wrapper.style.transform = `translate3d(${offset}px, 0, 0)`;

        buildDots();
        updateDotsActive();
        updateNavState();

        equalizeMobileReviewHeights(root);
      } else {
        ungroupForDesktop();

        const cards = getCards();
        const perView = getGridCols();

        pagesTotal = Math.max(1, cards.length - perView + 1);
        page = clamp(page, 0, pagesTotal - 1);

        const start = page;
        const end = start + perView - 1;

        cards.forEach((card, i) => {
          card.style.display =
            i >= start && i <= end ? "" : "none";
        });

        wrapper.style.transform = "translate3d(0,0,0)";
        updateNavState();
        updateDotsActive();

        equalizeMobileReviewHeights(root);
      }
    };

    const goTo = (next) => {
      page = clamp(next, 0, pagesTotal - 1);
      wrapper.style.transition = "transform .3s ease";
      render();
    };

    const snapBack = () => {
      if (!mql.matches) return;
      wrapper.style.transition = "transform .3s ease";
      const offset = -page * slideWidth();
      wrapper.style.transform = `translate3d(${offset}px,0,0)`;
    };

    let dragging = false;
    let startX = 0;
    let currX = 0;
    let startT = 0;
    const THRESHOLD = 50;

    const onPointerDown = (e) => {
      if (!mql.matches) return;

      dragging = true;
      startX =
        "touches" in e
          ? e.touches[0].clientX
          : e.clientX ?? 0;
      currX = startX;
      startT = perfNow();

      wrapper.style.transition = "none";

      window.addEventListener("pointermove", onPointerMove, {
        passive: true,
      });
      window.addEventListener("pointerup", onPointerUp, {
        passive: true,
        once: true,
      });

      window.addEventListener("touchmove", onPointerMove, {
        passive: true,
      });
      window.addEventListener("touchend", onPointerUp, {
        passive: true,
        once: true,
      });
    };

    const onPointerMove = (e) => {
      if (!dragging || !mql.matches) return;

      const x =
        "touches" in e
          ? (e.touches[0]?.clientX ?? currX)
          : e.clientX ?? currX;

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

      wrapper.style.transition = "transform .3s ease";

      if (Math.abs(dx) > THRESHOLD || fast) {
        if (dx < 0) {
          goTo(page + 1);
        } else {
          goTo(page - 1);
        }
      } else {
        snapBack();
      }

      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onPointerMove);
    };

    if (prevBtn) {
      prevBtn.addEventListener("click", () => goTo(page - 1));
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => goTo(page + 1));
    }

    if (dotsBox) {
      dotsBox.addEventListener("click", (e) => {
        const dot = e.target.closest(".slider-indicator__dot");
        if (!dot) return;
        const idx = parseInt(dot.dataset.index || "0", 10);
        goTo(idx);
      });
    }

    viewport.addEventListener("pointerdown", onPointerDown, {
      passive: true,
    });
    viewport.addEventListener("touchstart", onPointerDown, {
      passive: true,
    });

    window.addEventListener("resize", render, { passive: true });
    mql.addEventListener("change", () => {
      page = 0;
      render();
    });

    const hasRO =
      typeof window !== "undefined" && "ResizeObserver" in window;
    if (hasRO) {
      const ro = new window.ResizeObserver(() => {
        if (mql.matches) {
          render();
        }
      });
      ro.observe(wrapper);
    }

    window.addEventListener(
      "load",
      () => equalizeMobileReviewHeights(root),
      { once: true }
    );

    render();
  }

  document
    .querySelectorAll(".reviews-navigation .nav-arrow")
    .forEach((btn) => {
      const on = () => btn.classList.add("is-pressed");
      const off = () => btn.classList.remove("is-pressed");

      btn.addEventListener("mousedown", on);
      btn.addEventListener("touchstart", on, { passive: true });

      ["mouseup", "mouseleave", "blur", "touchend", "touchcancel"]
        .forEach((e) => {
          btn.addEventListener(e, off, { passive: true });
        });
    });
})();
