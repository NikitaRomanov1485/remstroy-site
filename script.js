// ============ МАСКА ТЕЛЕФОНА ============
function initPhoneMask(input) {
  const PREFIX = '+375 ';
  const PREFIX_LEN = PREFIX.length;
  input.addEventListener('focus', function() {
    if (!this.value || this.value.length < PREFIX_LEN) { this.value = PREFIX; }
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

// ============ ОТПРАВКА В TELEGRAM ============
// Ваш токен и ID (восстановил ваши данные)
const TG_TOKEN = '8979084313:AAH5LtdHYApK1mO-VWrUQhkbAtniUHkED_Y'; 
const TG_CHAT_ID = '7310945290';

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function sendToTelegram(name, phone, task, type) {
  const title = type === 'Отзыв' ? 'Отзыв с сайта' : 'Новая заявка с сайта';
  const icon = type === 'Отзыв' ? '📝' : '🔔';
  
  const text = icon + ' <b>' + title + '</b>\n\n' +
    '👤 <b>Имя:</b> ' + escapeHtml(name) + '\n' +
    '📞 <b>Телефон:</b> ' + escapeHtml(phone) + '\n' +
    '📝 <b>Сообщение:</b> ' + escapeHtml(task || 'не указано') + '\n\n' +
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
    console.error('Ошибка TG:', err);
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

  const ok = await sendToTelegram(name, phone, task, 'Заявка');
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
const overlay = document.getElementById('modalOverlay');
const formView = document.getElementById('modalForm');
const successView = document.getElementById('modalSuccess');

function openModal() {
  if(overlay) {
    overlay.classList.add('active');
    document.body.classList.add('modal-open');
    formView.classList.remove('hide');
    successView.classList.remove('show');
  }
}

function closeModal() {
  if(overlay) {
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

  const ok = await sendToTelegram(name, phone, task, 'Заявка');
  if (ok) {
    formView.classList.add('hide');
    successView.classList.add('show');
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
  if (e.key === 'Escape' && overlay && overlay.classList.contains('active')) closeModal();
});

// ============ ФОРМА ОТЗЫВОВ (ЗВЕЗДЫ) ============
(function initReviewForm() {
  const reviewModal = document.getElementById('reviewModal');
  const openBtn = document.getElementById('openReviewBtn');
  const closeBtn = document.getElementById('closeReviewBtn');
  const form = document.getElementById('reviewForm');
  const formWrap = document.getElementById('reviewFormWrap');
  const success = document.getElementById('reviewSuccess');
  if (!reviewModal || !openBtn) return;

  const ratingField = document.getElementById('reviewRatingField');
  const stars = Array.from(document.querySelectorAll('#ratingStars .star'));
  const hint = document.getElementById('ratingHint');
  const hints = ['', 'Очень плохо', 'Плохо', 'Нормально', 'Хорошо', 'Отлично!'];
  let rating = 0;

  const paint = (n, hoverMode) => {
    stars.forEach(s => {
      const v = Number(s.dataset.value);
      const lit = hoverMode ? v <= n : v <= rating;
      s.classList.toggle('active', lit);
      if (v === rating) s.setAttribute('aria-checked', 'true');
      else s.setAttribute('aria-checked', 'false');
    });
  };
  const setHint = (n) => { hint.textContent = n ? hints[n] : ''; };

  stars.forEach(star => {
    const v = Number(star.dataset.value);
    star.addEventListener('mouseenter', () => { paint(v, true); setHint(v); });
    star.addEventListener('click', () => {
      rating = v;
      ratingField.style.borderBottom = '';
      paint(rating, false);
      setHint(rating);
    });
    star.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); star.click(); }
    });
  });

  document.getElementById('ratingStars').addEventListener('mouseleave', () => {
    paint(rating, false);
    setHint(rating);
  });

  let lastFocused = null;
  const openReviewModal = () => {
    lastFocused = document.activeElement;
    reviewModal.classList.add('active');
    document.body.classList.add('modal-open');
    setTimeout(() => document.getElementById('reviewName').focus(), 50);
  };
  const closeReviewModal = () => {
    reviewModal.classList.remove('active');
    document.body.classList.remove('modal-open');
    if (lastFocused) lastFocused.focus();
    setTimeout(() => {
      form.reset();
      rating = 0;
      paint(0, false);
      setHint(0);
      ratingField.style.borderBottom = '';
      formWrap.classList.remove('hide');
      success.classList.remove('show');
    }, 300);
  };

  openBtn.addEventListener('click', openReviewModal);
  closeBtn.addEventListener('click', closeReviewModal);
  reviewModal.addEventListener('click', (e) => { if (e.target === reviewModal) closeReviewModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && reviewModal.classList.contains('active')) closeReviewModal();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let ok = true;

    const name = document.getElementById('reviewName');
    const text = document.getElementById('reviewText');
    const phoneInput = document.getElementById('reviewPhone');

    const mark = (el, valid) => {
      el.style.borderBottomColor = valid ? '' : 'var(--accent)';
      if (!valid) ok = false;
    };

    mark(name, name.value.trim().length >= 2);
    mark(text, text.value.trim().length >= 10);

    if (rating === 0) {
      ratingField.style.borderBottom = '1px solid var(--accent)';
      hint.textContent = 'Поставьте оценку';
      ok = false;
    } else {
      ratingField.style.borderBottom = '';
    }

    if (!ok) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';

    // Собираем текст для Telegram с учетом рейтинга
    const reviewText = text.value.trim();
    const reviewPhone = phoneInput.value.trim();
    const starsStr = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    const fullText = `Оценка: ${starsStr} (${rating}/5)\n\nТекст: ${reviewText}`;

    const res = await sendToTelegram(name.value.trim(), reviewPhone, fullText, 'Отзыв');

    if (res) {
      formWrap.classList.add('hide');
      success.classList.add('show');
    } else {
      alert('Не удалось отправить отзыв. Попробуйте позже.');
    }
    
    submitBtn.disabled = false;
    submitBtn.textContent = 'Отправить';
  });

  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => { el.style.borderBottomColor = ''; });
  });
})();