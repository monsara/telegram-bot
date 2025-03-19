const bot = require('../index.js');

// Обработчик webhook-ов для Vercel
module.exports = async (request, response) => {
  try {
    console.log('Получен webhook запрос:', request.method);
    console.log('Headers:', request.headers);

    if (request.method === 'POST') {
      const update = request.body;
      console.log('Тело webhook запроса:', JSON.stringify(update, null, 2));

      if (!update) {
        console.error('Получен пустой update');
        return response.status(400).json({ error: 'No update in request body' });
      }

      await bot.handleUpdate(update);
      console.log('Update обработан успешно');
      return response.status(200).json({ ok: true });
    }

    // Для GET запросов возвращаем статус бота
    return response.status(200).json({
      ok: true,
      message: 'Telegram Bot is running',
      environment: process.env.VERCEL_URL ? 'production' : 'development'
    });
  } catch (error) {
    console.error('Ошибка при обработке webhook:', error);
    return response.status(500).json({ error: error.message });
  }
}; 