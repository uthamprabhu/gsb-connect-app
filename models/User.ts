import { model, models, Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    firebaseUid: { type: String, required: true, unique: true },
    authProvider: { type: String, enum: ["google"], default: "google" },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true, default: null },
    displayName: { type: String, trim: true, default: "" },
    photoURL: { type: String, default: "" },
    instagramUsername: { type: String, default: "" },
    instagramUrl: { type: String, default: "" },
    gender: { type: String, enum: ["male", "female", "other"], default: null },
    preference: { type: String, enum: ["male", "female", "any"], default: null },
    age: { type: Number, default: null },
    ageRange: {
      min: { type: Number, default: 18 },
      max: { type: Number, default: 35 },
    },
    tags: { type: [String], default: [] },
    attemptsLeft: { type: Number, default: 3 },
    matchedWith: [{ type: Schema.Types.ObjectId, ref: "User" }],
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    pendingRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
    activeMatch: { type: Schema.Types.ObjectId, ref: "User", default: null },
    matchStartedAt: { type: Date, default: null },
    freezeUntil: { type: Date, default: null },
    termsAccepted: { type: Boolean, default: false },
    termsAcceptedAt: { type: Date, default: null },
    magicKey: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    fcmToken: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: string };

const existingUserModel = models.User;

// In dev, Next.js hot reload can keep an older compiled model around.
// Recompile if that stale model is missing latest auth fields.
if (
  existingUserModel?.schema.path("phone") ||
  !existingUserModel?.schema.path("termsAccepted") ||
  !existingUserModel?.schema.path("termsAcceptedAt")
) {
  delete models.User;
}

export const User = models.User || model("User", userSchema);
