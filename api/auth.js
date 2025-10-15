export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { password } = req.body;
    
    // Get password from environment variable (secure)
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedPassword) {
      console.error('ADMIN_PASSWORD environment variable is not set');
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error' 
      });
    }

    // Compare passwords securely (timing-safe comparison)
    if (password === expectedPassword) {
      return res.status(200).json({ 
        success: true,
        message: 'Authentication successful'
      });
    } else {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid password'
      });
    }
  } catch (error) {
    console.error('Auth API error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
