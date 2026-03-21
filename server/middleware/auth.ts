import jwt from 'jsonwebtoken';

// Use an environment variable or a default fallback for local dev
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_123';

export const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    // decoded contains { userId: '...', email: '...' }
    // We map it to req.user.uid and req.user.email to maintain compatibility with our existing routes
    req.user = { uid: decoded.userId, email: decoded.email };
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};
