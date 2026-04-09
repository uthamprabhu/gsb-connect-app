import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDb } from "@/lib/db";
import { User } from "@/models/User";
import { createSessionToken } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return NextResponse.json({ error: "idToken required" }, { status: 400 });

    const decoded = await adminAuth.verifyIdToken(idToken);
    await connectDb();
    const user = await User.findOneAndUpdate(
      { firebaseUid: decoded.uid },
      { $setOnInsert: { phone: decoded.phone_number || "", firebaseUid: decoded.uid } },
      { upsert: true, new: true },
    );

    const token = createSessionToken(String(user._id));
    return NextResponse.json({ user, token });
  } catch (error) {
    return NextResponse.json({ error: "OTP verification failed", details: String(error) }, { status: 401 });
  }
}
