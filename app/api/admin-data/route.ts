import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import Room from "@/models/Room";
import LeaveRequest from "@/models/LeaveRequest";
import Payment from "@/models/Payment";
import { connectToDatabase } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  try {
    const [users, rooms, leaveRequests, payments] = await Promise.all([
      User.find().lean(),
      Room.find().lean(),
      LeaveRequest.find().lean(),
      Payment.find().lean(),
    ]);

    return NextResponse.json({ users, rooms, leaveRequests, payments });
  } catch (error) {
    console.error("Error fetching admin data:", error);
    return NextResponse.json(
      { message: "Failed to fetch admin data" },
      { status: 500 }
    );
  }
} 