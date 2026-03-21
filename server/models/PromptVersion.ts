import mongoose from 'mongoose';

const promptVersionSchema = new mongoose.Schema({
  promptId: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export const PromptVersion = mongoose.model('PromptVersion', promptVersionSchema);
