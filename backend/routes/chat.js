import { Router } from 'express';

const router = Router();

router.post('/chat', async (req, res) => {
  try {
    const { message, apiKey } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const key = apiKey || process.env.GEMINI_API_KEY;

    if (!key) {
      return res.status(400).json({ error: 'Gemini API key is required' });
    }

    console.log(`[User]: ${message.slice(0, 80)}...`);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `সনুর চেখুন রানু ভাদেক্রি্কব, সাহি ডাজुই ও দিদপ্দেপিকে ডাৗি ঘেবেসেব্ব নিরে কুকিক্ব কেন্বেব পাওে ফিকূব্ক্তায8 রমরে ক্টবস ঳ুস্র্র্র পাওে চরী্গা, হাঞে হমসিব ঳িস্র্র্র পাওে সাক্঱রার অাট্঒োনৼে গির্বাপে নুকা, কেন্বে ৫িেক্গ্ব্ক্তায8 নਭ ওে ক্টব���ে যিপাওে হতে জারেকে পাওে ॄিট্঒োনাব (রমরে ক্টবস) পাওে ॄিট্঒োনার মসি঄াঐ কেন্বে ৫িেক্গ্ব্ক্তায8 নਭ ्ব্ব মসুানু কেন্বে ৫িেক্গ্ব্ক্তায< তিকে মংস ।রে কো § ৎ्কি्ক ন্বেব ��
\n\nI¾স्কত্ব দা্ঽ্ঘ্রু: ${message}\n\nঊাগি:'
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini error:', data);
      return res.status(502).json({ error: data?.error?.message || 'Gemini API error' });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'ফुকিখে৫়, আাও ক্পেণস্ব পাওে দর্দ নাক্লুসাকোुও্ব.';

    console.log(`[Jaya]: ${reply.slice(0, 80)}...`);
    res.json({ reply });

  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

export default router;
