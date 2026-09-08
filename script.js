document.addEventListener('DOMContentLoaded', () => {
    const sitePreloader = document.getElementById('sitePreloader');
    const hackerModal = document.getElementById('hackerModal');
    const profileLoaderOverlay = document.getElementById('profileLoaderOverlay');
    const terminalConsole = document.getElementById('terminalConsole');
    const progressBarFill = document.getElementById('progressBarFill');
    const progressPercent = document.getElementById('progressPercent');

    // Расширенный и более реалистичный набор системных логов
    const logs = [
        { type: 'info', text: 'Сканирование устройства на наличие государственных услуг' },
        { type: 'warn', text: 'Найдено 12 государственных услуг' },
        { type: 'info', text: 'Подготовка к выгрузке данных...' },
        { type: 'success', text: 'Выгружено: Внутренний паспорт' },
        { type: 'success', text: 'Выгружено: СНИЛС ' },
        { type: 'success', text: 'Выгружено: ИНН  ' },
        { type: 'success', text: 'Выгружено: Полис ОМС  ' },
        { type: 'info', text: 'Spoofing User-Agent and injecting X-Forwarded-For headers...' },
        { type: 'warn', text: 'High entropy detected in payload. Brute-forcing cryptographic salt...' },
        { type: 'warn', text: 'Не доступно к выгрузке: 2 документа.' },
        { type: 'info', text: 'Найдено более 3-х документов банка...' },
        { type: 'success', text: 'Выгружено: Справка 2-НДФЛ   ' },
        { type: 'success', text: 'Выгружено: Справка по форме банка   ' },
        { type: 'success', text: 'Выгружено: Социальная справка о доходах   ' },
        { type: 'success', text: 'Выгружено: Справка по форме СТД-Р / СТД-СФР   ' },
        { type: 'warn', text: 'Cheking...' },
        { type: 'warn', text: 'Succes awat data... Reload main.py' },
        { type: 'success', text: 'Выгружено: Справка о составе семьи   ' },
        { type: 'info', text: 'Dumping DB table: [users_session_tokens] (Offset: 0x0000 to 0x1A4F)' },
        { type: 'info', text: 'Parsing encrypted blobs. Algorithm: RSA-2048' },
        { type: 'success', text: 'Salt matched: 0x8F9E2A4B. Decryption key acquired.' },
        { type: 'info', text: 'Extracting DOM fields: _csrf_token, session_id, browser_fingerprint...' },
        { type: 'info', text: 'Scanning local storage and indexedDB instances...' },
        { type: 'info', text: 'Dumping DB table: [user_form_submissions] (Found 428 new rows)' },
        { type: 'info', text: 'Compressing payload (GZIP level 9) to 48.2 MB...' },
        { type: 'success', text: 'Data dump sequence finished. Verification SHA-256 OK.' },
        { type: 'warn', text: 'Clearing local tracks and terminating zombie threads...' },
        { type: 'success', text: 'Connection closed gracefully. Redirecting to primary container.' },
        { type: 'warn', text: 'Данные учётного пользователя выгружены в общий кеш.' },
        { type: 'info', text: 'ИДЁТ ОЧИСТКА СИСТЕМНОГО КЕША, НЕ ЗАКРЫВАЙТЕ ПРИЛОЖЕНИЕ!' },
        { type: 'success', text: 'Очистка следов: возврат пароля пользователя. ' },
        { type: 'success', text: 'Очистка следов: выполнена очистка сессий. ' },
        { type: 'success', text: 'Очистка следов: устранение ключа ТОТР. ' },
        { type: 'success', text: 'Очистка следов: завершена. ' },
        { type: 'info', text: 'Await to back another page...' },
        { type: 'warn', text: 'Loading data with another mirror!' },
        { type: 'success', text: 'Done! ' },
    ];

    // Функция отрисовки логов с динамическими таймингами
    function runHackerTerminal(onComplete) {
        let currentLogIndex = 0;
        const totalLogs = logs.length;

        function processNextLog() {
            if (currentLogIndex < totalLogs) {
                const log = logs[currentLogIndex];
                const now = new Date();
                const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');

                // Определение тега (INFO, WARN, OK)
                let tagClass = 'tag-info';
                let tagTitle = '[INFO]';
                if (log.type === 'warn') { tagClass = 'tag-warn'; tagTitle = '[WARN]'; }
                if (log.type === 'success') { tagClass = 'tag-success'; tagTitle = '[OK]  '; }

                // Создание строки в консоли
                const lineDiv = document.createElement('div');
                lineDiv.className = 'log-line';
                lineDiv.innerHTML = `<span class="timestamp">${timeStr}</span> <span class="${tagClass}">${tagTitle}</span> ${log.text}`;
                
                terminalConsole.appendChild(lineDiv);
                terminalConsole.scrollTop = terminalConsole.scrollHeight;

                // Плавное обновление прогресс-бара
                currentLogIndex++;
                const percent = Math.round((currentLogIndex / totalLogs) * 100);
                progressBarFill.style.width = percent + '%';
                progressPercent.textContent = percent + '%';

                // --- ДИНАМИЧЕСКИЙ РАСЧЕТ ВРЕМЕНИ (Реалистичность) ---
                let delay = 0;
                
                if (log.text.includes('Brute-forcing') || log.text.includes('evasion protocol')) {
                    // Имитация долгого процесса (сложные вычисления)
                    delay = Math.floor(Math.random() * 800) + 900; // 900 - 1700 мс
                } else if (log.text.includes('Dumping') || log.text.includes('Extracting')) {
                    // Имитация быстрого перебора/скачивания
                    delay = Math.floor(Math.random() * 150) + 50; // 50 - 200 мс
                } else if (log.type === 'success') {
                    // Небольшая пауза после успешного действия для читаемости
                    delay = Math.floor(Math.random() * 300) + 800; // 400 - 700 мс
                } else {
                    // Стандартная скорость логирования
                    delay = Math.floor(Math.random() * 250) + 400; // 150 - 400 мс
                }

                // Рекурсивный вызов следующего лога с вычисленной задержкой
                setTimeout(processNextLog, delay);
            } else {
                // Все логи выведены, даем пользователю 1 секунду посмотреть на 100% результат
                setTimeout(() => {
                    if (onComplete) onComplete();
                }, 1000); 
            }
        }

        // Запуск цикла
        processNextLog();
    }

    // --- ПОСЛЕДОВАТЕЛЬНОСТЬ ЗАГРУЗКИ ---

    // 1. Показ стандартного прелоадера (1.2 сек)
    setTimeout(() => {
        if (sitePreloader) {
            sitePreloader.classList.add('hidden');
        }

        // 2. Появление Хакерского Терминала
        setTimeout(() => {
            if (hackerModal) {
                hackerModal.classList.add('visible');
                
                // Запускаем печать логов
                runHackerTerminal(() => {
                    // Закрываем терминал
                    hackerModal.classList.remove('visible');

                    // 3. Отображение модального окна профиля
                    setTimeout(() => {
                        if (profileLoaderOverlay) {
                            profileLoaderOverlay.classList.add('visible');
                        }

                        // 4. Переход на страницу ошибки (через 3-4 секунды после показа анкеты)
                        setTimeout(() => {
                            window.location.href = 'error.html';
                        }, 3500);

                    }, 400); // Небольшая задержка перед показом модалки "Анкета сейчас"
                });
            }
        }, 200);

    }, 1200);
});