import { headers } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { verifySessionToken } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { User } from "@/models/User";

export async function getCurrentUser() {
  const authHeader = (await headers()).get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) throw new Error("Unauthorized");

  await connectDb();

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) throw new Error("User not found");
    return user;
  } catch {
    const userId = verifySessionToken(token);
    if (!userId) throw new Error("Unauthorized");
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    return user;
  }
}
