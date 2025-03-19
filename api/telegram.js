import bot, { handleMessage, handleCallbackQuery } from '../src/bot.js';

export default async function handler(request, response) {
  try {
    console.log('Webhook request received');

    if (request.method !== 'POST') {
      return response.status(405).json({ error: 'Method not allowed' });
    }

    const update = request.body;
    console.log('Update received:', JSON.stringify(update));

    if (update.message) {
      await handleMessage(update.message);
    } else if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
    } else {
      console.log('Unknown update type:', update);
    }

    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return response.status(500).json({ error: error.message });
  }
} 