import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: String, required: true },
  members: [{ type: String }] // Array of user emails or UIDs
}, { timestamps: true });

export const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);
