import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { User } from "@/models/User";

export async function GET() {
  try {
    await connectDb();
    const user = await getCurrentUser();
    const freezeExpired = !!user.freezeUntil && new Date(user.freezeUntil).getTime() <= Date.now();
    if (freezeExpired) {
      user.freezeUntil = null;
      user.activeMatch = null;
      user.matchStartedAt = null;
      await user.save();
    }

    const populatedUser = await User.findById(user._id).populate("activeMatch", "instagramUsername instagramUrl").lean();
    const isFreezeActive =
      !!populatedUser?.freezeUntil && new Date(String(populatedUser.freezeUntil)).getTime() > Date.now();
    const [totalUsers, maleCount, femaleCount] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ gender: "male" }),
      User.countDocuments({ gender: "female" }),
    ]);

    return NextResponse.json({
      user: {
        ...populatedUser,
        isFreezeActive,
      },
      stats: {
        totalUsers,
        maleCount,
        femaleCount,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
