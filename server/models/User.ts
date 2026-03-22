import mongoose, { Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String, default: 'User' }
}, { timestamps: true });

export const User = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', userSchema);
