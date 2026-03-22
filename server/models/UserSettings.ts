import mongoose, { Document, Model } from 'mongoose';

export interface IUserSettings extends Document {
  userId: string;
  defaultCategory?: string;
  theme: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSettingsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  defaultCategory: { type: String },
  theme: { type: String, default: 'dark' }
}, { timestamps: true });

export const UserSettings = (mongoose.models.UserSettings as Model<IUserSettings>) || mongoose.model<IUserSettings>('UserSettings', userSettingsSchema);
