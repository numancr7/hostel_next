import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { handleApiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ message: 'Missing verification token' }, { status: 400 });
  }

  await connectToDatabase();

  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }, // Token not expired
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired verification token' }, { status: 400 });
    }

    user.emailVerified = new Date();
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    // Redirect to a success page or login page
    return NextResponse.redirect(new URL('/login?verified=true', req.url));
  } catch (error) {
    console.error("Error verifying email:", error);
    const { status, body } = handleApiError(error, 'Email Verification');
    return NextResponse.json(body, { status });
  }
} 