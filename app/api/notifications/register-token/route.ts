import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDb();
    const user = await getCurrentUser();
    const { fcmToken } = await req.json();
    if (!fcmToken || typeof fcmToken !== "string") {
      return NextResponse.json({ error: "fcmToken is required" }, { status: 400 });
    }
    user.fcmToken = fcmToken;
    await user.save();
    console.info("[FCM] Token saved for user:", { userId: String(user._id), tokenPreview: `${fcmToken.slice(0, 12)}...` });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to register token", details: String(error) }, { status: 500 });
  }
}
