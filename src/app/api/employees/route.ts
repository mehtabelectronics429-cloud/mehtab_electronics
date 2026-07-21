import bcrypt from "bcryptjs";
import { Employee } from "@/lib/db/models/Employee";
import { Profile } from "@/lib/db/models/Profile";
import { requireCap, json, errorResponse, parsePagination, paginate, serializeDoc, ApiError } from "@/lib/api/http";
import { employeeCreateInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";

export async function GET(req: Request) {
  try {
    await requireCap("employees.view");
    await connectMongo();
    const p = parsePagination(new URL(req.url));
    const filter: Record<string, unknown> = {};
    if (p.q) {
      filter.$or = [
        { name: new RegExp(p.q, "i") },
        { email: new RegExp(p.q, "i") },
        { title: new RegExp(p.q, "i") },
      ];
    }
    return json(await paginate(Employee, filter, p));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireCap("employees.manage");
    await connectMongo();
    const body = employeeCreateInput.parse(await req.json());
    const { password, ...rest } = body;

    const existing = await Employee.findOne({ email: rest.email.toLowerCase(), ...notDeleted });
    if (existing) throw new ApiError(400, "Employee email already exists");

    const doc = await Employee.create({ ...rest, joinedAt: new Date() });

    if (!password) throw new ApiError(400, "Password is required for dashboard login");
    const passwordHash = await bcrypt.hash(password, 10);
    await Profile.findOneAndUpdate(
      { email: rest.email.toLowerCase() },
      {
        email: rest.email.toLowerCase(),
        name: rest.name,
        role: rest.role || "technician",
        title: rest.title,
        employeeId: doc._id,
        passwordHash,
        deletedAt: null,
      },
      { upsert: true, returnDocument: 'after' }
    );

    return json({ ...serializeDoc(doc), hasLogin: true }, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
