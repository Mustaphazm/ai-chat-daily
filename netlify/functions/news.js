// netlify/functions/news.js
import fetch from 'node-fetch';

export async function handler() {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing NEWS_API_KEY in environment variables" })
      };
    }

    const url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data.articles || [])
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
