import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { handleApiError } from '@/lib/utils';
import { z } from 'zod';
import crypto from 'crypto';
import { sendEmail } from '@/lib/mailer';

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const validationResult = forgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    const user = await User.findOne({ email });
    if (!user) {
      // For security, do not reveal if the email exists or not
      return NextResponse.json({ message: 'If a user with that email exists, a password reset link has been sent.' }, { status: 200 });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    // Use RESET_TOKEN_EXPIRE from env or fallback to 1 hour
    const expiryMs = process.env.RESET_TOKEN_EXPIRE ? parseInt(process.env.RESET_TOKEN_EXPIRE) : 3600000;
    const resetTokenExpiry = new Date(Date.now() + expiryMs);

    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiry = resetTokenExpiry;
    await user.save();

    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    console.log("Generated Reset Link:", resetLink);
    const emailHtml = `
      <h1>Password Reset Request</h1>
      <p>You have requested a password reset. Please click the link below to reset your password:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>This link will expire in ${(expiryMs / 3600000).toFixed(1)} hour(s).</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request for HostelMS',
      html: emailHtml,
    });

    return NextResponse.json({ message: 'Password reset link sent to your email.' }, { status: 200 });
  } catch (error) {
    console.error("Error in forgot password:", error);
    const { status, body } = handleApiError(error, 'Forgot Password');
    return NextResponse.json(body, { status });
  }
} 