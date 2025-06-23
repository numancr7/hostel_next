import mongoose, { Schema, model, models } from 'mongoose';

export interface IRoom {
  roomNumber: string;
  type: string; // e.g., 'AC', 'Non-AC'
  capacity: number;
  occupants: mongoose.Types.ObjectId[]; // Array of User _id
  isAvailable: boolean;
}

const roomSchema = new Schema<IRoom>({
  roomNumber: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  capacity: { type: Number, required: true },
  occupants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isAvailable: { type: Boolean, default: true },
});

const Room = models?.Room || model<IRoom>('Room', roomSchema);
export default Room;