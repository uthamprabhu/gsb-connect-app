import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { User } from "@/models/User";
import { createSessionToken } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { magicKey } = await req.json();
    if (!magicKey) return NextResponse.json({ error: "magicKey required" }, { status: 400 });
    await connectDb();
    const user = await User.findOne({ magicKey: String(magicKey).toLowerCase().trim() });
    if (!user) return NextResponse.json({ error: "Invalid magic key" }, { status: 404 });
    const token = createSessionToken(String(user._id));
    return NextResponse.json({ user, token });
  } catch (error) {
    return NextResponse.json({ error: "Magic login failed", details: String(error) }, { status: 500 });
  }
}
