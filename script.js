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
const TG_TOKEN = '8979084313:AAH5LtdHYApK1mO-VWrUQhkbAtniUHkED_Y';
const TG_CHAT_ID = '7310945290';

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

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
  } catch (err) { return false; }
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

// ============ МОДАЛЬНОЕ ОКНО ============
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

  const ok = await sendToTelegram(name, phone, task);
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