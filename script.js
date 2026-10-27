// ============ ПРОКРУТКА НАВЕРХ ============
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============ МАСКА ТЕЛЕФОНА ============
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
    if (digits.startsWith('375')) {
      digits = digits.slice(3);
    }
    digits = digits.slice(0, 9);

    var formatted = PREFIX;
    if (digits.length > 0) formatted += digits.slice(0, 2);
    if (digits.length > 2) formatted += ' ' + digits.slice(2, 5);
    if (digits.length > 5) formatted += '-' + digits.slice(5, 7);
    if (digits.length > 7) formatted += '-' + digits.slice(7, 9);

    this.value = formatted;
  });

  input.addEventListener('keydown', function(e) {
    if ((e.key === 'Backspace' || e.key === 'Delete') &&
        this.selectionStart <= PREFIX_LEN &&
        this.selectionEnd <= PREFIX_LEN) {
      e.preventDefault();
    }
  });
}

var telInputs = document.querySelectorAll('input[type="tel"]');
for (var i = 0; i < telInputs.length; i++) {
  initPhoneMask(telInputs[i]);
}

// ============ АНИМАЦИЯ ПОЯВЛЕНИЯ ============
var revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(function(el) {
    observer.observe(el);
  });

  setTimeout(function() {
    revealElements.forEach(function(el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && !el.classList.contains('visible')) {
        el.classList.add('visible');
      }
    });
  }, 1200);
} else {
  revealElements.forEach(function(el) {
    el.classList.add('visible');
  });
}

// ============ ПЛАВАЮЩИЕ КНОПКИ ============
var floatButtons = document.getElementById('floatButtons');
var upBtn = document.getElementById('upBtn');

function handleScroll() {
  var scrolled = window.scrollY;

  if (floatButtons) {
    if (scrolled > 300) {
      floatButtons.classList.add('show');
    } else {
      floatButtons.classList.remove('show');
    }
  }

  if (upBtn) {
    if (scrolled > 600) {
      upBtn.classList.add('show');
    } else {
      upBtn.classList.remove('show');
    }
  }
}

window.addEventListener('scroll', handleScroll, { passive: true });
if (floatButtons) handleScroll();

// ============ ОТПРАВКА В TELEGRAM ============
var TG_TOKEN = '8979084313:AAH5LtdHYApK1mO-VWrUQhkbAtniUHkED_Y';
var TG_CHAT_ID = '7310945290';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function sendToTelegram(name, phone, task) {
  var text =
    '🔔 <b>Новая заявка с сайта</b>\n\n' +
    '👤 <b>Имя:</b> ' + escapeHtml(name) + '\n' +
    '📞 <b>Телефон:</b> ' + escapeHtml(phone) + '\n' +
    '📝 <b>Задача:</b> ' + escapeHtml(task || 'не указана') + '\n\n' +
    '🕐 ' + new Date().toLocaleString('ru-RU');

  var url = 'https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage';

  var response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TG_CHAT_ID,
      text: text,
      parse_mode: 'HTML'
    })
  });

  return response.ok;
}

// ============ ОСНОВНАЯ ФОРМА ============
async function submitMainForm(e) {
  e.preventDefault();
  var form = e.target;
  var btn = document.getElementById('mainSubmit');
  var name = form.name.value.trim();
  var phone = form.tel.value.trim();
  var task = form.task.value.trim();

  if (phone.replace(/\D/g, '').length < 12) {
    alert('Пожалуйста, введите полный номер телефона');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Отправка...';

  try {
    var ok = await sendToTelegram(name, phone, task);
    if (ok) {
      btn.textContent = '✓ Отправлено';
      form.reset();
      form.tel.value = '+375 ';
      setTimeout(function() {
        btn.disabled = false;
        btn.textContent = 'Отправить заявку';
      }, 3000);
    } else {
      throw new Error('Ошибка отправки');
    }
  } catch (err) {
    btn.textContent = 'Ошибка. Попробуйте ещё раз';
    btn.disabled = false;
    setTimeout(function() {
      btn.textContent = 'Отправить заявку';
    }, 3000);
  }
}

// ============ МОДАЛКА ЗАЯВКИ ============
var overlay = document.getElementById('modalOverlay');
var formView = document.getElementById('modalForm');
var successView = document.getElementById('modalSuccess');

function openModal() {
  if (!overlay) return;
  overlay.classList.add('active');
  document.body.classList.add('modal-open');
  if (formView) formView.classList.remove('hide');
  if (successView) successView.classList.remove('show');
}

function closeModal() {
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.classList.remove('modal-open');
}

async function submitModal(e) {
  e.preventDefault();
  var form = e.target;
  var btn = document.getElementById('modalSubmit');
  var name = form.name.value.trim();
  var phone = form.tel.value.trim();
  var task = form.task.value.trim();

  if (phone.replace(/\D/g, '').length < 12) {
    alert('Пожалуйста, введите полный номер телефона');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Отправка...';

  try {
    var ok = await sendToTelegram(name, phone, task);
    if (ok) {
      if (formView) formView.classList.add('hide');
      if (successView) successView.classList.add('show');
      form.reset();
      form.tel.value = '+375 ';
      setTimeout(function() {
        closeModal();
        btn.disabled = false;
        btn.textContent = 'Отправить заявку';
      }, 3000);
    } else {
      throw new Error('Ошибка');
    }
  } catch (err) {
    btn.textContent = 'Ошибка. Попробуйте ещё раз';
    btn.disabled = false;
    setTimeout(function() {
      btn.textContent = 'Отправить заявку';
    }, 3000);
  }
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && overlay && overlay.classList.contains('active')) closeModal();
});

