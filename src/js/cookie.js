 document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('cookie-modal');
    const acceptBtn = document.getElementById('cookie-accept-btn');

    if (!modal || !acceptBtn) return;
    acceptBtn.addEventListener('click', function () {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    });
  });
