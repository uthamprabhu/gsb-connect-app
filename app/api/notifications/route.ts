import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Notification } from "@/models/Notification";
import { User } from "@/models/User";

export async function GET() {
  try {
    await connectDb();
    const me = await getCurrentUser();
    const notifications = await Notification.find({ userId: me._id }).sort({ createdAt: -1 }).limit(30).lean();

    const fromUserIds = notifications.map((n) => n.fromUserId);
    const users = await User.find({ _id: { $in: fromUserIds } })
      .select("instagramUsername displayName")
      .lean();
    const userMap = Object.fromEntries(users.map((u) => [String(u._id), u]));

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        ...n,
        fromUser: userMap[String(n.fromUserId)] || null,
      })),
      pendingRequests: me.pendingRequests || [],
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
