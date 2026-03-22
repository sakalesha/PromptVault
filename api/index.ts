import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from '../server/routes/authRoutes';
import promptRoutes from '../server/routes/promptRoutes';
import teamRoutes from '../server/routes/teamRoutes';
import invitationRoutes from '../server/routes/invitationRoutes';
import categoryRoutes from '../server/routes/categoryRoutes';
import settingsRoutes from '../server/routes/settingsRoutes';

const app = express();
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

// Robust MongoDB connection caching for Serverless
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalWithMongoose = global as typeof global & { mongoose: MongooseCache };
let cached = globalWithMongoose.mongoose;

if (!cached) {
  cached = globalWithMongoose.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    console.log('Creating new MongoDB connection promise...');
    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongooseInstance) => {
      console.log('MongoDB connected successfully');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

// Middleware to ensure DB is connected
app.use(async (req, res, next) => {
  // Skip DB for health and debug unless needed
  if (req.path === '/api/health' || req.path === '/api/debug-env') return next();
  
  try {
    await connectDB();
    next();
  } catch (error: any) {
    console.error('DB Connection Error in Middleware:', error.message);
    return res.status(503).json({ 
      error: 'Database connection failed', 
      message: error.message,
      readyState: mongoose.connection.readyState 
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingsRoutes);

// Debug route to check environment keys (NOT values)
app.get('/api/debug-env', (req, res) => {
  res.json({ 
    envKeys: Object.keys(process.env).filter(key => 
      key.includes('MONGO') || key.includes('JWT') || key.includes('PORT') || key.includes('NODE')
    ),
    nodeVersion: process.version,
    platform: process.platform,
    timestamp: new Date().toISOString(),
    envLoaded: !!process.env.MONGO_URI
  });
});

// Health check with DB status
app.get('/api/health', async (req, res) => {
  try {
    await connectDB();
    res.status(200).json({ 
      status: 'ok', 
      dbState: mongoose.connection.readyState,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Health check DB error:', error.message);
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error.message,
      dbState: mongoose.connection.readyState 
    });
  }
});

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled API Error:', err);
  res.status(err.status || 500).json({ 
    error: 'Internal Server Error', 
    message: err.message || 'Check server logs for details',
    path: req.path,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

export default app;
