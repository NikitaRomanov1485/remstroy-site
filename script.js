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

// ============ ОТПРАВКА НА СЕРВЕР (PHP) ============
async function sendToServer(formDataObj) {
  try {
    const formData = new URLSearchParams();
    for (const key in formDataObj) {
      formData.append(key, formDataObj[key]);
    }
    
    const response = await fetch('api/review.php', {
      method: 'POST',
      body: formData
    });
    return response.ok;
  } catch (err) {
    console.error('Ошибка отправки:', err);
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

  const ok = await sendToServer({ 
    type: 'Заявка (основная форма)',
    name: name, 
    phone: phone, 
    text: task 
  });

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

  const ok = await sendToServer({ 
    type: 'Заявка (модальное окно)',
    name: name, 
    phone: phone, 
    text: task 
  });

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

// ============ ФОРМА ОТЗЫВОВ ============
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

    const res = await sendToServer({
      type: 'Отзыв',
      name: name.value.trim(),
      phone: document.getElementById('reviewPhone').value.trim(),
      rating: rating,
      text: text.value.trim(),
      page: location.href
    });

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