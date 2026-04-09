import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";
import { sendPushNotification } from "@/lib/sendNotification";

export async function POST(req: Request) {
  try {
    await connectDb();
    const me = await getCurrentUser();
    const { fromUserId } = await req.json();

    const hasPending = (me.pendingRequests || []).some((id: unknown) => String(id) === String(fromUserId));
    if (!hasPending) return NextResponse.json({ error: "No pending request found" }, { status: 404 });

    const fromUser = await User.findById(fromUserId);
    if (!fromUser) return NextResponse.json({ error: "Requester not found" }, { status: 404 });

    const freezeUntil = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const now = new Date();

    me.pendingRequests = me.pendingRequests.filter((id: unknown) => String(id) !== String(fromUser._id));
    me.activeMatch = fromUser._id;
    me.matchStartedAt = now;
    me.freezeUntil = freezeUntil;
    if (!me.matchedWith.some((id: unknown) => String(id) === String(fromUser._id))) me.matchedWith.push(fromUser._id);

    fromUser.activeMatch = me._id;
    fromUser.matchStartedAt = now;
    fromUser.freezeUntil = freezeUntil;
    if (!fromUser.matchedWith.some((id: unknown) => String(id) === String(me._id))) fromUser.matchedWith.push(me._id);

    await Promise.all([
      me.save(),
      fromUser.save(),
      Notification.create({ userId: fromUser._id, fromUserId: me._id, type: "match_accepted" }),
    ]);

    await sendPushNotification(
      fromUser.fcmToken,
      "It’s a match 🎉",
      "You both matched! Tap to reveal and connect.",
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Accept failed", details: String(error) }, { status: 500 });
  }
}
