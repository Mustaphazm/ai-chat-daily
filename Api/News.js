// api/news.js
export default async function handler(req, res) {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Server missing NEWS_API_KEY' });

    const q = req.query.q || '';
    const country = req.query.country || 'us';
    const pageSize = req.query.pageSize || 6;

    const url = `https://newsapi.org/v2/top-headlines?country=${encodeURIComponent(country)}&pageSize=${encodeURIComponent(pageSize)}&q=${encodeURIComponent(q)}`;
    const r = await fetch(url, {
      headers: { 'Authorization': apiKey } // NewsAPI supports apiKey param too: ?apiKey=...
    });

    const data = await r.json();
    if (data.status !== 'ok') {
      return res.status(502).json({ error: 'News provider error', details: data });
    }
    return res.status(200).json({ articles: data.articles || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
