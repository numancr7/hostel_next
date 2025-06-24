import { NextRequest, NextResponse } from 'next/server';
import Payment from '@/models/Payment';
import { connectToDatabase } from '@/lib/db';
import { z } from "zod";

// Zod schema for updating a payment
const updatePaymentSchema = z.object({
  amount: z.number().positive("Amount must be a positive number").optional(),
  month: z.string().min(1, "Month is required").optional(),
  year: z.number().int().positive("Year must be a positive integer").optional(),
  dueDate: z.string().datetime("Invalid 'dueDate' format").optional(),
  status: z.enum(["pending", "paid", "overdue"], "Invalid status").optional(),
});

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
  try {
    const body = await req.json();

    // Validate the request body using the Zod schema
    const validationResult = updatePaymentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const payment = await Payment.findByIdAndUpdate(params.id, validationResult.data, { new: true });
    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}

// DELETE payment
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const payment = await Payment.findByIdAndDelete(params.id);
  if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  return NextResponse.json({ message: 'Payment deleted' });
} 