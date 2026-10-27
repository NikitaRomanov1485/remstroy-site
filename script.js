// 1. Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  
  // --- МАСКА ТЕЛЕФОНА ---
  var telInputs = document.querySelectorAll('input[type="tel"]');
  for (var i = 0; i < telInputs.length; i++) {
    (function(input) {
      var PREFIX = '+375 ';
      input.addEventListener('focus', function() {
        if (!this.value || this.value.length < PREFIX.length) this.value = PREFIX;
      });
      input.addEventListener('input', function() {
        var digits = this.value.replace(/\D/g, '');
        if (digits.startsWith('375')) digits = digits.slice(3);
        digits = digits.slice(0, 9);
        var formatted = PREFIX;
        if (digits.length > 0) formatted += digits.slice(0, 2);
        if (digits.length > 2) formatted += ' ' + digits.slice(2, 5);
        if (digits.length > 5) formatted += '-' + digits.slice(5, 7);
        if (digits.length > 7) formatted += '-' + digits.slice(7, 9);
        this.value = formatted;
      });
    })(telInputs[i]);
  }

  // --- КНОПКА НАВЕРХ И ПЛАВАЮЩИЕ КНОПКИ ---
  var floatButtons = document.getElementById('floatButtons');
  var upBtn = document.getElementById('scrollTopBtn');

  if (upBtn) {
    upBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

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

  // --- ЗВЕЗДЫ ---
  var starButtons = document.querySelectorAll('.star');
  var reviewRating = document.getElementById('review-rating');
  
  for (var s = 0; s < starButtons.length; s++) {
    starButtons[s].addEventListener('click', function() {
      var value = parseInt(this.getAttribute('data-value'));
      if (reviewRating) reviewRating.value = value;
      for (var i = 0; i < starButtons.length; i++) {
        if (parseInt(starButtons[i].getAttribute('data-value')) <= value) {
          starButtons[i].classList.add('active');
        } else {
          starButtons[i].classList.remove('active');
        }
      }
    });
  }

  // --- ФОТО ---
  var selectedPhotos = [];
  var reviewPhotos = document.getElementById('review-photos');
  var filePreview = document.getElementById('filePreview');
  var fileUploadInfo = document.getElementById('fileUploadInfo');

  if (reviewPhotos) {
    reviewPhotos.addEventListener('change', function() {
      var files = this.files;
      for (var i = 0; i < files.length; i++) {
        if (selectedPhotos.length >= 3) { alert('Максимум 3 фото'); break; }
        if (files[i].size > 5 * 1024 * 1024) { alert('Файл больше 5 МБ'); continue; }
        selectedPhotos.push(files[i]);
      }
      this.value = '';
      
      if (filePreview) {
        filePreview.innerHTML = '';
        for (var k = 0; k < selectedPhotos.length; k++) {
          (function(index) {
            var file = selectedPhotos[index];
            var item = document.createElement('div');
            item.className = 'file-preview-item';
            var img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            item.appendChild(img);
            var removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'file-preview-remove';
            removeBtn.innerHTML = '×';
            removeBtn.addEventListener('click', function() {
              selectedPhotos.splice(index, 1);
              filePreview.innerHTML = '';
              // Перерисовка после удаления
              var evt = new Event('change');
              reviewPhotos.dispatchEvent(evt);
            });
            item.appendChild(removeBtn);
            filePreview.appendChild(item);
          })(k);
        }
      }
      
      if (fileUploadInfo) {
        fileUploadInfo.textContent = selectedPhotos.length > 0 ? 'Выбрано: ' + selectedPhotos.length + ' из 3' : 'Не более 3 фото, до 5 МБ';
      }
    });
  }

  // --- ОТПРАВКА ОТЗЫВА ---
  var reviewFormEl = document.getElementById('reviewFormEl');
  var TG_TOKEN = '8979084313:AAH5LtdHYApK1mO-VWrUQhkbAtniUHkED_Y';
  var TG_CHAT_ID = '7310945290';

  if (reviewFormEl) {
    reviewFormEl.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      var name = document.getElementById('review-name').value.trim();
      var text = document.getElementById('review-text').value.trim();
      var rating = reviewRating ? parseInt(reviewRating.value) || 5 : 5;
      var reviewSubmit = document.getElementById('reviewSubmit');

      if (name.length < 2) { alert('Введите имя'); return; }
      if (text.length < 5) { alert('Напишите отзыв (минимум 5 символов)'); return; }

      if (reviewSubmit) {
        reviewSubmit.disabled = true;
        reviewSubmit.textContent = 'Отправка...';
      }

      var stars = '';
      for (var i = 0; i < rating; i++) stars += '★';
      for (var j = rating; j < 5; j++) stars += '☆';
      var messageText = '📝 НОВЫЙ ОТЗЫВ С САЙТА\n\n👤 Имя: ' + name + '\n⭐ Оценка: ' + stars + ' (' + rating + '/5)\n💬 Текст: ' + text + '\n🕐 ' + new Date().toLocaleString('ru-RU');

      try {
        // Отправляем текст
        var response = await fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TG_CHAT_ID, text: messageText })
        });

        if (response.ok) {
          // Отправляем фото (если есть)
          for (var k = 0; k < selectedPhotos.length; k++) {
            var formData = new FormData();
            formData.append('chat_id', TG_CHAT_ID);
            formData.append('photo', selectedPhotos[k]);
            formData.append('caption', 'Фото к отзыву от ' + name);
            await fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendPhoto', { method: 'POST', body: formData });
          }

          // Показываем окно успеха
          document.getElementById('reviewFormView').classList.add('hide');
          document.getElementById('reviewSuccess').classList.add('show');
          
          reviewFormEl.reset();
          selectedPhotos = [];
          if (filePreview) filePreview.innerHTML = '';
          if (fileUploadInfo) fileUploadInfo.textContent = 'Не более 3 фото, до 5 МБ';
          if (reviewRating) reviewRating.value = 5;
          for (var m = 0; m < starButtons.length; m++) starButtons[m].classList.add('active');

          // Возвращаем кнопку в исходное состояние через 3 секунды
          setTimeout(function() {
            if (reviewSubmit) {
              reviewSubmit.disabled = false;
              reviewSubmit.textContent = 'Отправить отзыв';
            }
          }, 3000);

        } else {
          alert('Ошибка Telegram. Проверьте токен.');
          if (reviewSubmit) {
            reviewSubmit.disabled = false;
            reviewSubmit.textContent = 'Отправить отзыв';
          }
        }
      } catch (err) {
        alert('Ошибка сети. Попробуйте позже.');
        if (reviewSubmit) {
          reviewSubmit.disabled = false;
          reviewSubmit.textContent = 'Отправить отзыв';
        }
      }
    });
  }
});

// --- ГЛОБАЛЬНЫЕ ФУНКЦИИ ДЛЯ МОДАЛОК (вызываются из HTML через onclick) ---
function openModal() {
  var el = document.getElementById('modalOverlay');
  if (el) { el.classList.add('active'); document.body.classList.add('modal-open'); }
}
function closeModal() {
  var el = document.getElementById('modalOverlay');
  if (el) { el.classList.remove('active'); document.body.classList.remove('modal-open'); }
}
function openReviewModal() {
  var el = document.getElementById('reviewOverlay');
  if (el) { el.classList.add('active'); document.body.classList.add('modal-open'); }
}
function closeReviewModal() {
  var el = document.getElementById('reviewOverlay');
  if (el) { el.classList.remove('active'); document.body.classList.remove('modal-open'); }
}

// Закрытие модалки отзыва по крестику
document.addEventListener('DOMContentLoaded', function() {
  var closeBtn = document.getElementById('closeReviewBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeReviewModal);
  }
  
  // Принудительно вешаем отправку формы отзыва, если она не привязалась
  var form = document.getElementById('reviewFormEl');
  if (form && !form.dataset.bound) {
    // Если форма не обрабатывается (на всякий случай)
  }
});