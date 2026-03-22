import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

// Robust MongoDB connection caching
let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!MONGO_URI) throw new Error('MONGO_URI missing');
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
    }).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

app.get('/api/health', async (req, res) => {
  try {
    await connectDB();
    res.json({ status: 'ok', db: mongoose.connection.readyState });
  } catch (e: any) {
    res.status(500).json({ status: 'error', error: e.message });
  }
});

app.get('/api/debug-env', (req, res) => {
  res.json({ env: Object.keys(process.env).filter(k => k.includes('MONGO')), node: process.version });
});

export default app;
