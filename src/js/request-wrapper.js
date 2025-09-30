document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('request-form');
    const nameInput = document.getElementById('name-input');
    const phoneInput = document.getElementById('phone-input');
    const emailInput = document.getElementById('email-input');
    const phoneErrorMessage = document.getElementById('phone-error-message');
    const emailErrorMessage = document.getElementById('email-error-message');

    // Настройка маски для номера телефона
    phoneInput.addEventListener('focus', () => {
        if (!phoneInput.value) {
            phoneInput.value = '+7 (';
        }
    });

    phoneInput.addEventListener('input', () => {
        let value = phoneInput.value.replace(/\D/g, '');
        let maskedValue = '+7 (';
        if (value.length > 1) {
            maskedValue += value.substring(1, 4);
        }
        if (value.length >= 5) {
            maskedValue += ') ' + value.substring(4, 7);
        }
        if (value.length >= 8) {
            maskedValue += '-' + value.substring(7, 9);
        }
        if (value.length >= 10) {
            maskedValue += '-' + value.substring(9, 11);
        }
        phoneInput.value = maskedValue;

        if (phoneInput.value.replace(/\D/g, '').length === 11) {
            phoneInput.classList.remove('invalid-input');
            phoneErrorMessage.style.display = 'none';
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let isValid = true;

        nameInput.classList.remove('invalid-input');
        phoneInput.classList.remove('invalid-input');
        emailInput.classList.remove('invalid-input');
        phoneErrorMessage.style.display = 'none';
        emailErrorMessage.style.display = 'none';

        if (nameInput.value.trim() === '') {
            isValid = false;
            nameInput.classList.add('invalid-input');
        }

        if (phoneInput.value.replace(/\D/g, '').length < 11) {
            isValid = false;
            phoneInput.classList.add('invalid-input');
            phoneErrorMessage.style.display = 'block';
        }

        if (emailInput.value.trim() === '' || !emailInput.value.includes('@')) {
            isValid = false;
            emailInput.classList.add('invalid-input');
            emailErrorMessage.style.display = 'block';
        }

        if (isValid) {
          form.reset();
            alert('Форма успешно отправлена!');
        }
    });
});
