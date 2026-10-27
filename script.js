      // Отправляем данные как обычную форму (обходим блокировку 405)
      const formData = new URLSearchParams();
      formData.append('name', data.name);
      formData.append('phone', data.phone || '');
      formData.append('rating', data.rating);
      formData.append('text', data.text);
      formData.append('page', data.page);

      fetch('/api/review.php', {
        method: 'POST',
        // ВАЖНО: не указываем Content-Type: application/json, 
        // браузер сам поставит правильный для формы
        body: formData
      })
        .then(r => {
            if (!r.ok) throw new Error('Ошибка сервера: ' + r.status);
            return r.json();
        })
        .then(() => {
          formWrap.classList.add('hide');
          success.classList.add('show');
        })
        .catch((err) => {
          console.error('Ошибка:', err);
          alert('Не удалось отправить отзыв: ' + err.message);
        });