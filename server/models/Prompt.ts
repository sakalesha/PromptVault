import mongoose, { Document, Model } from 'mongoose';

export interface IPrompt extends Document {
  userId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  isTemplate: boolean;
  isFavorite: boolean;
  copyCount: number;
  templateUseCount: number;
  teamId?: string;
  collaborators: string[];
  score: number;
  userVotes: Map<string, number>;
  isDraft: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const promptSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'General' },
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: false },
  isTemplate: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
  copyCount: { type: Number, default: 0 },
  templateUseCount: { type: Number, default: 0 },
  teamId: { type: String },
  collaborators: [{ type: String }], // Array of user emails or UIDs
  score: { type: Number, default: 0 },
  userVotes: { type: Map, of: Number, default: {} }, // 1 for upvote, -1 for downvote
  isDraft: { type: Boolean, default: false },
}, { timestamps: true });

export const Prompt = (mongoose.models.Prompt as Model<IPrompt>) || mongoose.model<IPrompt>('Prompt', promptSchema);
