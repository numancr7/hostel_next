import { NextRequest, NextResponse } from 'next/server';
import LeaveRequest from '@/models/LeaveRequest';
import { connectToDatabase } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import type { LeaveRequest as LeaveRequestType } from '@/types';
import { z } from "zod";

// Zod schema for creating a new leave request
const createLeaveRequestSchema = z.object({
  fromDate: z.string().datetime("Invalid 'fromDate' format"),
  toDate: z.string().datetime("Invalid 'toDate' format"),
  reason: z.string().min(10, "Reason must be at least 10 characters long"),
}).refine((data) => new Date(data.fromDate) <= new Date(data.toDate), {
  message: "'fromDate' cannot be after 'toDate'",
  path: ["fromDate", "toDate"], // Path of error
});

// GET leave requests (admin: all, student: own)
export async function GET(req: NextRequest) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    let leaveRequests;
    if (session.user.role === 'admin') {
      leaveRequests = await LeaveRequest.find().populate('studentId');
    } else {
      leaveRequests = await LeaveRequest.find({ studentId: session.user.id }).populate('studentId');
    }
    return NextResponse.json(leaveRequests, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leave requests' }, { status: 500 });
  }
}

// POST create a new leave request (authenticated student)
export async function POST(req: NextRequest) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'student') {
    return NextResponse.json({ error: 'Only students can create leave requests' }, { status: 403 });
  }
  try {
    const body = await req.json();

    // Validate the request body using the Zod schema
    const validationResult = createLeaveRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { fromDate, toDate, reason } = validationResult.data;

    // Create leave request
    const leaveRequest = await LeaveRequest.create({
      studentId: session.user.id,
      studentName: session.user.name,
      fromDate,
      toDate,
      reason,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    });
    return NextResponse.json(leaveRequest, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create leave request' }, { status: 500 });
  }
} 