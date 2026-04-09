import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDb();
    const me = await getCurrentUser();
    const { fromUserId } = await req.json();
    const fromUser = await User.findById(fromUserId);
    if (!fromUser) return NextResponse.json({ error: "Requester not found" }, { status: 404 });

    me.pendingRequests = me.pendingRequests.filter((id: unknown) => String(id) !== String(fromUserId));
    if (!me.blockedUsers.some((id: unknown) => String(id) === String(fromUserId))) me.blockedUsers.push(fromUserId);
    if (!fromUser.blockedUsers.some((id: unknown) => String(id) === String(me._id))) fromUser.blockedUsers.push(me._id);

    await Promise.all([me.save(), fromUser.save()]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Reject failed", details: String(error) }, { status: 500 });
  }
}
