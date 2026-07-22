import { Types } from "mongoose";
import { Activity, type IActivity } from "@/lib/db/models/Activity";

type ActivityKind = IActivity["kind"];

export async function logActivity(opts: {
  actor: string;
  actorId?: string | null;
  action: string;
  target: string;
  kind: ActivityKind;
}): Promise<void> {
  try {
    await Activity.create({
      actor: opts.actor,
      actorId: opts.actorId ? new Types.ObjectId(opts.actorId) : null,
      action: opts.action,
      target: opts.target,
      kind: opts.kind,
      at: new Date(),
    });
  } catch (err) {
    // Activity logging must never break the primary write path.
    console.error("logActivity failed:", err);
  }
}
