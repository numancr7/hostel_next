import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/utils";
import { z } from "zod";
import crypto from 'crypto';
import { sendEmail } from '@/lib/mailer';

// Zod schema for user registration
const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "admin"]),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  roomId: z.string().optional().or(z.literal("")),
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

    const { name, email, password, role, phone, address, roomId } = validationResult.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If user exists but is not verified, resend verification email
      if (!existingUser.emailVerified) {
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiry

        existingUser.verificationToken = verificationToken;
        existingUser.verificationTokenExpiry = verificationTokenExpiry;
        await existingUser.save();

        const verificationLink = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}`;
        const emailHtml = `
          <h1>Welcome to HostelMS!</h1>
          <p>Please verify your email address by clicking the link below:</p>
          <p><a href="${verificationLink}">Verify Email</a></p>
          <p>This link will expire in 1 hour.</p>
        `;

        await sendEmail({
          to: email,
          subject: 'Verify Your Email Address',
          html: emailHtml,
        });
        return NextResponse.json({ message: 'User already exists but not verified. Verification email re-sent.' }, { status: 200 });
      }
      return NextResponse.json({ error: 'User with this email already exists and is verified.' }, { status: 409 });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiry

    const newUser = await User.create({
      name,
      email,
      password,
      role,
      phone,
      address,
      roomId,
      verificationToken,
      verificationTokenExpiry,
    });

    const verificationLink = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}`;
    const emailHtml = `
      <h1>Welcome to HostelMS!</h1>
      <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationLink}">Verify Email</a></p>
      <p>This link will expire in 1 hour.</p>
    `;

    await sendEmail({
      to: newUser.email,
      subject: 'Verify Your Email Address',
      html: emailHtml,
    });

    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;

    return NextResponse.json({ ...userWithoutPassword, message: "User registered successfully. Verification email sent." }, { status: 201 });
  } catch (error) {
    const { status, body } = handleApiError(error, 'User Registration');
    return NextResponse.json(body, { status });
  }
}
