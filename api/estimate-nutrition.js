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

  const foodText = req.body && req.body.foodText;
  if (!foodText || typeof foodText !== 'string') {
    res.status(400).json({ error: 'Missing foodText' });
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
        content: 'Estimate the nutrition for this food log entry using standard, widely accepted nutrition data (typical USDA-style values for common foods and portions). Use reasonable default portion sizes when the person did not specify one. Food eaten: "' + foodText.replace(/"/g, "'") + '". Respond with ONLY a raw JSON object, no markdown fences, no preamble, matching exactly this shape: {"totalCalories":number,"totalProtein":number,"items":[{"name":"string","calories":number,"protein":number}]}'
      }]
    })
  });

  if (!anthropicRes.ok) {
    res.status(502).json({ error: 'Anthropic API error' });
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
