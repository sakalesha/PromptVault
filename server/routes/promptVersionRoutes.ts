import express from 'express';
import { PromptVersion } from '../models/PromptVersion';
import { verifyToken } from '../middleware/auth';

const router = express.Router({ mergeParams: true }); // to access :promptId from parent router if needed

// Get versions for a prompt
router.get('/:promptId/versions', verifyToken, async (req: any, res: any) => {
  try {
    const versions = await PromptVersion.find({ promptId: req.params.promptId })
      .sort({ createdAt: -1 });
    
    const mapped = versions.map(v => ({ ...v.toObject(), id: v._id.toString() }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prompt versions' });
  }
});

// Create a version
router.post('/:promptId/versions', verifyToken, async (req: any, res: any) => {
  try {
    const newVersion = new PromptVersion({ ...req.body, promptId: req.params.promptId });
    await newVersion.save();
    res.status(201).json({ ...newVersion.toObject(), id: newVersion._id.toString() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create prompt version' });
  }
});

export default router;
