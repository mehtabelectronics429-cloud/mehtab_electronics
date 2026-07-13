import { Schema, type Model, type Types } from "mongoose";
import { registerModel } from "@/lib/db/registerModel";

export interface IWhatsAppMessage {
  _id: Types.ObjectId;
  customerId: Types.ObjectId | null;
  /** Admin / business number (display “from”) */
  fromPhone: string;
  toName: string;
  toPhone: string;
  /** direct = wa.me deep link · business = Cloud API queue */
  channel: "direct" | "business";
  /** Event key e.g. payment_reminder */
  event: string;
  template: string;
  body: string;
  /** Prefilled wa.me URL when channel is direct */
  waUrl: string;
  status: "queued" | "sent" | "delivered" | "read" | "failed";
  jobId: Types.ObjectId | null;
  error: string;
  sentAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IWhatsAppMessage>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", default: null, index: true },
    fromPhone: { type: String, default: "", index: true },
    toName: { type: String, required: true },
    toPhone: { type: String, required: true, index: true },
    channel: {
      type: String,
      enum: ["direct", "business"],
      default: "direct",
      index: true,
    },
    event: { type: String, default: "", index: true },
    template: { type: String, required: true },
    body: { type: String, default: "" },
    waUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["queued", "sent", "delivered", "read", "failed"],
      default: "queued",
      index: true,
    },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", default: null },
    error: { type: String, default: "" },
    sentAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

export const WhatsAppMessage: Model<IWhatsAppMessage> = registerModel<IWhatsAppMessage>(
  "WhatsAppMessage",
  schema
);
