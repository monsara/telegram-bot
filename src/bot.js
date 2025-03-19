import TelegramBot from 'node-telegram-bot-api';
import { gameOptions, againOptions } from '../options.js';

// Создаем объект для хранения состояния игры
const chats = {};

// Создаем бота с поддержкой webhook
const bot = new TelegramBot(process.env.BOT_TOKEN, {
  webHook: true // Важно: включаем поддержку webhook
});

// Экспортируем обработчики отдельно
export const handleMessage = async (msg) => {
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
    return startGame(chatId);
  }

  return bot.sendMessage(chatId, 'Я тебя не понимать. Попробуй еще раз!');
};

// Функция для начала игры
const startGame = async (chatId) => {
  await bot.sendMessage(chatId, 'Сейчас будет игра. Я буду загадывать цифру от 0 до 9, а ты должен ее угадать.');
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, 'Отгадывай!', gameOptions);
};

// Экспортируем обработчик callback_query отдельно
export const handleCallbackQuery = async (query) => {
  const data = query.data;
  const chatId = query.message.chat.id;

  if (data === '/again') {
    return startGame(chatId);
  }

  if (data === chats[chatId]) {
    return bot.sendMessage(chatId, `Поздравляю, ты отгадал цифру ${chats[chatId]}!`, againOptions);
  } else {
    return bot.sendMessage(chatId, `К сожалению, ты не угадал, бот загадал цифру ${chats[chatId]}`, againOptions);
  }
};

// Устанавливаем команды бота
bot.setMyCommands([
  { command: '/start', description: 'Узнать куда ты попал' },
  { command: '/info', description: 'Узнать кто ты' },
  { command: '/game', description: 'Игра угадай цифру' }
]);

export default bot; 