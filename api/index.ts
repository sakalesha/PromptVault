import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import routes from server directory
import authRoutes from '../server/routes/authRoutes.js';
import promptRoutes from '../server/routes/promptRoutes.js';
import teamRoutes from '../server/routes/teamRoutes.js';
import invitationRoutes from '../server/routes/invitationRoutes.js';
import categoryRoutes from '../server/routes/categoryRoutes.js';
import settingsRoutes from '../server/routes/settingsRoutes.js';

dotenv.config();

const app = express();
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

// Robust MongoDB connection caching for serverless environments
let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!MONGO_URI) throw new Error('MONGO_URI is not defined in environment variables');
  
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
    }).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Middleware to ensure DB connection on every request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error: any) {
    console.error('DB Connection Error:', error);
    res.status(500).json({ error: 'Database connection failed', message: error.message });
  }
});

// Mounted Routes
app.use('/api/auth', authRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    db: mongoose.connection.readyState,
    env: process.env.NODE_ENV
  });
});

export default app;
