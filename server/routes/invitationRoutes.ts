import express from 'express';
import { Invitation } from '../models/Invitation';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

// Get invitations for a user (by email)
router.get('/', verifyToken, async (req: any, res: any) => {
  try {
    const email = req.user.email;
    const invitations = await Invitation.find({ email, status: 'pending' });
    const mapped = invitations.map(i => ({ ...i.toObject(), id: i._id.toString() }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

// Create an invitation
router.post('/', verifyToken, async (req: any, res: any) => {
  try {
    const inviterId = req.user.uid;
    // We should ideally fetch the inviter's name here if needed, but the client can pass it.
    const newInvitation = new Invitation({ ...req.body, inviterId });
    await newInvitation.save();
    res.status(201).json({ ...newInvitation.toObject(), id: newInvitation._id.toString() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create invitation' });
  }
});

// Update invitation status
router.put('/:id', verifyToken, async (req: any, res: any) => {
  try {
    const invitation = await Invitation.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!invitation) return res.status(404).json({ error: 'Invitation not found' });
    
    res.json({ ...invitation.toObject(), id: invitation._id.toString() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update invitation' });
  }
});

// Delete invitation
router.delete('/:id', verifyToken, async (req: any, res: any) => {
  try {
    await Invitation.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete invitation' });
  }
});

export default router;
