import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'minimal api working',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/debug-env', (req, res) => {
  res.json({ 
    envKeys: Object.keys(process.env).filter(key => 
      key.includes('MONGO') || key.includes('JWT') || key.includes('PORT') || key.includes('NODE')
    ),
    nodeVersion: process.version,
    platform: process.platform,
    envLoaded: !!process.env.MONGO_URI
  });
});

export default app;
