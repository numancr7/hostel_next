import { NextRequest, NextResponse } from 'next/server';
import Payment from '@/models/Payment';
import { connectToDatabase } from '@/lib/db';
import { z } from "zod";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/utils';

/**
 * Zod schema for updating an existing payment.
 * Defines the expected structure and validation rules for updating payment data.
 * All fields are optional as it's a partial update.
 */
const updatePaymentSchema = z.object({
  amount: z.number().positive("Amount must be a positive number").optional(),
  month: z.string().min(1, "Month is required").optional(),
  year: z.number().int().positive("Year must be a positive integer").optional(),
  dueDate: z.string().datetime("Invalid 'dueDate' format").optional(),
  status: z.enum(["pending", "paid", "overdue"], { message: "Invalid status" }).optional(),
});

/**
 * Handles GET requests for a single payment record by ID.
 * Accessible by: 
 * - Admins: Can retrieve any payment record.
 * - Students: Can only retrieve their own payment records.
 * Unauthorized users are rejected.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  // Check for authentication
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payment = await Payment.findById(params.id).populate('studentId');
    // Check if payment exists
    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });

    // Authorize: Student can only view their own payment
    if (session.user.role === 'student' && payment.studentId.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(payment);
  } catch (error) {
    // Centralized error handling for API errors
    const { status, body } = handleApiError(error, 'Fetch Payment');
    return NextResponse.json(body, { status });
  }
}

/**
 * Handles PUT requests to update an existing payment record by ID.
 * This operation is restricted to administrators only.
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  // Authenticate and authorize: Only admins can update payments
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();
  try {
    const body = await req.json();

    // Validate the request body using the Zod schema
    const validationResult = updatePaymentSchema.safeParse(body);

    if (!validationResult.success) {
      // Return detailed validation errors
      return NextResponse.json(
        { errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Find and update the payment record in the database
    const payment = await Payment.findByIdAndUpdate(params.id, validationResult.data, { new: true });
    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    return NextResponse.json(payment);
  } catch (error) {
    // Centralized error handling for API errors
    console.error("Error updating payment:", error);
    const { status, body } = handleApiError(error, 'Update Payment');
    return NextResponse.json(body, { status });
  }
}

/**
 * Handles DELETE requests to remove a payment record by ID.
 * This operation is restricted to administrators only.
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  // Authenticate and authorize: Only admins can delete payments
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();
  try {
    // Find and delete the payment record from the database
    const payment = await Payment.findByIdAndDelete(params.id);
    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    return NextResponse.json({ message: 'Payment deleted' });
  } catch (error) {
    // Centralized error handling for API errors
    const { status, body } = handleApiError(error, 'Delete Payment');
    return NextResponse.json(body, { status });
  }
} 