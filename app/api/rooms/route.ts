import { NextRequest, NextResponse } from 'next/server';
import Room from '@/models/Room';
import { connectToDatabase } from '@/lib/db';
import type { Room as RoomType } from '@/types';
import { handleApiError } from '@/lib/utils';
import { z } from "zod";

// Zod schema for creating a new room
const roomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  type: z.enum(['AC', 'Non-AC']),
  capacity: z.number().int().positive("Capacity must be a positive integer"),
  isAvailable: z.boolean().default(true).optional(),
  occupants: z.array(z.string()).default([]).optional(), // Assuming occupants are string IDs
});

// GET all rooms
export async function GET() {
  try {
    await connectToDatabase();
    const rooms = await Room.find().populate('occupants');
    return NextResponse.json(rooms, { status: 200 });
  } catch (error) {
    const { status, body } = handleApiError(error, 'Get All Rooms');
    return NextResponse.json(body, { status });
  }
}

// POST create a new room
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    // Validate the request body using the Zod schema
    const validationResult = roomSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { roomNumber, type, capacity, isAvailable, occupants } = validationResult.data;

    // Create room
    const room = await Room.create({
      roomNumber,
      type,
      capacity,
      occupants: occupants || [],
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });
    return NextResponse.json(room, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Room number already exists' }, { status: 400 });
    }
    const { status, body } = handleApiError(error, 'Create Room');
    return NextResponse.json(body, { status });
  }
} 