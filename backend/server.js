require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // was 500mb — no reason to accept that

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.get('/', (req, res) => res.json({ status: 'ok', service: 'pick-api' }));

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
  } catch (e) {}
  return 'image/jpeg';
}

app.post('/analyze', async (req, res) => {
  const { items } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'No items.' });
  if (items.length > 9) return res.status(400).json({ error: 'Maximum 9 items.' });

  try {
    const count = items.length;

    // Build image blocks with text labels so Claude knows which index is which
    const contentBlocks = [];
    items.forEach((item, index) => {
      const clean = cleanBase64(item.base64);
      const mediaType = detectMediaType(clean);
      contentBlocks.push({ type: 'text', text: `Photo ${index} (0-based index ${index}):` });
      contentBlocks.push({ type: 'image', source: { type: 'base64', media_type: mediaType, data: clean } });
    });

    const system = `You are Pick, a calm editorial photo advisor for Instagram creators.
Rank ${count} photo${count > 1 ? 's' : ''} honestly. Voice: direct, warm. Never say "stunning" or "beautiful". 1-2 sentence reasons.

Label rules:
- 1 photo: "Post this" or "Hold for now"
- 2 photos: "Best pick" / "Strong option"
- 3+ photos: rank 1="Best pick", ranks 2-3="Strong option", middle="Worth considering", last="Skip this one"

CRITICAL: Return raw JSON only, no markdown fences.
Schema: {"results":[{"originalIndex":0,"label":"Best pick","title":"2-4 word title","reason":"1-2 sentences","summary":"3-5 words"}]}

- originalIndex: the 0-based index of the photo as labelled above
- Return exactly ${count} result objects in ranked order (best first)
- Every photo must appear exactly once`;

    const userText =
      count === 1 ? 'Should I post this?' :
      count === 2 ? 'Which is stronger for Instagram?' :
      `Rank these ${count} photos for Instagram. Be honest.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system,
      messages: [{ role: 'user', content: [...contentBlocks, { type: 'text', text: userText }] }],
    });

    const raw = response.content[0]?.text?.replace(/```json|```/g, '').trim();
    if (!raw) throw new Error('No response from model.');

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.results)) throw new Error('Unexpected response shape.');

    // Map each result back to the correct original item using originalIndex
    const results = parsed.results.map((r, rank) => {
      const idx = typeof r.originalIndex === 'number' ? r.originalIndex : rank;
      const originalItem = items[idx] || items[rank];
      return {
        label: r.label,
        title: r.title,
        reason: r.reason,
        summary: r.summary,
        originalIndex: idx,
        id: originalItem?.id || `result_${rank}`,
        uri: null, // URI is local to device — client maps this back
        rank: rank + 1,
      };
    });

    res.json({ results });
  } catch (err) {
    console.error('Analysis error:', err?.message);
    res.status(500).json({ error: err?.message || 'Analysis failed.' });
  }
});

app.listen(PORT, () => console.log(`Pick API running on port ${PORT}`));
