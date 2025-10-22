document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('request-form');
  const nameInput = document.getElementById('name-input');
  const phoneInput = document.getElementById('phone-input');
  const emailInput = document.getElementById('email-input');
  const phoneErrorMessage = document.getElementById('phone-error-message');
  const emailErrorMessage = document.getElementById('email-error-message');

  const PHONE_PREFIX = '+7 (';
  let lastValidDigits = null; // здесь храним последние 11 цифр корректного номера

  // ——— утилиты ———
  const digitsOnly = (v) => v.replace(/\D/g, '');
  const mask = (digits) => {
    let d = digitsOnly(digits);
    if (!d.startsWith('7')) d = '7' + d.replace(/^7+/, '');
    d = d.slice(0, 11);
    let m = PHONE_PREFIX;
    if (d.length > 1) m += d.substring(1, 4);
    if (d.length >= 5) m += ') ' + d.substring(4, 7);
    if (d.length >= 8) m += '-' + d.substring(7, 9);
    if (d.length >= 10) m += '-' + d.substring(9, 11);
    return m;
  };

  // Инициализация (не навязываю префикс, чтобы не мешать твоей логике/placeholder)
  // phoneInput.value ||= PHONE_PREFIX; // если нужно — раскомментируй

  // Маска при вводе + сохранение последнего корректного номера
  phoneInput.addEventListener('input', () => {
    const before = phoneInput.value;
    const masked = mask(before);
    phoneInput.value = masked;

    const d = digitsOnly(masked);
    if (d.length === 11) {
      lastValidDigits = d; // запомнили корректный номер
      phoneInput.classList.remove('invalid-input');
      phoneErrorMessage.style.display = 'none';
    }
  });

  // Защищаем префикс от стирания (по желанию можно удалить)
  phoneInput.addEventListener('keydown', (e) => {
    const start = phoneInput.selectionStart;
    const end = phoneInput.selectionEnd;
    if ((e.key === 'Backspace' && start <= 4 && end <= 4) ||
        (e.key === 'Delete' && start < 4)) {
      e.preventDefault();
    }
  });

  // ГЛАВНОЕ: клик/тап вне поля — вернуть последний полный номер, если текущий неполный
  const outsideHandler = (e) => {
    if (e.target.closest && e.target.closest('#phone-input')) return; // клик по самому полю — игнор
    const currentLen = digitsOnly(phoneInput.value).length;
    if (currentLen < 11) {
      if (lastValidDigits) {
        phoneInput.value = mask(lastValidDigits); // вернули последний корректный номер
      } else {
        // если корректного ещё не было — можно ничего не делать
        // или показать префикс: phoneInput.value = PHONE_PREFIX;
      }
    }
  };
  // pointerdown в capture, чтобы не блокировался stopPropagation-ом
  document.addEventListener('pointerdown', outsideHandler, true);

  // Подстраховка: ушли с поля — если неполный и есть сохранённый — вернём его
  phoneInput.addEventListener('blur', () => {
    const len = digitsOnly(phoneInput.value).length;
    if (len < 11 && lastValidDigits) {
      phoneInput.value = mask(lastValidDigits);
    }
  });

  // Сабмит + валидация
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;
    [nameInput, phoneInput, emailInput].forEach(el => el.classList.remove('invalid-input'));
    phoneErrorMessage.style.display = 'none';
    emailErrorMessage.style.display = 'none';

    const phoneDigits = digitsOnly(phoneInput.value);
    if (nameInput.value.trim() === '') {
      isValid = false; nameInput.classList.add('invalid-input');
    }
    if (phoneDigits.length < 11) {
      isValid = false; phoneInput.classList.add('invalid-input'); phoneErrorMessage.style.display = 'block';
    }
    if (emailInput.value.trim() === '' || !emailInput.value.includes('@')) {
      isValid = false; emailInput.classList.add('invalid-input'); emailErrorMessage.style.display = 'block';
    }

    if (isValid) {
      // отправка…
      form.reset();
      lastValidDigits = null; // очищаем сохранённый номер после успешной отправки
      // phoneInput.value = PHONE_PREFIX; // при желании — снова показать префикс
      alert('Форма успешно отправлена!');
    }
  });
});

