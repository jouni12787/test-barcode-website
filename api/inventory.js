export default async function handler(req, res) {
  // Check authentication
  const authToken = req.cookies?.auth;
  if (authToken !== process.env.AUTH_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const sheetResponse = await fetch(process.env.GOOGLE_SHEET_URL);
    const data = await sheetResponse.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
}
