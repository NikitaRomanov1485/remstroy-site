// ============ ПРОКРУТКА НАВЕРХ ============
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============ МАСКА ТЕЛЕФОНА ============
function initPhoneMask(input) {
  const PREFIX = '+375 ';
  const PREFIX_LEN = PREFIX.length;

  input.addEventListener('focus', function() {
    if (!this.value || this.value.length < PREFIX_LEN) {
      this.value = PREFIX;
    }
  });

  input.addEventListener('input', function() {
    let digits = this.value.replace(/\D/g, '');
    if (digits.startsWith('375')) digits = digits.slice(3);
    digits = digits.slice(0, 9);

    let formatted = PREFIX;
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

document.querySelectorAll('input[type="tel"]').forEach(initPhoneMask);

// ============ АНИМАЦИЯ ПОЯВЛЕНИЯ (REVEAL) ============
const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));

  setTimeout(() => {
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && !el.classList.contains('visible')) {
        el.classList.add('visible');
      }
    });
  }, 1200);
} else {
  revealElements.forEach(el => el.classList.add('visible'));
}

// ============ ПЛАВАЮЩИЕ КНОПКИ ============
const floatButtons = document.getElementById('floatButtons');
const upBtn = document.getElementById('upBtn');

function handleScroll() {
  const scrolled = window.scrollY;

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
const TG_TOKEN = '8979084313:AAH5LtdHYApK1mO-VWrUQhkbAtniUHkED_Y';
const TG_CHAT_ID = '7310945290';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function sendToTelegram(name, phone, task) {
  const text =
    '🔔 <b>Новая заявка с сайта</b>\n\n' +
    '👤 <b>Имя:</b> ' + escapeHtml(name) + '\n' +
    '📞 <b>Телефон:</b> ' + escapeHtml(phone) + '\n' +
    '📝 <b>Задача:</b> ' + escapeHtml(task || 'не указана') + '\n\n' +
    '🕐 ' + new Date().toLocaleString('ru-RU');

  const url = 'https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage';

  const response = await fetch(url, {
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
  const form = e.target;
  const btn = document.getElementById('mainSubmit');
  const name = form.name.value.trim();
  const phone = form.tel.value.trim();
  const task = form.task.value.trim();

  if (phone.replace(/\D/g, '').length < 12) {
    alert('Пожалуйста, введите полный номер телефона');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Отправка...';

  try {
    const ok = await sendToTelegram(name, phone, task);
    if (ok) {
      btn.textContent = '✓ Отправлено';
      form.reset();
      form.tel.value = '+375 ';
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = 'Отправить заявку';
      }, 3000);
    } else {
      throw new Error('Ошибка отправки');
    }
  } catch (err) {
    btn.textContent = 'Ошибка. Попробуйте ещё раз';
    btn.disabled = false;
    setTimeout(() => {
      btn.textContent = 'Отправить заявку';
    }, 3000);
  }
}

// ============ МОДАЛКА ЗАЯВКИ ============
const overlay = document.getElementById('modalOverlay');
const formView = document.getElementById('modalForm');
const successView = document.getElementById('modalSuccess');

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
  const form = e.target;
  const btn = document.getElementById('modalSubmit');
  const name = form.name.value.trim();
  const phone = form.tel.value.trim();
  const task = form.task.value.trim();

  if (phone.replace(/\D/g, '').length < 12) {
    alert('Пожалуйста, введите полный номер телефона');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Отправка...';

  try {
    const ok = await sendToTelegram(name, phone, task);
    if (ok) {
      if (formView) formView.classList.add('hide');
      if (successView) successView.classList.add('show');
      form.reset();
      form.tel.value = '+375 ';
      setTimeout(() => {
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
    setTimeout(() => {
      btn.textContent = 'Отправить заявку';
    }, 3000);
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlay && overlay.classList.contains('active')) closeModal();
});

// ============ МОДАЛКА ОТЗЫВА ============
const reviewOverlay = document.getElementById('reviewOverlay');
const reviewFormView = document.getElementById('reviewFormView');
const reviewSuccess = document.getElementById('reviewSuccess');
const openReviewBtn = document.getElementById('openReviewBtn');
const reviewFormEl = document.getElementById('reviewFormEl');
const reviewSubmit = document.getElementById('reviewSubmit');
const reviewPhotos = document.getElementById('review-photos');
const filePreview = document.getElementById('filePreview');
const fileUploadInfo = document.getElementById('fileUploadInfo');
const starButtons = document.querySelectorAll('.star');
const reviewRating = document.getElementById('review-rating');

let selectedPhotos = [];

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

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && reviewOverlay && reviewOverlay.classList.contains('active')) {
    closeReviewModal();
  }
});

// Логика звезд
if (starButtons.length > 0) {
  for (let s = 0; s < starButtons.length; s++) {
    starButtons[s].addEventListener('click', function() {
      const value = parseInt(this.getAttribute('data-value'));
      if (reviewRating) reviewRating.value = value;
      for (let i = 0; i < starButtons.length; i++) {
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
  for (let i = 0; i < selectedPhotos.length; i++) {
    (function(index) {
      const file = selectedPhotos[index];
      const item = document.createElement('div');
      item.className = 'file-preview-item';

      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      item.appendChild(img);

      const removeBtn = document.createElement('button');
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
    const files = this.files;
    for (let i = 0; i < files.length; i++) {
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
  let stars = '';
  for (let i = 0; i < rating; i++) stars += '★';
  for (let j = rating; j < 5; j++) stars += '☆';

  const messageText =
    '📝 НОВЫЙ ОТЗЫВ С САЙТА\n\n' +
    '👤 Имя: ' + name + '\n' +
    '⭐ Оценка: ' + stars + ' (' + rating + '/5)\n' +
    '💬 Текст: ' + text + '\n\n' +
    '🖼 Фото: ' + (photos.length > 0 ? photos.length + ' шт.' : 'без фото') + '\n' +
    '🕐 ' + new Date().toLocaleString('ru-RU');

  const textUrl = 'https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage';

  try {
    const textResponse = await fetch(textUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TG_CHAT_ID,
        text: messageText
      })
    });

    if (!textResponse.ok) return false;

    for (let k = 0; k < photos.length; k++) {
      const formData = new FormData();
      formData.append('chat_id', TG_CHAT_ID);
      formData.append('photo', photos[k]);
      formData.append('caption', '📷 Фото к отзыву от ' + name + ' (' + (k + 1) + ' из ' + photos.length + ')');

      const photoUrl = 'https://api.telegram.org/bot' + TG_TOKEN + '/sendPhoto';
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

  const nameEl = document.getElementById('review-name');
  const textEl = document.getElementById('review-text');
  
  if (!nameEl || !textEl) return;

  const name = nameEl.value.trim();
  const rating = reviewRating ? parseInt(reviewRating.value) || 5 : 5;
  const text = textEl.value.trim();

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

  const ok = await sendReviewToTelegram(name, rating, text, selectedPhotos);

  if (ok) {
    if (reviewFormView) reviewFormView.classList.add('hide');
    if (reviewSuccess) reviewSuccess.classList.add('show');
    if (reviewFormEl) reviewFormEl.reset();
    
    selectedPhotos = [];
    if (filePreview) filePreview.innerHTML = '';
    if (fileUploadInfo) fileUploadInfo.textContent = 'Не более 3 фото, до 5 МБ каждое';
    if (reviewRating) reviewRating.value = 5;
    
    for (let m = 0; m < starButtons.length; m++) {
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