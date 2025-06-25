import { NextRequest, NextResponse } from 'next/server';
import Payment from '@/models/Payment';
import { connectToDatabase } from '@/lib/db';
import { z } from "zod";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/utils';

/**
 * Zod schema for creating a new payment.
 * Defines the expected structure and validation rules for incoming payment data.
 */
const createPaymentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  amount: z.number().positive("Amount must be a positive number"),
  month: z.string().min(1, "Month is required"), // Consider more specific validation if needed
  year: z.number().int().positive("Year must be a positive integer"),
  dueDate: z.string().datetime("Invalid 'dueDate' format"),
  status: z.enum(["pending", "paid", "overdue"], { message: "Invalid status" }).default("pending"),
});

/**
 * Handles GET requests to retrieve payment records.
 * Accessible by: 
 * - Admins: Retrieves all payment records.
 * - Students: Retrieves only their own payment records.
 * Unauthorized users are rejected.
 */
export async function GET(req: NextRequest) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  // Check for authentication
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    let payments;
    if (session.user.role === 'admin') {
      // Admins can view all payments
      payments = await Payment.find().populate('studentId');
    } else if (session.user.role === 'student') {
      // Students can only view their own payments
      payments = await Payment.find({ studentId: session.user.id }).populate('studentId');
    } else {
      // Reject other roles
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(payments);
  } catch (error) {
    // Centralized error handling for API errors
    const { status, body } = handleApiError(error, 'Fetch Payments');
    return NextResponse.json(body, { status });
  }
}

/**
 * Handles POST requests to create a new payment record.
 * This operation is restricted to administrators only.
 */
export async function POST(req: NextRequest) {
  // Authenticate and authorize: Only admins can create payments
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();
  try {
    const body = await req.json();

    // Validate the request body using the Zod schema
    const validationResult = createPaymentSchema.safeParse(body);

    if (!validationResult.success) {
      // Return detailed validation errors
      return NextResponse.json(
        { errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Backend validation for required fields
    if (!body.studentId) {
      return NextResponse.json({ error: 'Student is required.' }, { status: 400 });
    }
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number.' }, { status: 400 });
    }
    if (!body.month) {
      return NextResponse.json({ error: 'Month is required.' }, { status: 400 });
    }
    if (!body.year || body.year <= 0) {
      return NextResponse.json({ error: 'Year must be a positive integer.' }, { status: 400 });
    }
    if (!body.dueDate) {
      return NextResponse.json({ error: 'Due Date is required.' }, { status: 400 });
    }

    // Create the new payment record in the database
    const payment = await Payment.create(validationResult.data);
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    // Centralized error handling for API errors
    console.error("Error creating payment:", error);
    const { status, body } = handleApiError(error, 'Create Payment');
    return NextResponse.json(body, { status });
  }
} 