import bot from '../src/bot.js';

export default async function handler(request, response) {
  try {
    const update = request.body;
    await bot.handleUpdate(update);
    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return response.status(500).json({ error: error.message });
  }
} 