import express from 'express';
import { Prompt } from '../models/Prompt';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

// Get all prompts
// Note: We might need to filter by public or by userId
router.get('/', verifyToken, async (req: any, res: any) => {
  try {
    const userId = req.user.uid;
    const prompts = await Prompt.find({
      $or: [
        { userId },
        { isPublic: true },
        // If collaborating or part of a team, we can add more logic here later
      ]
    }).sort({ createdAt: -1 });
    
    // Map _id to id to keep frontend simple
    const mapped = prompts.map(p => ({
      ...p.toObject(),
      id: p._id.toString()
    }));
    
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

// Create a prompt
router.post('/', verifyToken, async (req: any, res: any) => {
  try {
    const userId = req.user.uid;
    const newPrompt = new Prompt({ ...req.body, userId });
    await newPrompt.save();
    
    res.status(201).json({ ...newPrompt.toObject(), id: newPrompt._id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create prompt' });
  }
});

// Update a prompt
router.put('/:id', verifyToken, async (req: any, res: any) => {
  try {
    const prompt = await Prompt.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!prompt) return res.status(404).json({ error: 'Prompt not found' });
    
    res.json({ ...prompt.toObject(), id: prompt._id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update prompt' });
  }
});

// Delete a prompt
router.delete('/:id', verifyToken, async (req: any, res: any) => {
  try {
    await Prompt.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete prompt' });
  }
});

export default router;
