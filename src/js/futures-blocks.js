document.addEventListener('DOMContentLoaded', function () {
    const mobileBreakpoint = 768;
    const isMobile = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`);

    const bigContainer = document.querySelector('.features-blocks');
    const smallContainer = document.querySelector('.features-blocks-small');
    const indicator = document.querySelector('.slider-indicator');

    if (!bigContainer || !smallContainer || !indicator) return;

    const dots = Array.from(indicator.querySelectorAll('.slider-indicator__dot'));
    let currentSlide = 0;
    // Создаем место для хранения исходных карточек, чтобы они не потерялись
    let originalSmallCards = Array.from(smallContainer.children);

    // Функция, которая переключает видимость секций и прокручивает маленький слайдер
    function updateLayout() {
        if (isMobile.matches) {
            // --- Логика переключения секций ---

            // Слайд 1 (Точка 1): Большие блоки
            if (currentSlide === 0) {
                bigContainer.style.display = 'flex';
                smallContainer.style.display = 'none';
            }
            // Слайды 2 и 3 (Точки 2 и 3): Маленькие блоки
            else {
                bigContainer.style.display = 'none';
                smallContainer.style.display = 'flex';

                // --- Логика прокрутки маленьких блоков ---
                const smallSlideIndex = currentSlide - 1;
                smallContainer.style.transform = `translateX(-${smallSlideIndex * 100}%)`;
                smallContainer.style.transition = 'transform 0.4s ease';
            }

            // --- Обновление индикатора ---
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentSlide);
            });

        } else {
            // Сброс стилей для десктопа
            bigContainer.removeAttribute('style');
            smallContainer.removeAttribute('style');
            smallContainer.style.transform = 'none';
        }
    }

    // --- ИСПРАВЛЕННАЯ Логика создания слайдов для маленьких блоков ---
    function transformSmallBlocks() {
        // Логика сброса для десктопа
        if (!isMobile.matches) {
            if (smallContainer.classList.contains('slider-initialized')) {
                // Восстанавливаем оригинальные карточки
                smallContainer.innerHTML = '';
                originalSmallCards.forEach(card => smallContainer.appendChild(card));
                smallContainer.classList.remove('slider-initialized');
            }
            return;
        }

        // Если уже инициализировано (и мы на мобильном), выходим
        if (smallContainer.classList.contains('slider-initialized')) return;

        // Используем сохраненные оригинальные карточки
        let cards = originalSmallCards;

        // Проверка: если карточек не 4, мы не можем создать 3 слайда
        if (cards.length !== 4) return;

        // Создаем обертки .slide
        smallContainer.innerHTML = '';

        for (let i = 0; i < cards.length; i += 2) {
            const slide = document.createElement('div');
            slide.className = 'slide';

            slide.appendChild(cards[i]);

            if (cards[i + 1]) {
                slide.appendChild(cards[i + 1]);
            }
            smallContainer.appendChild(slide);
        }
        smallContainer.classList.add('slider-initialized');
    }

    // Переключение по точкам
    dots.forEach((dot, idx) => {
        dot.onclick = () => {
            currentSlide = idx;
            updateLayout();
        };
    });

    // Запуск при загрузке и изменении размера
    function init() {
        // Важно: на мобильном мы создаем слайдер
        transformSmallBlocks();
        // И сразу обновляем расположение
        updateLayout();
    }

    init();
    isMobile.addEventListener('change', init);
});
