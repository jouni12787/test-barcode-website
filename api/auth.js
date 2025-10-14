export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required' });
    }

    console.log('Received password attempt');

    if (password === process.env.ADMIN_PASSWORD) {
      console.log('Password matched');
      return res.json({ success: true });
    } else {
      console.log('Password mismatch');
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}

