const bot = require('../index.js');

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

    // Для GET запросов возвращаем статус бота
    return response.status(200).json({
      ok: true,
      message: 'Telegram Bot is running'
    });
  } catch (error) {
    console.error('Ошибка при обработке webhook:', error);
    return response.status(500).json({ error: error.message });
  }
}; 