import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { parseInstagram } from "@/lib/instagram";

export async function POST(req: Request) {
  try {
    await connectDb();
    const user = await getCurrentUser();
    const { instagramInput, magicKey, gender, preference, age, ageRange, tags } = await req.json();

    if (magicKey) {
      const normalized = String(magicKey).toLowerCase().trim();
      const duplicate = await (await import("@/models/User")).User.findOne({
        magicKey: normalized,
        _id: { $ne: user._id },
      });
      if (duplicate) return NextResponse.json({ error: "Magic key already taken" }, { status: 409 });
      user.magicKey = normalized;
    }

    if (instagramInput) {
      const { instagramUsername, instagramUrl } = parseInstagram(instagramInput);
      user.instagramUsername = instagramUsername;
      user.instagramUrl = instagramUrl;
    }

    if (gender) user.gender = gender;
    if (preference) user.preference = preference;
    if (age) user.age = age;
    if (ageRange) user.ageRange = ageRange;
    if (Array.isArray(tags)) user.tags = tags.slice(0, 5);

    await user.save();
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: "Setup failed", details: String(error) }, { status: 400 });
  }
}
