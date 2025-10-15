// /api/sales.js
async function parseJSONBody(req) {
  if (req.body) {
    if (typeof req.body === 'string') {
      try { return JSON.parse(req.body); } catch { return {}; }
    }
    return req.body;
  }
  const chunks = [];
  for await (const c of req) chunks.push(typeof c === 'string' ? Buffer.from(c) : c);
  const raw = Buffer.concat(chunks).toString('utf8');
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Auth via cookie set at login
  if (req.cookies?.auth !== process.env.AUTH_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized: missing or bad auth cookie' });
  }

  try {
    const { sku, employee, price, notes, availability } = await parseJSONBody(req);

    if (!sku || !employee || price === undefined || price === null) {
      return res.status(400).json({ error: 'Missing required fields: sku, employee, price' });
    }

    const numPrice = Number(price);
    if (Number.isNaN(numPrice)) {
      return res.status(400).json({ error: 'Price must be a number' });
    }

    if (!process.env.SELL_API_URL) return res.status(500).json({ error: 'SELL_API_URL not set' });
    if (!process.env.SELL_API_TOKEN) return res.status(500).json({ error: 'SELL_API_TOKEN not set' });

    const upstream = await fetch(process.env.SELL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Token': process.env.SELL_API_TOKEN
      },
      body: JSON.stringify({
        sku: String(sku).trim(),
        employee: String(employee).trim(),
        price: numPrice,
        notes: notes ?? '',
        availability: availability ?? 'sold'
      })
    });

    const text = await upstream.text(); // read text so we can show real reason
    if (!upstream.ok) {
      console.error('SELL API error:', upstream.status, text);
      return res.status(502).json({ error: `Upstream failed ${upstream.status}`, details: text.slice(0, 500) });
    }

    // Try to parse JSON; fall back to text
    try {
      const data = JSON.parse(text);
      return res.status(200).json({ success: true, data });
    } catch {
      return res.status(200).json({ success: true, message: text });
    }
  } catch (e) {
    console.error('Sale handler error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
