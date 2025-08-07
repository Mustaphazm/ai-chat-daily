// api/chat.js
// Vercel Serverless Function (Node 18+). Uses process.env.GEMINI_API_KEY
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { message, category, context } = req.body || {};
    if (!message) return res.status(400).json({ error: 'Missing message' });

    // Build a compact prompt with category and last messages context (if provided).
    let prompt = `You are a helpful assistant. Category: ${category || 'General'}.\nUser: ${message}\nAssistant:`;
    if (Array.isArray(context) && context.length) {
      // include last few messages as context (short)
      const ctxText = context.slice(-6).map(c => `${c.role}: ${c.content}`).join('\n');
      prompt = `Context:\n${ctxText}\n\nNow respond to the user.\nUser: ${message}\nAssistant:`;
    }

    // Call Gemini-like endpoint (adjust to your actual provider URL & auth method)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Server missing GEMINI_API_KEY' });

    const body = {
      // This body shape may need adjustment depending on exact Gemini API version.
      prompt,
      maxOutputTokens: 512,
      temperature: 0.2
    };

    // Example: use a Google generative endpoint that accepts API key in header or query.
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`   // if your key is Bearer token; if not, change accordingly
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error('Gemini error', r.status, errText);
      return res.status(502).json({ error: 'AI provider error', details: errText });
    }

    const json = await r.json();
    // Parse response depending on provider structure:
    const reply = json?.candidates?.[0]?.content?.parts?.[0]?.text || json?.output?.[0]?.content || json?.reply || JSON.stringify(json);

    return res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
