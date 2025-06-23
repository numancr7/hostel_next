import { NextRequest, NextResponse } from 'next/server';
import Room from '@/models/Room';
import { connectToDatabase } from '@/lib/db';

// GET single room
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const room = await Room.findById(params.id).populate('occupants');
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    return NextResponse.json(room);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 });
  }
}

// PUT update room (roomNumber is immutable)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const data = await req.json();
    // Only allow updating type, capacity, occupants, isAvailable
    const updateFields: any = {};
    if (data.type) updateFields.type = data.type;
    if (typeof data.capacity === 'number') updateFields.capacity = data.capacity;
    if (Array.isArray(data.occupants)) updateFields.occupants = data.occupants;
    if (typeof data.isAvailable === 'boolean') updateFields.isAvailable = data.isAvailable;
    const room = await Room.findByIdAndUpdate(params.id, updateFields, { new: true });
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    return NextResponse.json(room);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
  }
}

// DELETE room
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const room = await Room.findByIdAndDelete(params.id);
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    return NextResponse.json({ message: 'Room deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
  }
} 