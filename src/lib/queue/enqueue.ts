import { connectMongo } from "@/lib/db/mongodb";
import { Job, type JobType } from "@/lib/db/models/Job";
import { processJob } from "./handlers";

declare global {
  // eslint-disable-next-line no-var
  var __mehtabJobPoller: NodeJS.Timeout | undefined;
  // eslint-disable-next-line no-var
  var __mehtabJobPolling: boolean | undefined;
}

/** Enqueue a background job and kick the poller. */
export async function enqueueJob(type: JobType, payload: Record<string, unknown> = {}, delayMs = 0) {
  await connectMongo();
  const job = await Job.create({
    type,
    payload,
    status: "pending",
    scheduledAt: new Date(Date.now() + delayMs),
  });
  void tickJobs(3);
  ensurePoller();
  return job;
}

/** Atomically claim and process up to `limit` pending jobs. */
export async function tickJobs(limit = 5) {
  if (global.__mehtabJobPolling) return { processed: 0 };
  global.__mehtabJobPolling = true;
  let processed = 0;
  try {
    await connectMongo();
    for (let i = 0; i < limit; i++) {
      const job = await Job.findOneAndUpdate(
        { status: "pending", scheduledAt: { $lte: new Date() }, deletedAt: null },
        { $set: { status: "processing" }, $inc: { attempts: 1 } },
        { sort: { scheduledAt: 1 }, returnDocument: 'after' }
      );
      if (!job) break;
      try {
        const result = await processJob(job.type, (job.payload || {}) as Record<string, unknown>);
        job.status = "completed";
        job.processedAt = new Date();
        job.result = (result as Record<string, unknown>) ?? null;
        job.error = "";
        await job.save();
        processed++;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Job failed";
        const fail = job.attempts >= job.maxAttempts;
        job.status = fail ? "failed" : "pending";
        job.error = message;
        job.scheduledAt = new Date(Date.now() + Math.min(60_000, 2000 * 2 ** job.attempts));
        if (fail) job.processedAt = new Date();
        await job.save();
        processed++;
      }
    }
  } finally {
    global.__mehtabJobPolling = false;
  }
  return { processed };
}

/** Lightweight in-process poller (dev / long-lived Node). Safe no-op if already running. */
export function ensurePoller() {
  if (global.__mehtabJobPoller) return;
  if (typeof setInterval === "undefined") return;
  global.__mehtabJobPoller = setInterval(() => {
    void tickJobs(5);
  }, 4000);
  global.__mehtabJobPoller.unref?.();
}
