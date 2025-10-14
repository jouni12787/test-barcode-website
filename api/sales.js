export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const authToken = req.cookies?.auth;
  if (authToken !== process.env.AUTH_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { sku, employee, price, notes } = req.body;
    
    // Forward to Google Apps Script with secure token
    const response = await fetch(process.env.SELL_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: process.env.SELL_API_TOKEN,
        sku, employee, price, notes
      })
    });
    
    const result = await response.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Sale recording failed' });
  }
}
