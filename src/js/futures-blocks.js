document.addEventListener('DOMContentLoaded', function () {
  const container = document.querySelector('.features-blocks-small');
  const cards = Array.from(container.children); // Получаем карточки

  // Очищаем контейнер
  container.innerHTML = '';

  // Создаем слайды по 2 карточки
  const slides = [];
  for (let i = 0; i < cards.length; i += 2) {
    const slide = document.createElement('div');
    slide.className = 'slide';

    // Добавляем 1-ю карточку
    slide.appendChild(cards[i]);

    // Добавляем 2-ю карточку, если она есть
    if (cards[i + 1]) {
      slide.appendChild(cards[i + 1]);
    }

    slides.push(slide);
  }

  // Добавляем слайды обратно в контейнер
  slides.forEach(slide => container.appendChild(slide));

  // Стили для слайдов
  container.style.display = 'flex';
  container.style.overflow = 'hidden';

  slides.forEach(slide => {
    slide.style.flex = '0 0 100%'; // слайд занимает 100% ширины
    slide.style.display = 'flex';
    slide.style.flexDirection = 'column'; // карточки вертикально
    slide.style.gap = '12px';
  });

  const indicator = document.querySelector('.slider-indicator');
  const dots = Array.from(indicator.querySelectorAll('.slider-indicator__dot'));

  let currentSlide = 0;

  function updateSlider() {
    container.style.transform = `translateX(-${currentSlide * 100}%)`;
    container.style.transition = 'transform 0.4s ease';

    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlide);
    });
  }

  // Обработчики для точек индикатора
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      currentSlide = idx;
      updateSlider();
    });
  });

  updateSlider();
});
