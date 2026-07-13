import { Schema, type Model, type Types } from "mongoose";
import { registerModel } from "@/lib/db/registerModel";

export interface IActivity {
  _id: Types.ObjectId;
  actor: string;
  actorId: Types.ObjectId | null;
  action: string;
  target: string;
  kind: "install" | "invoice" | "payment" | "stock" | "customer" | "approval" | "whatsapp";
  at: Date;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IActivity>(
  {
    actor: { type: String, required: true },
    actorId: { type: Schema.Types.ObjectId, ref: "Profile", default: null },
    action: { type: String, required: true },
    target: { type: String, required: true },
    kind: {
      type: String,
      enum: ["install", "invoice", "payment", "stock", "customer", "approval", "whatsapp"],
      required: true,
    },
    at: { type: Date, default: Date.now, index: true },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

export const Activity: Model<IActivity> = registerModel<IActivity>("Activity", schema);
