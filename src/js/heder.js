// Этот код гарантирует, что скрипт начнет работу только после полной загрузки страницы.
document.addEventListener('DOMContentLoaded', () => {
    // 1. Находим элементы по ID, которые мы добавили в HTML
    const menuToggle = document.getElementById('menu-toggle'); // Кнопка-гамбургер
    const mobileMenu = document.getElementById('mobile-menu'); // Сам контейнер мобильного меню
    const body = document.body; // Тег <body> для блокировки скролла

    // 2. Добавляем слушатель события 'click' для кнопки
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            // Переключаем классы:
            // - 'is-active' для гамбургера (анимация в крестик)
            menuToggle.classList.toggle('is-active');

            // - 'is-open' для меню (открытие/закрытие сдвигом)
            mobileMenu.classList.toggle('is-open');

            // - 'no-scroll' для body (блокировка прокрутки)
            body.classList.toggle('no-scroll');
        });

        // 3. Закрытие меню при клике на любую ссылку внутри него
        const mobileLinks = mobileMenu.querySelectorAll('a[href^="#"]');

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Удаляем классы, чтобы меню закрылось и скролл вернулся
                menuToggle.classList.remove('is-active');
                mobileMenu.classList.remove('is-open');
                body.classList.remove('no-scroll');
                // Переход к якорю (#advantages, #tariffs и т.д.) произойдет автоматически
            });
        });
    }
});
