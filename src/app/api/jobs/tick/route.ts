import { tickJobs, ensurePoller } from "@/lib/queue/enqueue";
import { json, errorResponse, requireCap } from "@/lib/api/http";

export async function POST() {
  try {
    await requireCap("dashboard.view");
    ensurePoller();
    const result = await tickJobs(10);
    return json(result);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function GET() {
  return POST();
}
