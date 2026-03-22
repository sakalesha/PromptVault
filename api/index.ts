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
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/promptvault';

app.use(cors());
app.use(express.json());

// Connect to MongoDB function with caching for serverless
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  console.log('Initiating MongoDB connection...');
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('Successfully connected to MongoDB');
  } catch (err: any) {
    console.error('CRITICAL: Failed to connect to MongoDB:', err.message);
    throw err;
  }
};

// Middleware to ensure DB is connected
app.use(async (req, res, next) => {
  if (req.path === '/api/health') return next();
  
  try {
    await connectDB();
    next();
  } catch (error: any) {
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

// Health check with DB status
app.get('/api/health', async (req, res) => {
  try {
    await connectDB();
    res.status(200).json({ 
      status: 'ok', 
      dbState: mongoose.connection.readyState,
      environment: process.env.NODE_ENV 
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      dbState: mongoose.connection.readyState 
    });
  }
});

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Check server logs for details',
    path: req.path
  });
});

export default app;
