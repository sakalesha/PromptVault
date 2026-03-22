import mongoose, { Document, Model } from 'mongoose';

export interface IInvitation extends Document {
  teamId: string;
  teamName: string;
  email: string;
  inviterId: string;
  inviterName: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  updatedAt: Date;
}

const invitationSchema = new mongoose.Schema({
  teamId: { type: String, required: true },
  teamName: { type: String, required: true },
  email: { type: String, required: true },
  inviterId: { type: String, required: true },
  inviterName: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
}, { timestamps: true });

export const Invitation = (mongoose.models.Invitation as Model<IInvitation>) || mongoose.model<IInvitation>('Invitation', invitationSchema);
