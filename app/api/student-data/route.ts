import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Room from "@/models/Room";
import LeaveRequest from "@/models/LeaveRequest";
import Payment from "@/models/Payment";
import { connectToDatabase } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "student") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  try {
    const [rooms, leaveRequests, payments] = await Promise.all([
      Room.find({ occupants: session.user.id }).lean(),
      LeaveRequest.find({ studentId: session.user.id }).lean(),
      Payment.find({ studentId: session.user.id }).lean(),
    ]);

    return NextResponse.json({ rooms, leaveRequests, payments });
  } catch (error) {
    console.error("Error fetching student data:", error);
    return NextResponse.json(
      { message: "Failed to fetch student data" },
      { status: 500 }
    );
  }
} 