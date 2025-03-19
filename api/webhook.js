const TelegramApi = require('node-telegram-bot-api');
const { gameOptions, againOptions } = require('../options');
const bot = require('../index.js');

const token = process.env.BOT_TOKEN || '7827133690:AAEmYWWBswTNpm4FCY3pq06bJHwhqZQ5cVY';
const botApi = new TelegramApi(token, { webHook: { port: process.env.PORT } });

// Объект для хранения состояния игры
const chats = {};

// Инициализация команд бота
botApi.setMyCommands([
  { command: '/start', description: 'Узнать куда ты попал' },
  { command: '/info', description: 'Узнать кто ты' },
  { command: '/game', description: 'Игра угадай цифру' }
]);

const startGame = async (chatId) => {
  await botApi.sendMessage(chatId, 'Сейчас будет игра. Я буду загадывать цифру от 0 до 9, а ты должен ее угадать.');
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await botApi.sendMessage(chatId, 'Отгадывай!', gameOptions);
};

// Обработчики сообщений
botApi.on('message', async (msg) => {
  try {
    const text = msg.text;
    const chatId = msg.chat.id;
    const fullName = `рядовой ${msg.from.first_name} ${msg.from.last_name || ''}`;

    console.log('Получено сообщение:', text, 'от:', fullName);

    if (text === '/start') {
      await botApi.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/4dd/300/4dd300fd-0a89-3f3d-ac53-8ec93976495e/8.webp');
      return botApi.sendMessage(chatId, 'Добро пожаловать в Матрицу, нормис!');
    }

    if (text === '/info') {
      return botApi.sendMessage(chatId, `Я буду называть тебя ${fullName}`);
    }

    if (text === '/game') {
      return startGame(chatId);
    }

    return botApi.sendMessage(chatId, 'Я тебя не понимать. Попробуй еще раз!');
  } catch (error) {
    console.error('Ошибка при обработке сообщения:', error);
  }
});

botApi.on('callback_query', async (msg) => {
  try {
    const data = msg.data;
    const chatId = msg.message.chat.id;

    console.log('Получен callback_query:', data);

    if (data === '/again') {
      return startGame(chatId);
    }

    if (data === chats[chatId]) {
      return botApi.sendMessage(chatId, `Поздравляю, ты отгадал цифру! ${chats[chatId]}`, againOptions);
    } else {
      return botApi.sendMessage(chatId, `К сожалению, ты не отгадал цифру. Моя цифра больше! ${chats[chatId]}`, againOptions);
    }
  } catch (error) {
    console.error('Ошибка при обработке callback_query:', error);
  }
});

// Обработчик webhook-ов для Vercel
module.exports = async (request, response) => {
  try {
    console.log('Получен webhook запрос:', request.method);

    if (request.method === 'POST') {
      const update = request.body;
      console.log('Тело webhook запроса:', JSON.stringify(update));

      await bot.handleUpdate(update);
      return response.status(200).json({ ok: true });
    }

    return response.status(200).json({
      ok: true,
      message: 'Telegram Bot is running'
    });
  } catch (error) {
    console.error('Ошибка при обработке webhook:', error);
    return response.status(500).json({ error: error.message });
  }
}; 