import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  defaultCategory: { type: String },
  theme: { type: String, default: 'dark' }
}, { timestamps: true });

export const UserSettings = mongoose.models.UserSettings || mongoose.model('UserSettings', userSettingsSchema);
