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

// Middleware to ensure DB is connected
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1 && req.path !== '/api/health') {
    return res.status(503).json({ 
      error: 'Database connecting...', 
      readyState: mongoose.connection.readyState 
    });
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingsRoutes);

// Connect to MongoDB with timeout and proper error reporting
console.log('Initiating MongoDB connection...');
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch((err) => console.error('CRITICAL: Failed to connect to MongoDB:', err.message));

// Health check with DB status
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    dbState: mongoose.connection.readyState,
    environment: process.env.NODE_ENV 
  });
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
