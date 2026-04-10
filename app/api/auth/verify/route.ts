import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDb } from "@/lib/db";
import { User } from "@/models/User";
import { createSessionToken } from "@/lib/session";

let cleanupPromise: Promise<void> | null = null;

async function dropLegacyPhoneIndexes() {
  const indexes = await User.collection.indexes();
  const legacyIndexes = indexes.filter((index) => index.key && Object.prototype.hasOwnProperty.call(index.key, "phone"));

  await Promise.all(
    legacyIndexes.map(async (index) => {
      if (!index.name) return;
      await User.collection.dropIndex(index.name).catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.toLowerCase().includes("indexnotfound")) {
          throw error;
        }
      });
    }),
  );
}

async function ensureLegacyIndexesRemoved() {
  if (!cleanupPromise) {
    cleanupPromise = dropLegacyPhoneIndexes().catch((error) => {
      cleanupPromise = null;
      throw error;
    });
  }
  await cleanupPromise;
}

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return NextResponse.json({ error: "idToken required" }, { status: 400 });

    const decoded = await adminAuth.verifyIdToken(idToken);
    const provider = decoded.firebase.sign_in_provider;

    if (provider !== "google.com") {
      return NextResponse.json({ error: "Only Google sign-in is supported for Firebase authentication" }, { status: 400 });
    }

    await connectDb();
    await ensureLegacyIndexesRemoved();

    const user = await User.findOneAndUpdate(
      { firebaseUid: decoded.uid },
      {
        $set: {
          firebaseUid: decoded.uid,
          authProvider: "google",
          email: decoded.email || null,
          displayName: decoded.name || "",
          photoURL: decoded.picture || "",
        },
      },
      { upsert: true, returnDocument: "after" },
    );

    const token = createSessionToken(String(user._id));
    return NextResponse.json({ user, token });
  } catch (error) {
    return NextResponse.json({ error: "Google sign-in verification failed", details: String(error) }, { status: 401 });
  }
}
