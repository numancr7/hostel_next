import { NextRequest, NextResponse } from 'next/server';
import Room from '@/models/Room';
import { connectToDatabase } from '@/lib/db';
import type { Room as RoomType } from '@/types';
import { handleApiError } from '@/lib/utils';
import { z } from "zod";
import mongoose from 'mongoose';

// Zod schema for updating a room
const updateRoomSchema = z.object({
  type: z.enum(['AC', 'Non-AC'], "Invalid room type").optional(),
  capacity: z.number().int().positive("Capacity must be a positive integer").optional(),
  isAvailable: z.boolean().optional(),
  occupants: z.array(z.string()).optional(), // Assuming occupants are string IDs
});

// GET single room
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const room = await Room.findById(params.id).populate('occupants');
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    return NextResponse.json(room, { status: 200 });
  } catch (error) {
    const { status, body } = handleApiError(error, 'Get Room By ID');
    return NextResponse.json(body, { status });
  }
}

// PUT update room
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Validate id parameter
    if (!params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid or missing room id.' }, { status: 400 });
    }
    await connectToDatabase();
    const body = await req.json();

    // Validate the request body using the Zod schema
    const validationResult = updateRoomSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const updateFields = validationResult.data;

    const room = await Room.findByIdAndUpdate(params.id, updateFields, { new: true });
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    return NextResponse.json(room, { status: 200 });
  } catch (error) {
    const { status, body } = handleApiError(error, 'Update Room');
    return NextResponse.json(body, { status });
  }
}

// DELETE room
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const room = await Room.findByIdAndDelete(params.id);
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    return NextResponse.json({ message: 'Room deleted' }, { status: 200 });
  } catch (error) {
    const { status, body } = handleApiError(error, 'Delete Room');
    return NextResponse.json(body, { status });
  }
} 