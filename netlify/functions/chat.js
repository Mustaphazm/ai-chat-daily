// netlify/functions/chat.js
import fetch from 'node-fetch';

export async function handler(event) {
  try {
    const { message, category, history } = JSON.parse(event.body);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing GEMINI_API_KEY in environment variables" })
      };
    }

    // Gemini API endpoint (adjust to the right model you use)
    const geminiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `Category: ${category}\n\nConversation History:\n${history || ""}\n\nUser: ${message}` }
          ]
        }
      ]
    };

    const response = await fetch(`${geminiEndpoint}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand."
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
