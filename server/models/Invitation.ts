import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
  teamId: { type: String, required: true },
  teamName: { type: String, required: true },
  email: { type: String, required: true },
  inviterId: { type: String, required: true },
  inviterName: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
}, { timestamps: true });

export const Invitation = mongoose.model('Invitation', invitationSchema);
