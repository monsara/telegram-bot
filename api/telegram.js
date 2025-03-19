import bot, { handleMessage, handleCallbackQuery } from '../src/bot.js';

export default async function handler(request, response) {
  try {
    console.log('Webhook request received');
    console.log('Request method:', request.method);
    console.log('Request headers:', request.headers);

    if (request.method !== 'POST') {
      return response.status(405).json({ error: 'Method not allowed' });
    }

    const update = request.body;

    if (!update) {
      console.log('Empty update received');
      return response.status(400).json({ error: 'Empty update' });
    }

    console.log('Update received:', JSON.stringify(update, null, 2));

    if (update.message) {
      console.log('Processing message from:', update.message.from?.username);
      await handleMessage(update.message);
    } else if (update.callback_query) {
      console.log('Processing callback query from:', update.callback_query.from?.username);
      await handleCallbackQuery(update.callback_query);
    } else {
      console.log('Unknown update type. Full update:', update);
    }

    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    console.error('Error stack:', error.stack);
    return response.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
} 