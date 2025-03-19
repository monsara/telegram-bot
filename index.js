import TelegramApi from 'node-telegram-bot-api';
import { gameOptions, againOptions } from './options.js';

const token = process.env.BOT_TOKEN || '7827133690:AAEmYWWBswTNpm4FCY3pq06bJHwhqZQ5cVY';
const isDev = !process.env.VERCEL_URL;

// Отладочный вывод
console.log('Environment variables:', {
  VERCEL_URL: process.env.VERCEL_URL,
  BOT_TOKEN: process.env.BOT_TOKEN,
  isDev: isDev
});

// Создаем объект для хранения состояния игры
const chats = {};

// Настройка бота
const webhookUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}/api/webhook`
  : 'https://telegram-bot-ngjq-apwyq1djk-monsaras-projects.vercel.app/api/webhook';

const bot = new TelegramApi(token, {
  webHook: {
    host: '0.0.0.0',
    port: process.env.PORT || 443
  }
});

// Функции бота
const startGame = async (chatId) => {
  await bot.sendMessage(chatId, 'Сейчас будет игра. Я буду загадывать цифру от 0 до 9, а ты должен ее угадать.');
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, 'Отгадывай!', gameOptions);
}

// Обработчик сообщений
const handleMessage = async (msg) => {
  try {
    const text = msg.text;
    const chatId = msg.chat.id;
    const fullName = `рядовой ${msg.from.first_name} ${msg.from.last_name || ''}`;

    console.log('Получено сообщение:', text, 'от:', fullName);

    if (text === '/start') {
      await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/4dd/300/4dd300fd-0a89-3f3d-ac53-8ec93976495e/8.webp');
      return bot.sendMessage(chatId, 'Добро пожаловать в Матрицу, нормис!');
    }

    if (text === '/info') {
      return bot.sendMessage(chatId, `Я буду называть тебя ${fullName}`);
    }

    if (text === '/game') {
      return startGame(chatId);
    }

    return bot.sendMessage(chatId, 'Я тебя не понимать. Попробуй еще раз!');
  } catch (error) {
    console.error('Ошибка при обработке сообщения:', error);
  }
};

// Обработчик callback_query
const handleCallbackQuery = async (query) => {
  try {
    const data = query.data;
    const chatId = query.message.chat.id;

    console.log('Получен callback_query:', data);

    if (data === '/again') {
      return startGame(chatId);
    }

    if (data === chats[chatId]) {
      return bot.sendMessage(chatId, `Поздравляю, ты отгадал цифру! ${chats[chatId]}`, againOptions);
    } else {
      return bot.sendMessage(chatId, `К сожалению, ты не отгадал цифру. Моя цифра больше! ${chats[chatId]}`, againOptions);
    }
  } catch (error) {
    console.error('Ошибка при обработке callback_query:', error);
  }
};

// Инициализация бота
const initializeBot = async () => {
  // Устанавливаем команды
  await bot.setMyCommands([
    { command: '/start', description: 'Узнать куда ты попал' },
    { command: '/info', description: 'Узнать кто ты' },
    { command: '/game', description: 'Игра угадай цифру' }
  ]);

  if (isDev) {
    // В режиме разработки используем polling
    bot.startPolling();
    bot.on('message', handleMessage);
    bot.on('callback_query', handleCallbackQuery);
  } else {
    // В продакшене устанавливаем вебхук с секретным токеном
    const secretToken = Math.random().toString(36).substring(2);
    console.log('Setting webhook with secret token:', secretToken);
    await bot.setWebHook(webhookUrl, {
      secret_token: secretToken
    });
  }
};

// Запускаем бота
initializeBot().then(() => {
  console.log('Бот запущен в режиме:', isDev ? 'разработки (polling)' : 'продакшн (webhook)');
});

// Экспортируем бота и обработчики для использования в webhook
export { bot, handleMessage, handleCallbackQuery }; 