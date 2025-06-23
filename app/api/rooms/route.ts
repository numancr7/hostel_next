import { NextRequest, NextResponse } from 'next/server';
import Room from '@/models/Room';
import { connectToDatabase } from '@/lib/db';

// GET all rooms
export async function GET() {
  try {
    await connectToDatabase();
    const rooms = await Room.find().populate('occupants');
    return NextResponse.json(rooms);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

// POST create a new room
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();
    // Validate required fields
    const { roomNumber, type, capacity } = data;
    if (!roomNumber || !type || typeof capacity !== 'number') {
      return NextResponse.json({ error: 'roomNumber, type, and capacity are required' }, { status: 400 });
    }
    // Create room with defaults
    const room = await Room.create({
      roomNumber,
      type,
      capacity,
      occupants: [],
      isAvailable: true,
    });
    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    // Handle duplicate roomNumber error
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Room number already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
} 