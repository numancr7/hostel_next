import mongoose, { Schema, model, models } from 'mongoose';

export interface ILeaveRequest {
  studentId: mongoose.Types.ObjectId; // User _id
  fromDate: Date;
  toDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const leaveRequestSchema = new Schema<ILeaveRequest>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedAt: { type: Date, required: false },
}, { timestamps: true });

const LeaveRequest = models?.LeaveRequest || model<ILeaveRequest>('LeaveRequest', leaveRequestSchema);
export default LeaveRequest; 