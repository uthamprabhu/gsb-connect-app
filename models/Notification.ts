import { model, models, Schema, type InferSchemaType } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["match_request", "match_accepted"], required: true },
    fromUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export type NotificationDoc = InferSchemaType<typeof notificationSchema> & { _id: string };
export const Notification = models.Notification || model("Notification", notificationSchema);
