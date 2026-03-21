import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String, default: 'User' }
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
