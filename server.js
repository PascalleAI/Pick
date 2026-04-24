// PICK — Backend API
// Node.js + Express + OpenAI
//
// Setup:
//   npm install express openai cors dotenv
//   Create .env with OPENAI_API_KEY=sk-...
//   node server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'pick-api' });
});

// ─── Analyze endpoint ─────────────────────────────────────────────────────────

app.post('/analyze', async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'No items provided.' });
  }

  if (items.length > 9) {
    return res.status(400).json({ error: 'Maximum 9 items per request.' });
  }

  try {
    const results = await analyzePhotos(items);
    res.json({ results });
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: err.message || 'Analysis failed.' });
  }
});

// ─── Core analysis logic ──────────────────────────────────────────────────────

async function analyzePhotos(items) {
  const count = items.length;

  // Build the image content blocks
  const imageBlocks = items.map((item, index) => ({
    type: 'image_url',
    image_url: {
      url: `data:image/jpeg;base64,${item.base64}`,
      detail: 'low', // saves tokens; 'high' for more detail if needed
    },
  }));

  const systemPrompt = buildSystemPrompt(count);
  const userPrompt = buildUserPrompt(count, items);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 800,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: userPrompt },
          ...imageBlocks,
        ],
      },
    ],
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error('No response from model.');

  const parsed = JSON.parse(raw);
  const ranked = parsed.results;

  if (!Array.isArray(ranked)) throw new Error('Unexpected response shape from model.');

  // Merge back with original item IDs and URIs
  return ranked.map((result, index) => ({
    id: items[index]?.id || `result_${index}`,
    uri: null, // URI is local to device — client maps this back
    label: result.label,
    title: result.title,
    reason: result.reason,
    summary: result.summary,
    rank: index + 1,
  }));
}

// ─── Prompt builders ──────────────────────────────────────────────────────────

function buildSystemPrompt(count) {
  return `You are Pick — a calm, editorial photo advisor for Instagram creators.
Your job is to look at a set of ${count} photo${count > 1 ? 's' : ''} and give an honest, useful ranking.

Your voice:
- Direct but warm. Not sycophantic. Not robotic.
- Editorial in tone — think a trusted creative friend, not an AI.
- Never say "stunning" or "beautiful" or empty praise.
- Be specific about what works and what doesn't.
- Keep reasons to 1–2 short sentences.

Label rules (use exactly these strings):
- 1 photo: "Post this" or "Hold for now"
- 2 photos: "Best pick" for winner, "Strong option" for second
- 3–9 photos: 
  - rank 1: "Best pick"
  - ranks 2–3: "Strong option"  
  - middle: "Worth considering"
  - last (if 4+ photos): "Skip this one"

Output JSON in this exact shape:
{
  "results": [
    {
      "label": "Best pick",
      "title": "Short evocative title (2–4 words, no quotes)",
      "reason": "One or two honest sentences about why this one.",
      "summary": "3–5 word phrase describing the photo's feel"
    }
  ]
}

Return results in ranked order — best first.
Return exactly ${count} result objects, one per photo, in the same order as provided.`;
}

function buildUserPrompt(count, items) {
  if (count === 1) {
    return `I have one photo I'm thinking about posting to Instagram. Should I post it? Give me an honest read.`;
  }
  if (count === 2) {
    return `I have two photos and I need to choose one. Which is the stronger pick for Instagram?`;
  }
  return `I have ${count} photos I'm choosing between for Instagram. Rank them from strongest to weakest. Be honest — tell me which to post and which to skip.`;
}

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Pick API running on port ${PORT}`);
});
