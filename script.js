// 1. Прокрутка наверх и плавающие кнопки
document.addEventListener('DOMContentLoaded', function() {
  var floatButtons = document.getElementById('floatButtons');
  var upBtn = document.getElementById('upBtn');

  // Нажатие на кнопку "Наверх"
  if (upBtn) {
    upBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Появление кнопок при прокрутке
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
  // Проверка при загрузке
  window.dispatchEvent(new Event('scroll'));
});

// 2. Маска телефона +375 XX XXX XX XX
function initPhoneMask(input) {
  var PREFIX = '+375 ';
  var PREFIX_LEN = PREFIX.length;

  input.addEventListener('focus', function() {
    if (!this.value || this.value.length < PREFIX_LEN) {
      this.value = PREFIX;
    }
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

  input.addEventListener('keydown', function(e) {
    if ((e.key === 'Backspace' || e.key === 'Delete') && this.selectionStart <= PREFIX_LEN && this.selectionEnd <= PREFIX_LEN) {
      e.preventDefault();
    }
  });
}
// Привязываем маску ко всем полям телефона на странице
var telInputs = document.querySelectorAll('input[type="tel"]');
for (var i = 0; i < telInputs.length; i++) {
  initPhoneMask(telInputs[i]);
}

// 3. База Telegram
var TG_TOKEN = '8979084313:AAH5LtdHYApK1mO-VWrUQhkbAtniUHkED_Y';
var TG_CHAT_ID = '7310945290';

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function sendToTelegram(name, phone, task) {
  var text = '🔔 <b>Новая заявка с сайта</b>\n\n' +
    '👤 <b>Имя:</b> ' + escapeHtml(name) + '\n' +
    '📞 <b>Телефон:</b> ' + escapeHtml(phone) + '\n' +
    '📝 <b>Задача:</b> ' + escapeHtml(task || 'не указана') + '\n\n' +
    '🕐 ' + new Date().toLocaleString('ru-RU');
  var url = 'https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage';
  try {
    var response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT_ID, text: text, parse_mode: 'HTML' })
    });
    return response.ok;
  } catch (err) { return false; }
}

// 4. Основная форма
async function submitMainForm(e) {
  e.preventDefault();
  var form = e.target;
  var btn = document.getElementById('mainSubmit');
  var name = form.name.value.trim();
  var phone = form.tel.value.trim();
  var task = form.task.value.trim();
  
  if (phone.replace(/\D/g, '').length < 12) { alert('Введите полный номер'); return; }
  
  btn.disabled = true;
  btn.textContent = 'Отправка...';
  var ok = await sendToTelegram(name, phone, task);
  
  if (ok) {
    btn.textContent = '✓ Отправлено';
    form.reset(); form.tel.value = '+375 ';
    setTimeout(function() { btn.disabled = false; btn.textContent = 'Отправить заявку'; }, 3000);
  } else {
    btn.textContent = 'Ошибка';
    btn.disabled = false;
    setTimeout(function() { btn.textContent = 'Отправить заявку'; }, 3000);
  }
}

// 5. Модалка заявки
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
async function submitModal(e) {
  e.preventDefault();
  var form = e.target;
  var btn = document.getElementById('modalSubmit');
  var name = form.name.value.trim();
  var phone = form.tel.value.trim();
  var task = form.task.value.trim();
  
  if (phone.replace(/\D/g, '').length < 12) { alert('Введите полный номер'); return; }
  
  btn.disabled = true;
  btn.textContent = 'Отправка...';
  var ok = await sendToTelegram(name, phone, task);
  
  if (ok) {
    document.getElementById('modalForm').classList.add('hide');
    document.getElementById('modalSuccess').classList.add('show');
    form.reset(); form.tel.value = '+375 ';
    setTimeout(function() { closeModal(); btn.disabled = false; btn.textContent = 'Отправить заявку'; }, 3000);
  } else {
    btn.textContent = 'Ошибка';
    btn.disabled = false;
    setTimeout(function() { btn.textContent = 'Отправить заявку'; }, 3000);
  }
}

// 6. Модалка отзыва
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

