import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { z } from 'zod';
import { Mongoose } from 'mongoose';

const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name is required").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  // roomId should not be updated by the student themselves
});

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'student') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();

  try {
    const body = await req.json();
    const parsedBody = profileUpdateSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json({ errors: parsedBody.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, phone, address } = parsedBody.data;

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: { name, phone, address } },
      { new: true, runValidators: true }
    ).select("-password"); // Do not return password

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error: any) {
    console.error("Error updating student profile:", error);
    return NextResponse.json({ message: 'Failed to update profile', error: error.message }, { status: 500 });
  }
} 