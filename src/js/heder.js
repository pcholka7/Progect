document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const body = document.body;

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('is-active');
      mobileMenu.classList.toggle('is-open');
      body.classList.toggle('no-scroll');
    });

    const mobileLinks = mobileMenu.querySelectorAll('a[href^="#"]');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('is-active');
        mobileMenu.classList.remove('is-open');
        body.classList.remove('no-scroll');
      });
    });
  }
});
