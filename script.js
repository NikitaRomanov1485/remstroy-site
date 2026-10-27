// 1. Прокрутка наверх
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 2. Модалка заявки
function openModal() {
  var overlay = document.getElementById('modalOverlay');
  var form = document.getElementById('modalForm');
  var success = document.getElementById('modalSuccess');
  if (overlay) {
    overlay.classList.add('active');
    document.body.classList.add('modal-open');
    if (form) form.classList.remove('hide');
    if (success) success.classList.remove('show');
  }
}

function closeModal() {
  var overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
}

// 3. Модалка отзыва
function openReviewModal() {
  var overlay = document.getElementById('reviewOverlay');
  var form = document.getElementById('reviewFormView');
  var success = document.getElementById('reviewSuccess');
  if (overlay) {
    overlay.classList.add('active');
    document.body.classList.add('modal-open');
    if (form) form.classList.remove('hide');
    if (success) success.classList.remove('show');
  }
}

function closeReviewModal() {
  var overlay = document.getElementById('reviewOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
}

// 4. Плавающие кнопки и кнопка "Наверх"
document.addEventListener('DOMContentLoaded', function() {
  var floatButtons = document.getElementById('floatButtons');
  var upBtn = document.getElementById('upBtn');

  window.addEventListener('scroll', function() {
    var scrolled = window.scrollY;
    if (floatButtons) {
      if (scrolled > 300) floatButtons.classList.add('show');
      else floatButtons.classList.remove('show');
    }
    if (upBtn) {
      if (scrolled > 600) upBtn.classList.add('show');
      else upBtn.classList.remove('show');
    }
  });
  
  // Проверка при загрузке (если страница уже прокручена)
  if (floatButtons || upBtn) window.dispatchEvent(new Event('scroll'));
});

// 5. Привязка кнопки "Оставить отзыв" (на всякий случай)
document.addEventListener('DOMContentLoaded', function() {
  var btn = document.getElementById('openReviewBtn');
  if (btn) {
    btn.addEventListener('click', openReviewModal);
  }
});

// 6. Закрытие по Esc
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeModal();
    closeReviewModal();
  }
});