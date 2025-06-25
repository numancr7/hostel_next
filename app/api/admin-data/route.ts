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

    // Map _id to id for all entities for frontend consistency
    const mappedUsers = users.map(user => ({ ...user, id: String(user._id) }));
    const mappedRooms = rooms.map(room => ({ ...room, id: String(room._id) }));
    const mappedLeaveRequests = leaveRequests.map(lr => ({ ...lr, id: String(lr._id) }));
    const mappedPayments = payments.map(payment => ({ ...payment, id: String(payment._id) }));

    return NextResponse.json({ users: mappedUsers, rooms: mappedRooms, leaveRequests: mappedLeaveRequests, payments: mappedPayments });
  } catch (error) {
    console.error("Error fetching admin data:", error);
    return NextResponse.json(
      { message: "Failed to fetch admin data" },
      { status: 500 }
    );
  }
} 