// ============ МОДАЛКА ОТЗЫВА ============
var reviewOverlay = document.getElementById('reviewOverlay');
var reviewFormView = document.getElementById('reviewFormView');
var reviewSuccess = document.getElementById('reviewSuccess');
var openReviewBtn = document.getElementById('openReviewBtn');
var reviewFormEl = document.getElementById('reviewFormEl');
var reviewSubmit = document.getElementById('reviewSubmit');
var reviewPhotos = document.getElementById('review-photos');
var filePreview = document.getElementById('filePreview');
var fileUploadInfo = document.getElementById('fileUploadInfo');
var starButtons = document.querySelectorAll('.star');
var reviewRating = document.getElementById('review-rating');

var selectedPhotos = [];

function openReviewModal() {
  if (!reviewOverlay) return;
  reviewOverlay.classList.add('active');
  document.body.classList.add('modal-open');
  if (reviewFormView) reviewFormView.classList.remove('hide');
  if (reviewSuccess) reviewSuccess.classList.remove('show');
}

function closeReviewModal() {
  if (!reviewOverlay) return;
  reviewOverlay.classList.remove('active');
  document.body.classList.remove('modal-open');
}

if (openReviewBtn) {
  openReviewBtn.addEventListener('click', openReviewModal);
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && reviewOverlay && reviewOverlay.classList.contains('active')) {
    closeReviewModal();
  }
});

// Логика звезд
if (starButtons.length > 0) {
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
}

// Логика фото
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
    if (selectedPhotos.length > 0) {
      fileUploadInfo.textContent = 'Выбрано фото: ' + selectedPhotos.length + ' из 3';
    } else {
      fileUploadInfo.textContent = 'Не более 3 фото, до 5 МБ каждое';
    }
  }
}

if (reviewPhotos) {
  reviewPhotos.addEventListener('change', function() {
    var files = this.files;
    for (var i = 0; i < files.length; i++) {
      if (selectedPhotos.length >= 3) {
        alert('Можно прикрепить не более 3 фото');
        break;
      }
      if (files[i].size > 5 * 1024 * 1024) {
        alert('Файл ' + files[i].name + ' больше 5 МБ');
        continue;
      }
      selectedPhotos.push(files[i]);
    }
    this.value = '';
    renderPhotoPreviews();
  });
}

// Отправка отзыва
async function sendReviewToTelegram(name, rating, text, photos) {
  var stars = '';
  for (var i = 0; i < rating; i++) stars += '★';
  for (var j = rating; j < 5; j++) stars += '☆';

  var messageText =
    '📝 НОВЫЙ ОТЗЫВ С САЙТА\n\n' +
    '👤 Имя: ' + name + '\n' +
    '⭐ Оценка: ' + stars + ' (' + rating + '/5)\n' +
    '💬 Текст: ' + text + '\n\n' +
    '🖼 Фото: ' + (photos.length > 0 ? photos.length + ' шт.' : 'без фото') + '\n' +
    '🕐 ' + new Date().toLocaleString('ru-RU');

  var textUrl = 'https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage';

  try {
    var textResponse = await fetch(textUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TG_CHAT_ID,
        text: messageText
      })
    });

    if (!textResponse.ok) return false;

    for (var k = 0; k < photos.length; k++) {
      var formData = new FormData();
      formData.append('chat_id', TG_CHAT_ID);
      formData.append('photo', photos[k]);
      formData.append('caption', '📷 Фото к отзыву от ' + name + ' (' + (k + 1) + ' из ' + photos.length + ')');

      var photoUrl = 'https://api.telegram.org/bot' + TG_TOKEN + '/sendPhoto';
      await fetch(photoUrl, { method: 'POST', body: formData });
    }

    return true;
  } catch (err) {
    console.error('Review send error:', err);
    return false;
  }
}

async function submitReview(e) {
  e.preventDefault();

  var nameEl = document.getElementById('review-name');
  var textEl = document.getElementById('review-text');
  
  if (!nameEl || !textEl) return;

  var name = nameEl.value.trim();
  var rating = reviewRating ? parseInt(reviewRating.value) || 5 : 5;
  var text = textEl.value.trim();

  if (name.length < 2) {
    alert('Пожалуйста, введите имя');
    return;
  }
  if (text.length < 5) {
    alert('Пожалуйста, напишите отзыв (минимум 5 символов)');
    return;
  }

  if (reviewSubmit) {
    reviewSubmit.disabled = true;
    reviewSubmit.textContent = 'Отправка...';
  }

  var ok = await sendReviewToTelegram(name, rating, text, selectedPhotos);

  if (ok) {
    if (reviewFormView) reviewFormView.classList.add('hide');
    if (reviewSuccess) reviewSuccess.classList.add('show');
    if (reviewFormEl) reviewFormEl.reset();
    
    selectedPhotos = [];
    if (filePreview) filePreview.innerHTML = '';
    if (fileUploadInfo) fileUploadInfo.textContent = 'Не более 3 фото, до 5 МБ каждое';
    if (reviewRating) reviewRating.value = 5;
    
    for (var m = 0; m < starButtons.length; m++) {
      starButtons[m].classList.add('active');
    }

    setTimeout(function() {
      closeReviewModal();
      if (reviewSubmit) {
        reviewSubmit.disabled = false;
        reviewSubmit.textContent = 'Отправить отзыв';
      }
    }, 3500);
  } else {
    if (reviewSubmit) {
      reviewSubmit.textContent = 'Ошибка. Попробуйте ещё раз';
      reviewSubmit.disabled = false;
      setTimeout(function() {
        reviewSubmit.textContent = 'Отправить отзыв';
      }, 3000);
    }
  }
}