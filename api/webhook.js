import { bot } from '../index.js';

console.log('Webhook handler initialized with environment:', {
  VERCEL_URL: process.env.VERCEL_URL,
  NODE_ENV: process.env.NODE_ENV,
  BOT_TOKEN: process.env.BOT_TOKEN ? 'Set' : 'Not set'
});

// Обработчик webhook-ов для Vercel
export default async (request, response) => {
  try {
    console.log('Получен webhook запрос:', request.method);
    console.log('Headers:', request.headers);
    console.log('Query:', request.query);
    console.log('Body:', request.body);

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
      environment: process.env.VERCEL_URL ? 'production' : 'development',
      vercel_url: process.env.VERCEL_URL
    });
  } catch (error) {
    console.error('Ошибка при обработке webhook:', error);
    return response.status(500).json({ error: error.message });
  }
}; 