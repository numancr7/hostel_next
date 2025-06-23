import { NextRequest, NextResponse } from 'next/server';
import LeaveRequest from '@/models/LeaveRequest';
import { connectToDatabase } from '@/lib/db';

// GET all leave requests
export async function GET() {
  try {
    await connectToDatabase();
    const leaveRequests = await LeaveRequest.find().populate('studentId');
    return NextResponse.json(leaveRequests);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leave requests' }, { status: 500 });
  }
}

// POST create a new leave request
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();
    // Validate required fields
    const { studentId, fromDate, toDate, reason } = data;
    if (!studentId || !fromDate || !toDate || !reason) {
      return NextResponse.json({ error: 'studentId, fromDate, toDate, and reason are required' }, { status: 400 });
    }
    // Create leave request with default status
    const leaveRequest = await LeaveRequest.create({
      studentId,
      fromDate,
      toDate,
      reason,
      status: 'pending',
    });
    return NextResponse.json(leaveRequest, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create leave request' }, { status: 500 });
  }
} 