export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;
  
  // Compare with environment variable
  if (password === process.env.ADMIN_PASSWORD) {
    // Simple session - in production, use JWT
    res.setHeader('Set-Cookie', `auth=${process.env.AUTH_TOKEN}; Path=/; HttpOnly; Secure; SameSite=Strict`);
    return res.json({ success: true });
  } else {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
}
