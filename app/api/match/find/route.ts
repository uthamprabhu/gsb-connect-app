import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";

export async function POST() {
  try {
    await connectDb();
    const me = await getCurrentUser();

    if (me.freezeUntil && new Date(me.freezeUntil) > new Date()) {
      return NextResponse.json({ error: "You are frozen for 48 hours after a match." }, { status: 400 });
    }
    if ((me.attemptsLeft || 0) <= 0) {
      return NextResponse.json({ error: "No attempts left" }, { status: 400 });
    }
    if (!me.preference || !me.ageRange?.min || !me.ageRange?.max) {
      return NextResponse.json({ error: "Complete setup first" }, { status: 400 });
    }

    const excludedIds = [...(me.blockedUsers || []), ...(me.matchedWith || [])].map((id: unknown) => String(id));
    const query: Record<string, unknown> = {
      _id: { $ne: me._id, $nin: excludedIds },
      age: { $gte: me.ageRange.min, $lte: me.ageRange.max },
      activeMatch: null,
    };

    if (me.preference !== "any") query.gender = me.preference;
    const candidate = await User.findOne(query);
    if (!candidate) return NextResponse.json({ error: "No users available right now" }, { status: 404 });

    me.attemptsLeft -= 1;
    await me.save();

    if (!candidate.pendingRequests.some((id: unknown) => String(id) === String(me._id))) {
      candidate.pendingRequests.push(me._id);
      await candidate.save();
      await Notification.create({ userId: candidate._id, fromUserId: me._id, type: "match_request" });
    }

    return NextResponse.json({ ok: true, attemptsLeft: me.attemptsLeft });
  } catch (error) {
    return NextResponse.json({ error: "Match failed", details: String(error) }, { status: 500 });
  }
}
