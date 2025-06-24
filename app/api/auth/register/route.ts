import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/utils";
import { z } from "zod";

// Zod schema for user registration
const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "admin"], "Invalid role"),
});

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    // Validate the request body using the Zod schema
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, role } = validationResult.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Remove explicit hashing here, let the Mongoose pre-save hook handle it
    const newUser = await User.create({ name, email, password, role });

    // Do not return password to frontend
    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    const { status, body } = handleApiError(error, 'User Registration');
    return NextResponse.json(body, { status });
  }
}
