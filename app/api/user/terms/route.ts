import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    await connectDb();
    const user = await getCurrentUser();
    const body = await req.json().catch(() => ({}));
    const accepted = Boolean(body?.accepted);

    if (!accepted) {
      return NextResponse.json({ error: "accepted=true is required" }, { status: 400 });
    }

    if (!user.termsAccepted) {
      user.termsAccepted = true;
      user.termsAcceptedAt = new Date();
      await user.save();
    }

    const latestUser = await (await import("@/models/User")).User.findById(user._id).lean();
    return NextResponse.json({ ok: true, user: latestUser });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update terms acceptance", details: String(error) }, { status: 500 });
  }
}
