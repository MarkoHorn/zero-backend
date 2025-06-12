// index.js
require('dotenv').config();
console.log('🔑 OPENAI_API_KEY loaded:', !!process.env.OPENAI_API_KEY);
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const app = express();
app.use(cors());
app.use(express.json());
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// This is the endpoint your front-end will call
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

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
