import { bot, handleMessage, handleCallbackQuery } from '../index.js';

console.log('Webhook handler initialized with environment:', {
  VERCEL_URL: process.env.VERCEL_URL,
  NODE_ENV: process.env.NODE_ENV,
  BOT_TOKEN: process.env.BOT_TOKEN ? 'Set' : 'Not set'
});

// Обработчик webhook-ов для Vercel
export default async (request, response) => {
  try {
    console.log('Получен webhook запрос:', {
      method: request.method,
      url: request.url,
      headers: request.headers,
      query: request.query,
      body: request.body
    });

    if (request.method === 'POST') {
      const update = request.body;

      if (!update) {
        console.error('Получен пустой update');
        return response.status(400).json({
          error: 'No update in request body',
          headers: request.headers,
          method: request.method
        });
      }

      console.log('Обрабатываем update:', JSON.stringify(update, null, 2));

      try {
        // Определяем тип обновления и вызываем соответствующий обработчик
        if (update.message) {
          await handleMessage(update.message);
        } else if (update.callback_query) {
          await handleCallbackQuery(update.callback_query);
        }

        console.log('Update обработан успешно');
        return response.status(200).json({ ok: true });
      } catch (botError) {
        console.error('Ошибка при обработке update ботом:', botError);
        return response.status(500).json({
          error: 'Bot update handling error',
          message: botError.message
        });
      }
    }

    // Для GET запросов возвращаем статус бота
    return response.status(200).json({
      ok: true,
      message: 'Telegram Bot is running',
      environment: process.env.VERCEL_URL ? 'production' : 'development',
      vercel_url: process.env.VERCEL_URL,
      webhook_url: process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}/api/webhook`
        : 'https://telegram-bot-ngjq-apwyq1djk-monsaras-projects.vercel.app/api/webhook'
    });
  } catch (error) {
    console.error('Ошибка при обработке webhook:', error);
    return response.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}; 