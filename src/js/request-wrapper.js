document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('request-form');
  const nameInput = document.getElementById('name-input');
  const phoneInput = document.getElementById('phone-input');
  const emailInput = document.getElementById('email-input');
  const phoneErrorMessage = document.getElementById('phone-error-message');
  const emailErrorMessage = document.getElementById('email-error-message');

  const PHONE_PREFIX = '+7 (';
  let lastValidDigits = null;


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

  phoneInput.addEventListener('input', () => {
    const before = phoneInput.value;
    const masked = mask(before);
    phoneInput.value = masked;

    const d = digitsOnly(masked);
    if (d.length === 11) {
      lastValidDigits = d;
      phoneInput.classList.remove('invalid-input');
      phoneErrorMessage.style.display = 'none';
    }
  });


  phoneInput.addEventListener('keydown', (e) => {
    const start = phoneInput.selectionStart;
    const end = phoneInput.selectionEnd;
    if ((e.key === 'Backspace' && start <= 4 && end <= 4) ||
        (e.key === 'Delete' && start < 4)) {
      e.preventDefault();
    }
  });


  const outsideHandler = (e) => {
    if (e.target.closest && e.target.closest('#phone-input')) return;
    const currentLen = digitsOnly(phoneInput.value).length;
    if (currentLen < 11) {
      if (lastValidDigits) {
        phoneInput.value = mask(lastValidDigits);
      }
    }
  };

  document.addEventListener('pointerdown', outsideHandler, true);


  phoneInput.addEventListener('blur', () => {
    const len = digitsOnly(phoneInput.value).length;
    if (len < 11 && lastValidDigits) {
      phoneInput.value = mask(lastValidDigits);
    }
  });

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

      form.reset();
      lastValidDigits = null;

      alert('Форма успешно отправлена!');
    }
  });
});

