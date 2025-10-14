export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const sheetResponse = await fetch(process.env.GOOGLE_SHEET_URL);

    if (!sheetResponse.ok) {
      throw new Error('Failed to fetch from Google Sheets');
    }

    const data = await sheetResponse.json();
    res.json(data);
  } catch (error) {
    console.error('Inventory error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory: ' + error.message });
  }
}
