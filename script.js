// Проверка, что скрипт загрузился
console.log("Скрипт успешно загружен!");

// Функция для кнопки наверх
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Показ кнопок при прокрутке
window.addEventListener('scroll', function() {
  var floatBtns = document.getElementById('floatButtons');
  var upBtn = document.getElementById('upBtn');
  
  if (floatBtns) {
    if (window.scrollY > 300) {
      floatBtns.classList.add('show');
    } else {
      floatBtns.classList.remove('show');
    }
  }
  
  if (upBtn) {
    if (window.scrollY > 600) {
      upBtn.classList.add('show');
    } else {
      upBtn.classList.remove('show');
    }
  }
});

// Открытие модалки отзыва (привязываем клик по ID)
document.addEventListener("DOMContentLoaded", function() {
  var btn = document.getElementById('openReviewBtn');
  if (btn) {
    btn.addEventListener('click', function() {
      document.getElementById('reviewOverlay').classList.add('active');
      document.body.classList.add('modal-open');
    });
  }
});