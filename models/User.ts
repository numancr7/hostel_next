import mongoose, { Schema, model, models } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  name?: string;
  email: string;
  emailVerified?: Date | null;
  password: string;
  role: 'admin' | 'student';
  roomId?: string;
  phone?: string;
  address?: string;
  verificationToken?: string | null;
  verificationTokenExpiry?: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordTokenExpiry?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, trim: true }, // Optional name field
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Date, default: null }, // For NextAuth
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'student'],
      default: 'student',
    },
    roomId: { type: String, default: null },
    phone: { type: String, default: null },
    address: { type: String, default: null },
    verificationToken: { type: String, default: null },
    verificationTokenExpiry: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordTokenExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

// Hash password before saving (only if modified)
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = models?.User || model<IUser>('User', userSchema);
export default User;
