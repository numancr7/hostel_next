import mongoose, { Schema, model, models } from 'mongoose';

export interface IPayment {
  studentId: mongoose.Types.ObjectId; // User _id
  amount: number;
  status: 'pending' | 'paid';
  dueDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const paymentSchema = new Schema<IPayment>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  dueDate: { type: Date, required: true },
}, { timestamps: true });

const Payment = models?.Payment || model<IPayment>('Payment', paymentSchema);
export default Payment; 