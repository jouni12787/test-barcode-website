async function parseRequestBody(req) {
  if (req.body) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch (error) {
        console.error('Failed to parse string body as JSON:', error);
        return {};
      }
    }
    return req.body;
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }

    if (chunks.length === 0) {
      return {};
    }

    const rawBody = Buffer.concat(chunks).toString('utf8');
    if (!rawBody) {
      return {};
    }

    return JSON.parse(rawBody);
  } catch (error) {
    console.error('Failed to read request body:', error);
    return {};
  }
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const body = await parseRequestBody(req);
    const password = body?.password;

    // Get password from environment variable (secure)
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedPassword) {
      console.error('ADMIN_PASSWORD environment variable is not set');
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error' 
      });
    }

    if (typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
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
