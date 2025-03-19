const TelegramApi = require('node-telegram-bot-api');
const { gameOptions, againOptions } = require('./options');
const token = process.env.BOT_TOKEN || '7827133690:AAEmYWWBswTNpm4FCY3pq06bJHwhqZQ5cVY';

// Отладочный вывод
console.log('Environment variables:', {
  VERCEL_URL: process.env.VERCEL_URL,
  BOT_TOKEN: process.env.BOT_TOKEN,
  isDev: !process.env.VERCEL_URL
});

// Создаем объект для хранения состояния игры
const chats = {};

// Настройка бота
const isDev = !process.env.VERCEL_URL;
const bot = new TelegramApi(token, {
  polling: isDev, // polling только в режиме разработки
  webHook: isDev ? false : {
    port: process.env.PORT || 443
  }
});

// Команды бота
bot.setMyCommands([
  {
    command: '/start',
    description: 'Узнать куда ты попал'
  },
  {
    command: '/info',
    description: 'Узнать кто ты'
  },
  {
    command: '/game',
    description: 'Игра угадай цифру'
  }
]);

const startGame = async (chatId) => {
  await bot.sendMessage(chatId, 'Сейчас будет игра. Я буду загадывать цифру от 0 до 9, а ты должен ее угадать.');
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, 'Отгадывай!', gameOptions);
}

// Обработчики сообщений
const initializeBot = () => {
  bot.on('message', async (msg) => {
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
  });

  bot.on('callback_query', async (msg) => {
    try {
      const data = msg.data;
      const chatId = msg.message.chat.id;

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
  });
}

// Инициализируем бота
initializeBot();
console.log('Бот запущен в режиме:', isDev ? 'разработки (polling)' : 'продакшн (webhook)');

// Экспортируем бота для использования в webhook
module.exports = { bot }; 