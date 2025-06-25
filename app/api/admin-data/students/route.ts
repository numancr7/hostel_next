import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { handleApiError } from '@/lib/utils';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Zod schema for creating a new student/admin user by an administrator.
 * Defines the expected structure and validation rules for new user data.
 * Password is required for creation.
 */
const createStudentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "admin"]), // Admin can create both students and other admins
  phone: z.string().optional().or(z.literal("")), // Optional phone number
  address: z.string().optional().or(z.literal("")), // Optional address
  roomId: z.string().optional().or(z.literal("")), // Optional room ID for initial assignment
});

/**
 * Handles POST requests to create a new user (student or admin).
 * This operation is restricted to authenticated administrators only.
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate and authorize: Only admins can create users
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();

    // Validate the request body using the Zod schema
    const validationResult = createStudentSchema.safeParse(body);
    if (!validationResult.success) {
      // Return detailed validation errors
      return NextResponse.json(
        { errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, role, phone, address, roomId } = validationResult.data;

    // Check if a user with the provided email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 });
    }

    // Create the new user record in the database
    // emailVerified is set to true as admin directly creates verified users
    const newUser = await User.create({
      name,
      email,
      password,
      role,
      phone,
      address,
      roomId: roomId === "" ? null : roomId, // Store empty string as null
      emailVerified: new Date(),
    });

    // Prepare user object to send back, excluding sensitive data like password
    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;

    return NextResponse.json({ message: 'User created successfully.', user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    // Centralized error handling for API errors
    console.error("Error creating student:", error);
    const { status, body } = handleApiError(error, 'Create Student');
    return NextResponse.json(body, { status });
  }
} 