import { bot, handleMessage, handleCallbackQuery } from '../index.js';

// Логируем переменные окружения при инициализации
console.log('Webhook environment:', {
  BOT_TOKEN: process.env.BOT_TOKEN?.slice(0, 5) + '...',
  VERCEL_URL: process.env.VERCEL_URL,
  NODE_ENV: process.env.NODE_ENV
});

// Обработчик webhook-ов для Vercel
export default async function handler(request, response) {
  try {
    // Логируем детали запроса
    console.log('Webhook request details:', {
      method: request.method,
      url: request.url,
      headers: {
        'content-type': request.headers['content-type'],
        'x-telegram-bot-api-secret-token': request.headers['x-telegram-bot-api-secret-token']
      },
      body: typeof request.body === 'string' ? 'string' : typeof request.body,
      rawBody: request.body
    });

    if (request.method !== 'POST') {
      console.log('Invalid method:', request.method);
      return response.status(405).json({ error: 'Method not allowed' });
    }

    let update;
    try {
      update = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
      console.log('Parsed update:', JSON.stringify(update, null, 2));
    } catch (error) {
      console.error('Error parsing request body:', error);
      return response.status(400).json({ error: 'Invalid request body' });
    }

    if (!update) {
      console.log('Empty update received');
      return response.status(400).json({ error: 'Empty update' });
    }

    try {
      if (update.message) {
        console.log('Processing message:', {
          chat_id: update.message.chat.id,
          text: update.message.text
        });
        await handleMessage(update.message);
        console.log('Message processed successfully');
      } else if (update.callback_query) {
        console.log('Processing callback query:', {
          chat_id: update.callback_query.message.chat.id,
          data: update.callback_query.data
        });
        await handleCallbackQuery(update.callback_query);
        console.log('Callback query processed successfully');
      } else {
        console.log('Unknown update type:', update);
      }

      return response.status(200).json({ ok: true });
    } catch (error) {
      console.error('Error processing update:', error);
      console.error('Error stack:', error.stack);
      return response.status(500).json({ error: 'Internal server error' });
    }
  } catch (error) {
    console.error('Webhook handler error:', error);
    console.error('Error stack:', error.stack);
    return response.status(500).json({ error: 'Internal server error' });
  }
} 