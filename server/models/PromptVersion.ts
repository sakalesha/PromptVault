import mongoose, { Document, Model } from 'mongoose';

export interface IPromptVersion extends Document {
  promptId: string;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  createdAt: Date;
}

const promptVersionSchema = new mongoose.Schema({
  promptId: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export const PromptVersion = (mongoose.models.PromptVersion as Model<IPromptVersion>) || mongoose.model<IPromptVersion>('PromptVersion', promptVersionSchema);
