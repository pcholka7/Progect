document.addEventListener('DOMContentLoaded', function () {
  const desktopImage = document.getElementById('how-it-works-image');
  const desktopVideo = document.getElementById('desktop-video');

  desktopImage.addEventListener('click', function () {

    desktopImage.style.display = 'none';

    desktopVideo.style.display = 'block';
    desktopVideo.play();
  });
});
