import { connectToDatabase } from "@/lib/db";
import User from "@/models/User"; // assuming you have a Mongoose model

export async function getUserByEmail(email: string) {
  await connectToDatabase();
  const user = await User.findOne({ email });
  return user;
}
