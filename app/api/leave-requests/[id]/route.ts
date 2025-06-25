import { NextRequest, NextResponse } from 'next/server';
import LeaveRequest from '@/models/LeaveRequest';
import { connectToDatabase } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import type { LeaveRequest as LeaveRequestType } from '@/types';
import { z } from "zod";
import { handleApiError } from '@/lib/utils';

// Zod schema for updating a leave request
const updateLeaveRequestSchema = z.object({
  status: z.enum(["approved", "rejected", "pending"], "Invalid status").optional(),
  reason: z.string().min(10, "Reason must be at least 10 characters long").optional(),
  fromDate: z.string().datetime("Invalid 'fromDate' format").optional(),
  toDate: z.string().datetime("Invalid 'toDate' format").optional(),
}).refine((data) => {
  if (data.fromDate && data.toDate) {
    return new Date(data.fromDate) <= new Date(data.toDate);
  }
  return true; // No date validation if one or both are missing
}, {
  message: "'fromDate' cannot be after 'toDate'",
  path: ["fromDate", "toDate"], // Path of error
});

// GET single leave request (admin or owner)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const leaveRequest = await LeaveRequest.findById(params.id).populate('studentId');
    if (!leaveRequest) return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    if (session.user.role !== 'admin' && leaveRequest.studentId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(leaveRequest, { status: 200 });
  } catch (error) {
    const { status, body } = handleApiError(error, 'Fetch Leave Request');
    return NextResponse.json(body, { status });
  }
}

// PUT update leave request (admin only, status and reason)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can update leave requests' }, { status: 403 });
  }
  try {
    const body = await req.json();

    // Validate the request body using the Zod schema
    const validationResult = updateLeaveRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updateFields = validationResult.data;

    if (updateFields.status) {
      updateFields.reviewedAt = new Date().toISOString();
    }

    const leaveRequest = await LeaveRequest.findByIdAndUpdate(params.id, updateFields, { new: true });
    if (!leaveRequest) return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    return NextResponse.json(leaveRequest, { status: 200 });
  } catch (error) {
    const { status, body } = handleApiError(error, 'Update Leave Request');
    return NextResponse.json(body, { status });
  }
}

// DELETE leave request (admin or owner)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const leaveRequest = await LeaveRequest.findById(params.id);
    if (!leaveRequest) return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    if (session.user.role !== 'admin' && leaveRequest.studentId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await LeaveRequest.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Leave request deleted' }, { status: 200 });
  } catch (error) {
    const { status, body } = handleApiError(error, 'Delete Leave Request');
    return NextResponse.json(body, { status });
  }
} 