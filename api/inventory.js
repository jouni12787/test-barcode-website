// pages/api/inventory.js  (or app/api/inventory/route.js adapted)
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1) Require bearer token that matches AUTH_TOKEN
    const authHeader = req.headers.authorization || '';
    const expected = `Bearer ${process.env.AUTH_TOKEN}`;
    if (authHeader !== expected) {
      return res.status(401).json({ error: 'Invalid or missing token' });
    }

    // 2) Fetch your inventory JSON (OpenSheet returns JSON)
    const url = process.env.GOOGLE_SHEET_URL;
    if (!url) throw new Error('GOOGLE_SHEET_URL is not set');

    const sheetResponse = await fetch(url, { cache: 'no-store' });
    if (!sheetResponse.ok) {
      throw new Error(`Sheets fetch failed: ${sheetResponse.status} ${sheetResponse.statusText}`);
    }

    const data = await sheetResponse.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Inventory error:', error);
    return res.status(500).json({ error: 'Failed to fetch inventory: ' + error.message });
  }
}

