import { NextRequest, NextResponse } from 'next/server';
import Payment from '@/models/Payment';
import { connectToDatabase } from '@/lib/db';

// GET single payment
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const payment = await Payment.findById(params.id).populate('studentId');
  if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  return NextResponse.json(payment);
}

// PUT update payment
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const data = await req.json();
  const payment = await Payment.findByIdAndUpdate(params.id, data, { new: true });
  if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  return NextResponse.json(payment);
}

// DELETE payment
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const payment = await Payment.findByIdAndDelete(params.id);
  if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  return NextResponse.json({ message: 'Payment deleted' });
} 