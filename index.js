// index.js
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
console.log('🔑 OPENAI_API_KEY loaded:', !!process.env.OPENAI_API_KEY);

const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express(); // ✅ You were missing this

app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Assistant endpoint
app.post('/assistant', async (req, res) => {
  try {
    const { systemPrompt, userInput } = req.body;

    if (!systemPrompt || !userInput) {
      return res.status(400).json({ error: 'Missing systemPrompt or userInput' });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.85,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInput }
      ]
    });

    const reply = response?.choices?.[0]?.message?.content?.trim() || '[No reply from GPT]';

    res.json({ reply });

  } catch (err) {
    if (err.response?.data) {
      console.error('🛑 OpenAI API Error:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('🛑 Unknown Server Error:', err.message || err);
    }

    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
});

// 🔴 RED FLAG ENDPOINT
app.post('/flags', async (req, res) => {
  const { timestamp, userMessage, flagType } = req.body;

  if (!timestamp || !userMessage || !flagType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  console.log("🔴 RED FLAG CAPTURED:");
  console.log("Time:", new Date(timestamp).toISOString());
  console.log("Message:", userMessage);
  console.log("Flag Type:", flagType);

// 🔁 Log to Google Sheets
fetch("https://script.google.com/macros/s/AKfycbz4otnQfmIgc-QDNUEqmzabKT-lPXxw2zsX2OFe2tIPxfCwK4xQ4Fv8krR0EblhW6cn/exec", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: userMessage,
    flagType,
    ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown"
  })
});

// ✅ Done
res.status(200).json({ success: true });
});

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`✅ Server is now running on port ${port}`);
});
