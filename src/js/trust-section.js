function initializeReviewsSlider() {
    const wrapper = document.querySelector('.reviews-wrapper');
    const prevButton = document.querySelector('.prev-arrow');
    const nextButton = document.querySelector('.next-arrow');
    const cards = document.querySelectorAll('.review-card');

    if (!wrapper || !prevButton || !nextButton || cards.length === 0) {
        console.error("Элементы слайдера не найдены. Проверьте классы.");
        return;
    }
    const CARD_WIDTH_WITH_GAP = 593;
    const CARDS_PER_VIEW = 3;
    const TOTAL_CARDS = cards.length;
    const MAX_INDEX = TOTAL_CARDS - CARDS_PER_VIEW;

    let currentSlideIndex = 0;

    function updateSlider() {
        const offset = -currentSlideIndex * CARD_WIDTH_WITH_GAP;

        wrapper.style.transform = `translateX(${offset}px)`;
        prevButton.disabled = currentSlideIndex === 0;
        nextButton.disabled = currentSlideIndex >= MAX_INDEX;

        const prevPath = prevButton.querySelector('svg path');
        const nextPath = nextButton.querySelector('svg path');
        if (prevButton.disabled) {
            prevPath.setAttribute('fill', '#B0B0B0');
        } else {
            prevPath.setAttribute('fill', '#333333');
        }

        if (nextButton.disabled) {
            nextPath.setAttribute('fill', '#B0B0B0');
        } else {
            nextPath.setAttribute('fill', '#333333');
        }
    }

    prevButton.addEventListener('click', () => {
        if (currentSlideIndex > 0) {
            currentSlideIndex--;
            updateSlider();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentSlideIndex < MAX_INDEX) {
            currentSlideIndex++;
            updateSlider();
        }
    });

    updateSlider();
}

document.addEventListener('DOMContentLoaded', initializeReviewsSlider);
