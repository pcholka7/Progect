document.addEventListener('DOMContentLoaded', () => {
  const toggleButtons = document.querySelectorAll('.faq-toggle-btn');
  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      const faqCard = button.closest('.faq-card');
      if (faqCard) {
        faqCard.classList.toggle('faq-card-open');
      }
    });
  });
});
