import mongoose, { Document, Model } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  ownerId: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: String, required: true },
  members: [{ type: String }] // Array of user emails or UIDs
}, { timestamps: true });

export const Team = (mongoose.models.Team as Model<ITeam>) || mongoose.model<ITeam>('Team', teamSchema);
