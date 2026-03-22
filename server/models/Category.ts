import mongoose, { Document, Model } from 'mongoose';

export interface ICategory extends Document {
  userId: string;
  name: string;
  color: string;
  teamId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  color: { type: String, required: true },
  teamId: { type: String }
}, { timestamps: true });

export const Category = (mongoose.models.Category as Model<ICategory>) || mongoose.model<ICategory>('Category', categorySchema);
