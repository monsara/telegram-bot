import { bot } from '../index.js';

export default async function handler(request, response) {
  try {
    const url = request.query.url;
    if (!url) {
      return response.status(400).json({ error: 'URL parameter is required' });
    }

    await bot.setWebHook(url);
    return response.status(200).json({ ok: true, message: 'Webhook set successfully' });
  } catch (error) {
    console.error('Error setting webhook:', error);
    return response.status(500).json({
      error: 'Failed to set webhook',
      message: error.message
    });
  }
} 