// ============ ОТПРАВКА В TELEGRAM ============
const TG_TOKEN = '8979084313:AAEWRwO8uGjcO1lo4-FkWI0maxAuKYt-VEE';
const TG_CHAT_ID = '7310945290';

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Универсальная функция для отправки заявок
async function sendToTelegram(name, phone, task) {
  const text = '🔔 <b>Новая заявка с сайта</b>\n\n' +
    '👤 <b>Имя:</b> ' + escapeHtml(name) + '\n' +
    '📞 <b>Телефон:</b> ' + escapeHtml(phone) + '\n' +
    '📝 <b>Задача:</b> ' + escapeHtml(task || 'не указана') + '\n\n' +
    '🕐 ' + new Date().toLocaleString('ru-RU');
    
  const url = 'https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT_ID, text: text, parse_mode: 'HTML' })
    });
    return response.ok;
  } catch (err) {
    console.error('Ошибка Telegram:', err);
    return false;
  }
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

  const ok = await sendToTelegram(name, phone, task);

  if (ok) {
    btn.textContent = '✓ Отправлено';
    form.reset();
    form.tel.value = '+375 ';
    setTimeout(() => { btn.disabled = false; btn.textContent = 'Отправить заявку'; }, 3000);
  } else {
    btn.textContent = 'Ошибка. Попробуйте ещё раз';
    btn.disabled = false;
    setTimeout(() => { btn.textContent = 'Отправить заявку'; }, 3000);
  }
}

// ============ МОДАЛЬНОЕ ОКНО ЗАЯВКИ ============
function openModal() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.classList.add('active');
    document.body.classList.add('modal-open');
    const form = document.getElementById('modalForm');
    const success = document.getElementById('modalSuccess');
    if (form) form.classList.remove('hide');
    if (success) success.classList.remove('show');
  }
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
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

  const ok = await sendToTelegram(name, phone, task);

  if (ok) {
    document.getElementById('modalForm').classList.add('hide');
    document.getElementById('modalSuccess').classList.add('show');
    form.reset();
    form.tel.value = '+375 ';
    setTimeout(() => {
      closeModal();
      btn.disabled = false;
      btn.textContent = 'Отправить заявку';
    }, 3000);
  } else {
    btn.textContent = 'Ошибка. Попробуйте ещё раз';
    btn.disabled = false;
    setTimeout(() => { btn.textContent = 'Отправить заявку'; }, 3000);
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

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
    if ((e.key === 'Backspace' || e.key === 'Delete') && this.selectionStart <= PREFIX_LEN && this.selectionEnd <= PREFIX_LEN) {
      e.preventDefault();
    }
  });
}

document.querySelectorAll('input[type="tel"]').forEach(initPhoneMask);

// ============ ПЛАВАЮЩИЕ КНОПКИ ============
window.addEventListener('scroll', function() {
  const floatButtons = document.getElementById('floatButtons');
  const upBtn = document.getElementById('scrollTopBtn');
  const scrolled = window.scrollY;
  
  if (floatButtons) {
    if (scrolled > 300) floatButtons.classList.add('show');
    else floatButtons.classList.remove('show');
  }
  if (upBtn) {
    if (scrolled > 600) upBtn.classList.add('show');
    else upBtn.classList.remove('show');
  }
});

