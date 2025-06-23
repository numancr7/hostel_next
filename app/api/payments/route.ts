import { NextRequest, NextResponse } from 'next/server';
import Payment from '@/models/Payment';
import { connectToDatabase } from '@/lib/db';

// GET all payments
export async function GET() {
  await connectToDatabase();
  const payments = await Payment.find().populate('studentId');
  return NextResponse.json(payments);
}

// POST create a new payment
export async function POST(req: NextRequest) {
  await connectToDatabase();
  const data = await req.json();
  const payment = await Payment.create(data);
  return NextResponse.json(payment, { status: 201 });
} 