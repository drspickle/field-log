const SUPABASE_URL = 'https://nbbooydgsrririeranjh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_j6z9LiQMoTIs62Ry9v6Rpw_zu1NnyEj';

async function verifySession(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return false;
  const res = await fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: 'Bearer ' + token }
  });
  return res.ok;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!(await verifySession(req))) {
    res.status(401).json({ error: 'Not signed in' });
    return;
  }

  const { imageBase64, mimeType } = req.body || {};
  if (!imageBase64 || !mimeType) {
    res.status(400).json({ error: 'Missing imageBase64 or mimeType' });
    return;
  }

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } },
          { type: 'text', text: 'This image is either a nutrition facts label or a photo of food. If it is a nutrition facts label, read the calories and protein directly off the label, accounting for the number of servings shown if that is visible. If it is a photo of food (not a label), estimate the calories and protein using standard, widely accepted nutrition data (typical USDA-style values for common foods) and reasonable portion-size assumptions based on what is visible. Respond with ONLY a raw JSON object, no markdown fences, no preamble, matching exactly this shape: {"totalCalories":number,"totalProtein":number,"items":[{"name":"string","calories":number,"protein":number}]}' }
        ]
      }]
    })
  });

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text();
    console.error('Anthropic API error', anthropicRes.status, errText);
    res.status(502).json({ error: 'Anthropic API error', status: anthropicRes.status, detail: errText });
    return;
  }

  const data = await anthropicRes.json();
  const textBlock = (data.content || []).find((b) => b.type === 'text');
  if (!textBlock) {
    res.status(502).json({ error: 'No text in response' });
    return;
  }

  try {
    const clean = textBlock.text.replace(/```json|```/g, '').trim();
    res.status(200).json(JSON.parse(clean));
  } catch (e) {
    res.status(502).json({ error: 'Could not parse model response' });
  }
};
