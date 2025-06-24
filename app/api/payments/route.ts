import { NextRequest, NextResponse } from 'next/server';
import Payment from '@/models/Payment';
import { connectToDatabase } from '@/lib/db';
import { z } from "zod";

// Zod schema for creating a new payment
const createPaymentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  amount: z.number().positive("Amount must be a positive number"),
  month: z.string().min(1, "Month is required"), // Consider more specific validation if needed
  year: z.number().int().positive("Year must be a positive integer"),
  dueDate: z.string().datetime("Invalid 'dueDate' format"),
  status: z.enum(["pending", "paid", "overdue"], "Invalid status").default("pending"),
});

// GET all payments
export async function GET() {
  await connectToDatabase();
  const payments = await Payment.find().populate('studentId');
  return NextResponse.json(payments);
}

// POST create a new payment
export async function POST(req: NextRequest) {
  await connectToDatabase();
  try {
    const body = await req.json();

    // Validate the request body using the Zod schema
    const validationResult = createPaymentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const payment = await Payment.create(validationResult.data);
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
} 