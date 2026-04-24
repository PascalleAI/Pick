require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json({ limit: '500mb' }));
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
app.get('/', (req, res) => res.json({ status: 'ok' }));

function cleanBase64(base64) {
  if (base64.includes(',')) return base64.split(',')[1];
  return base64;
}

function detectMediaType(base64) {
  try {
    const bytes = Buffer.from(base64.substring(0, 16), 'base64');
    if (bytes[0] === 0xFF && bytes[1] === 0xD8) return 'image/jpeg';
    if (bytes[0] === 0x89 && bytes[1] === 0x50) return 'image/png';
    if (bytes[0] === 0x47 && bytes[1] === 0x49) return 'image/gif';
    if (bytes[0] === 0x52 && bytes[1] === 0x49) return 'image/webp';
  } catch(e) {}
  return 'image/jpeg';
}

app.post('/analyze', async (req, res) => {
  const { items } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'No items.' });
  try {
    const count = items.length;
    const imageBlocks = items.map(item => {
      const clean = cleanBase64(item.base64);
      const mediaType = detectMediaType(clean);
      console.log(`Image media type detected: ${mediaType}`);
      return { type: 'image', source: { type: 'base64', media_type: mediaType, data: clean } };
    });
    const system = `You are Pick, a calm editorial photo advisor. Rank ${count} photo${count>1?'s':''} for Instagram. Voice: direct, warm, honest. Never say stunning or beautiful. 1-2 sentence reasons. Labels: 1 photo: "Post this" or "Hold for now". 2 photos: "Best pick"/"Strong option". 3+: rank 1="Best pick", ranks 2-3="Strong option", middle="Worth considering", last="Skip this one". Return raw JSON only, no markdown: {"results":[{"label":"...","title":"2-4 word title","reason":"...","summary":"3-5 words"}]} Return exactly ${count} objects in ranked order.`;
    const userText = count===1?'Should I post this?':count===2?'Which is stronger?':`Rank these ${count} photos.`;
    const response = await anthropic.messages.create({ model: 'claude-sonnet-4-5', max_tokens: 1024, system, messages: [{ role: 'user', content: [...imageBlocks, { type: 'text', text: userText }] }] });
    const { results } = JSON.parse(response.content[0].text.replace(/```json|```/g,'').trim());
    res.json({ results: results.map((r,i) => ({ ...r, id: items[i]?.id, uri: items[i]?.uri||null, rank: i+1 })) });
  } catch(err) { console.error('Error:', err?.message); res.status(500).json({ error: err?.message }); }
});
app.listen(PORT, () => console.log(`Pick API running on port ${PORT}`));
