import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  color: { type: String, required: true },
  teamId: { type: String }
}, { timestamps: true });

export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
