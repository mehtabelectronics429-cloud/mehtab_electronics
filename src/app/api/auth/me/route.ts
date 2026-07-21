import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { json, errorResponse, ApiError } from "@/lib/api/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new ApiError(401, "Unauthorized");
    return json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        title: session.user.title,
        avatar: session.user.image,
        employeeId: session.user.employeeId ?? null,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
