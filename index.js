// index.js
require('dotenv').config();
console.log('🔑 OPENAI_API_KEY loaded:', !!process.env.OPENAI_API_KEY);

const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

app.use(cors());

app.use(express.json());
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Assistant endpoint
app.post('/assistant', async (req, res) => {
  const { systemPrompt, userInput } = req.body;
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.85,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userInput  },
      ],
    });
    const text = response.choices[0].message.content;
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OpenAI request failed' });
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

  // Future: save to database or file
  res.status(200).json({ success: true });
});

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
