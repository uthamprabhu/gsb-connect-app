import { model, models, Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    phone: { type: String, required: true, unique: true },
    firebaseUid: { type: String, required: true, unique: true },
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
    magicKey: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    fcmToken: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: string };
export const User = models.User || model("User", userSchema);