// ============ ЛОГИКА ОТЗЫВОВ (звезды, фото, отправка) ============
document.addEventListener('DOMContentLoaded', function() {
  const reviewOverlay = document.getElementById('reviewOverlay');
  const openReviewBtn = document.getElementById('openReviewBtn');
  const closeReviewBtn = document.getElementById('closeReviewBtn');
  const reviewFormEl = document.getElementById('reviewFormEl');
  const reviewFormView = document.getElementById('reviewFormView');
  const reviewSuccess = document.getElementById('reviewSuccess');
  const starButtons = document.querySelectorAll('.star');
  const reviewRating = document.getElementById('review-rating');
  
  if (!reviewOverlay || !openReviewBtn) return;

  let selectedPhotos = [];
  const reviewPhotos = document.getElementById('review-photos');
  const filePreview = document.getElementById('filePreview');
  const fileUploadInfo = document.getElementById('fileUploadInfo');

  // Открытие/закрытие модалки отзыва
  window.openReviewModal = function() {
    reviewOverlay.classList.add('active');
    document.body.classList.add('modal-open');
    if (reviewFormView) reviewFormView.classList.remove('hide');
    if (reviewSuccess) reviewSuccess.classList.remove('show');
  };

  window.closeReviewModal = function() {
    reviewOverlay.classList.remove('active');
    document.body.classList.remove('modal-open');
  };

  openReviewBtn.addEventListener('click', window.openReviewModal);
  if (closeReviewBtn) closeReviewBtn.addEventListener('click', window.closeReviewModal);
  
  reviewOverlay.addEventListener('click', (e) => {
    if (e.target === reviewOverlay) window.closeReviewModal();
  });

  // Логика звезд
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

  // Логика фото
  if (reviewPhotos) {
    reviewPhotos.addEventListener('change', function() {
      const files = this.files;
      for (let i = 0; i < files.length; i++) {
        if (selectedPhotos.length >= 3) { alert('Максимум 3 фото'); break; }
        if (files[i].size > 5 * 1024 * 1024) { alert('Файл больше 5 МБ'); continue; }
        selectedPhotos.push(files[i]);
      }
      this.value = '';
      
      if (filePreview) {
        filePreview.innerHTML = '';
        for (let k = 0; k < selectedPhotos.length; k++) {
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
              reviewPhotos.dispatchEvent(new Event('change'));
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

  // Отправка отзыва
  if (reviewFormEl) {
    reviewFormEl.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const name = document.getElementById('review-name').value.trim();
      const text = document.getElementById('review-text').value.trim();
      const rating = reviewRating ? parseInt(reviewRating.value) || 5 : 5;
      const reviewSubmit = document.getElementById('reviewSubmit');

      if (name.length < 2) { alert('Введите имя'); return; }
      if (text.length < 5) { alert('Напишите отзыв (минимум 5 символов)'); return; }

      if (reviewSubmit) {
        reviewSubmit.disabled = true;
        reviewSubmit.textContent = 'Отправка...';
      }

      let stars = '';
      for (let i = 0; i < rating; i++) stars += '★';
      for (let j = rating; j < 5; j++) stars += '☆';
      
      const messageText = '📝 <b>Новый отзыв с сайта</b>\n\n' +
        '👤 <b>Имя:</b> ' + escapeHtml(name) + '\n' +
        '⭐ <b>Оценка:</b> ' + stars + ' (' + rating + '/5)\n' +
        '💬 <b>Текст:</b> ' + escapeHtml(text) + '\n\n' +
        '🕐 ' + new Date().toLocaleString('ru-RU');

      try {
        const response = await fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TG_CHAT_ID, text: messageText, parse_mode: 'HTML' })
        });

        if (response.ok) {
          // Отправка фото (если есть)
          for (let k = 0; k < selectedPhotos.length; k++) {
            const formData = new FormData();
            formData.append('chat_id', TG_CHAT_ID);
            formData.append('photo', selectedPhotos[k]);
            formData.append('caption', 'Фото к отзыву от ' + name);
            await fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendPhoto', { method: 'POST', body: formData });
          }

          if (reviewFormView) reviewFormView.classList.add('hide');
          if (reviewSuccess) reviewSuccess.classList.add('show');
          
          reviewFormEl.reset();
          selectedPhotos = [];
          if (filePreview) filePreview.innerHTML = '';
          if (fileUploadInfo) fileUploadInfo.textContent = 'Не более 3 фото, до 5 МБ';
          if (reviewRating) reviewRating.value = 5;
          for (let m = 0; m < starButtons.length; m++) starButtons[m].classList.add('active');

          setTimeout(() => {
            window.closeReviewModal();
            if (reviewSubmit) {
              reviewSubmit.disabled = false;
              reviewSubmit.textContent = 'Отправить';
            }
          }, 3500);
        } else {
          alert('Ошибка отправки. Попробуйте позже.');
          if (reviewSubmit) {
            reviewSubmit.disabled = false;
            reviewSubmit.textContent = 'Отправить';
          }
        }
      } catch (err) {
        alert('Ошибка сети. Попробуйте позже.');
        if (reviewSubmit) {
          reviewSubmit.disabled = false;
          reviewSubmit.textContent = 'Отправить';
        }
      }
    });
  }
});