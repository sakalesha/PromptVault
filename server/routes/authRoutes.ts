import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_123';

router.post('/register', async (req: any, res: any) => {
  try {
    const { email, password, displayName } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      displayName: displayName || email.split('@')[0]
    });
    
    await user.save();

    // Create token payload mapping the MongoDB _id to userId
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '30d' }
    );

    res.status(201).json({ 
      token, 
      user: { 
        uid: user._id.toString(), 
        email: user.email, 
        displayName: user.displayName 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

router.post('/login', async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '30d' }
    );

    res.json({ 
      token, 
      user: { 
        uid: user._id.toString(), 
        email: user.email, 
        displayName: user.displayName 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

router.get('/me', verifyToken, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.uid).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ 
        uid: user._id.toString(), 
        email: user.email, 
        displayName: user.displayName 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
