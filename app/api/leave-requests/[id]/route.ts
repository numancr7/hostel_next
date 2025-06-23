import { NextRequest, NextResponse } from 'next/server';
import LeaveRequest from '@/models/LeaveRequest';
import { connectToDatabase } from '@/lib/db';

// GET single leave request
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const leaveRequest = await LeaveRequest.findById(params.id).populate('studentId');
    if (!leaveRequest) return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    return NextResponse.json(leaveRequest);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leave request' }, { status: 500 });
  }
}

// PUT update leave request (only status and reason are updatable)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const data = await req.json();
    // Only allow updating status and reason
    const updateFields: any = {};
    if (data.status) updateFields.status = data.status;
    if (data.reason) updateFields.reason = data.reason;
    const leaveRequest = await LeaveRequest.findByIdAndUpdate(params.id, updateFields, { new: true });
    if (!leaveRequest) return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    return NextResponse.json(leaveRequest);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update leave request' }, { status: 500 });
  }
}

// DELETE leave request
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const leaveRequest = await LeaveRequest.findByIdAndDelete(params.id);
    if (!leaveRequest) return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    return NextResponse.json({ message: 'Leave request deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete leave request' }, { status: 500 });
  }
} 