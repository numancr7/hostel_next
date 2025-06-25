import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { handleApiError } from '@/lib/utils';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

/**
 * Zod schema for updating an existing student/admin user by an administrator.
 * Defines the expected structure and validation rules for updating user data.
 * All fields are optional as it's a partial update.
 */
const updateStudentSchema = z.object({
  name: z.string().min(2, "Name is required").optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.enum(["student", "admin"]).optional(), // Admin can update role
  phone: z.string().optional().or(z.literal("")), // Optional phone number
  address: z.string().optional().or(z.literal("")), // Optional address
  roomId: z.string().nullable().optional(), // Allow null for unassignment, or new assignment
});

/**
 * Handles PUT requests to update an existing user (student or admin) by ID.
 * This operation is restricted to authenticated administrators only.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize: Only admins can update users
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = params;
    const body = await req.json();

    // Validate the request body using the Zod schema
    const validationResult = updateStudentSchema.safeParse(body);
    if (!validationResult.success) {
      // Return detailed validation errors
      return NextResponse.json(
        { errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updateData: any = { ...validationResult.data };

   
    // Find and update the user record in the database
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true } // Return the updated document and run schema validators
    ).select("-password"); // Do not return password to frontend

    if (!updatedUser) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User updated successfully.', user: updatedUser });
  } catch (error) {
    // Centralized error handling for API errors
    console.error("Error updating student in backend:", error);
    const { status, body } = handleApiError(error, 'Update Student');
    return NextResponse.json(body, { status });
  }
}

/**
 * Handles DELETE requests to remove an existing user by ID.
 * This operation is restricted to authenticated administrators only.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize: Only admins can delete users
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = params;

    // Find and delete the user record from the database
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully.' });
  } catch (error) {
    // Centralized error handling for API errors
    const { status, body } = handleApiError(error, 'Delete Student');
    return NextResponse.json(body, { status });
  }
} 