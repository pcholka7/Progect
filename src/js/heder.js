document.addEventListener('DOMContentLoaded', function () {
  var body = document.body;
  var header = document.querySelector('.page-header');
  var menuToggle = document.getElementById('menu-toggle');
  var mobileMenu = document.getElementById('mobile-menu');

  if (!header) return;

  function applyOffset() {
    var h = header.getBoundingClientRect().height;
    body.style.paddingTop = h + 'px';
  }

  // первый расчёт и пересчёты
  applyOffset();
  window.addEventListener('load', applyOffset);
  window.addEventListener('resize', applyOffset);
  window.addEventListener('orientationchange', applyOffset);

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      menuToggle.classList.toggle('is-active');
      mobileMenu.classList.toggle('is-open');
      body.classList.toggle('no-scroll');
      applyOffset();
    });

    var links = mobileMenu.querySelectorAll('a[href^="#"]');
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        menuToggle.classList.remove('is-active');
        mobileMenu.classList.remove('is-open');
        body.classList.remove('no-scroll');
        applyOffset();
      });
    });
  }
});
