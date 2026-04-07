import express from 'express';
import { UserSettings } from '../models/UserSettings.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, async (req: any, res: any) => {
  try {
    const userId = req.user.uid;
    const settings = await UserSettings.findOne({ userId });
    res.json(settings ? settings.toObject() : {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/', verifyToken, async (req: any, res: any) => {
  try {
    const userId = req.user.uid;
    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { ...req.body, userId },
      { new: true, upsert: true }
    );
    res.json(settings.toObject());
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
