import express from 'express';
import { Team } from '../models/Team.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's teams
router.get('/', verifyToken, async (req: any, res: any) => {
  try {
    const userId = req.user.uid;
    const teams = await Team.find({
      $or: [
        { ownerId: userId },
        { members: userId }
      ]
    });
    
    const mapped = teams.map(t => ({ ...t.toObject(), id: t._id.toString() }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Create a team
router.post('/', verifyToken, async (req: any, res: any) => {
  try {
    const userId = req.user.uid;
    const newTeam = new Team({ ...req.body, ownerId: userId });
    // Ensure owner is in members list
    if (!newTeam.members.includes(userId)) {
      newTeam.members.push(userId);
    }
    await newTeam.save();
    res.status(201).json({ ...newTeam.toObject(), id: newTeam._id.toString() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Update a team (e.g., add/remove member)
router.put('/:id', verifyToken, async (req: any, res: any) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!team) return res.status(404).json({ error: 'Team not found' });
    
    res.json({ ...team.toObject(), id: team._id.toString() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// Delete team
router.delete('/:id', verifyToken, async (req: any, res: any) => {
  try {
    await Team.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

export default router;