// 7. Звезды, фото и отправка отзыва
document.addEventListener('DOMContentLoaded', function() {
  var reviewOverlay = document.getElementById('reviewOverlay');
  var openReviewBtn = document.getElementById('openReviewBtn');
  var reviewRating = document.getElementById('review-rating');
  var starButtons = document.querySelectorAll('.star');
  
  if (openReviewBtn) openReviewBtn.addEventListener('click', openReviewModal);

  // Логика звезд
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

  // Фото
  var selectedPhotos = [];
  var reviewPhotos = document.getElementById('review-photos');
  var filePreview = document.getElementById('filePreview');
  var fileUploadInfo = document.getElementById('fileUploadInfo');

  function renderPhotoPreviews() {
    if (!filePreview) return;
    filePreview.innerHTML = '';
    for (var i = 0; i < selectedPhotos.length; i++) {
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
          renderPhotoPreviews();
        });
        item.appendChild(removeBtn);
        filePreview.appendChild(item);
      })(i);
    }
    if (fileUploadInfo) {
      fileUploadInfo.textContent = selectedPhotos.length > 0 ? 'Выбрано: ' + selectedPhotos.length + ' из 3' : 'Не более 3 фото, до 5 МБ';
    }
  }

  if (reviewPhotos) {
    reviewPhotos.addEventListener('change', function() {
      var files = this.files;
      for (var i = 0; i < files.length; i++) {
        if (selectedPhotos.length >= 3) { alert('Максимум 3 фото'); break; }
        if (files[i].size > 5 * 1024 * 1024) { alert('Файл больше 5 МБ'); continue; }
        selectedPhotos.push(files[i]);
      }
      this.value = '';
      renderPhotoPreviews();
    });
  }

  // Отправка отзыва
  var reviewFormEl = document.getElementById('reviewFormEl');
  if (reviewFormEl) {
    reviewFormEl.addEventListener('submit', async function(e) {
      e.preventDefault();
      var nameEl = document.getElementById('review-name');
      var textEl = document.getElementById('review-text');
      if (!nameEl || !textEl) return;
      
      var name = nameEl.value.trim();
      var rating = reviewRating ? parseInt(reviewRating.value) || 5 : 5;
      var text = textEl.value.trim();
      
      if (name.length < 2) { alert('Введите имя'); return; }
      if (text.length < 5) { alert('Напишите отзыв (минимум 5 символов)'); return; }
      
      var reviewSubmit = document.getElementById('reviewSubmit');
      if (reviewSubmit) { reviewSubmit.disabled = true; reviewSubmit.textContent = 'Отправка...'; }

      var stars = '';
      for (var i = 0; i < rating; i++) stars += '★';
      for (var j = rating; j < 5; j++) stars += '☆';
      var messageText = '📝 НОВЫЙ ОТЗЫВ С САЙТА\n\n👤 Имя: ' + name + '\n⭐ Оценка: ' + stars + ' (' + rating + '/5)\n💬 Текст: ' + text + '\n🕐 ' + new Date().toLocaleString('ru-RU');
      
      var ok = false;
      try {
        var textResponse = await fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TG_CHAT_ID, text: messageText })
        });
        if (textResponse.ok) {
          ok = true;
          for (var k = 0; k < selectedPhotos.length; k++) {
            var formData = new FormData();
            formData.append('chat_id', TG_CHAT_ID);
            formData.append('photo', selectedPhotos[k]);
            formData.append('caption', 'Фото к отзыву от ' + name);
            await fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendPhoto', { method: 'POST', body: formData });
          }
        }
      } catch (err) {}

      if (ok) {
        document.getElementById('reviewFormView').classList.add('hide');
        document.getElementById('reviewSuccess').classList.add('show');
        if (reviewFormEl) reviewFormEl.reset();
        selectedPhotos = [];
        if (filePreview) filePreview.innerHTML = '';
        if (fileUploadInfo) fileUploadInfo.textContent = 'Не более 3 фото, до 5 МБ';
        if (reviewRating) reviewRating.value = 5;
        for (var m = 0; m < starButtons.length; m++) starButtons[m].classList.add('active');
        setTimeout(function() {
          closeReviewModal();
          if (reviewSubmit) { reviewSubmit.disabled = false; reviewSubmit.textContent = 'Отправить отзыв'; }
        }, 3500);
      } else {
        if (reviewSubmit) {
          reviewSubmit.textContent = 'Ошибка';
          reviewSubmit.disabled = false;
          setTimeout(function() { reviewSubmit.textContent = 'Отправить отзыв'; }, 3000);
        }
      }
    });
  }

  // Закрытие по Esc
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeModal();
      closeReviewModal();
    }
  });
});