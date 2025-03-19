const TelegramApi = require('node-telegram-bot-api');
const { gameOptions, againOptions } = require('./options');
const token = '7827133690:AAEmYWWBswTNpm4FCY3pq06bJHwhqZQ5cVY';
const bot = new TelegramApi(token, { polling: true });
const chats = {};


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
])

const startGame = async (chatId) => {
  await bot.sendMessage(chatId, 'Сейчас будет игра. Я буду загадывать цифру от 0 до 9, а ты должен ее угадать.');
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, 'Отгадывай!', gameOptions);
}

const start = () => {
  bot.on('message', async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    const fullName = `рядовой ${msg.from.first_name} ${msg.from.last_name || ''}`;

    if (text === '/start') {
      await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/4dd/300/4dd300fd-0a89-3f3d-ac53-8ec93976495e/8.webp');
      return bot.sendMessage(chatId, 'Добро пожаловать в Матрицу, нормис!');
    }

    if (text === '/info') {
      return bot.sendMessage(chatId, `Я буду называть тебя ${fullName}`);
    }

    if (text === '/game') {
      return startGame(chatId)
    }

    return bot.sendMessage(chatId, 'Я тебя не понимать. Попробуй еще раз!');
  })

  bot.on('callback_query', async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;

    if (data === '/again') {
      return startGame(chatId);
    }

    if (data === chats[chatId]) {
      return bot.sendMessage(chatId, `Поздравляю, ты отгадал цифру! ${chats[chatId]}`, againOptions);
    } else {
      return bot.sendMessage(chatId, `К сожалению, ты не отгадал цифру. Моя цифра больше! ${chats[chatId]}`, againOptions);
    }
  })
}

start();