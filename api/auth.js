// /api/auth.js
async function parseRequestBody(req) {
  // If Vercel already parsed it:
  if (req.body) {
    if (typeof req.body === 'string') {
      try { return JSON.parse(req.body); } catch { return {}; }
    }
    return req.body;
  }
  // Fallback: read the stream
  const chunks = [];
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { password = '' } = await parseRequestBody(req);
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedPassword) {
      return res.status(500).json({ success: false, message: 'ADMIN_PASSWORD missing' });
    }

    if (password === expectedPassword) {
      // Set cookie so inventory/sales can authenticate this browser
      const token = process.env.AUTH_TOKEN || '';
      const cookie = [
        `auth=${encodeURIComponent(token)}`,
        'Path=/', 'HttpOnly', 'SameSite=Lax', 'Secure', 'Max-Age=86400'
      ].join('; ');
      res.setHeader('Set-Cookie', cookie);

      return res.status(200).json({ success: true, message: 'Authentication successful' });
    }

    return res.status(401).json({ success: false, message: 'Invalid password' });
  } catch (err) {
    console.error('Auth API error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
