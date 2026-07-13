import bcrypt from "bcryptjs";
import { Employee } from "@/lib/db/models/Employee";
import { Profile } from "@/lib/db/models/Profile";
import { requireCap, json, errorResponse, softDeleteById, serializeDoc, ApiError } from "@/lib/api/http";
import { employeeInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    await requireCap("employees.view");
    await connectMongo();
    const doc = await Employee.findOne({ _id: params.id, ...notDeleted });
    if (!doc) throw new ApiError(404, "Employee not found");
    const profile = await Profile.findOne({ employeeId: doc._id, ...notDeleted });
    return json({ ...serializeDoc(doc), hasLogin: Boolean(profile?.passwordHash || profile?.googleId) });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    await requireCap("employees.manage");
    await connectMongo();
    const body = employeeInput.partial().parse(await req.json());
    const { password, ...rest } = body;

    const before = await Employee.findOne({ _id: params.id, ...notDeleted });
    if (!before) throw new ApiError(404, "Employee not found");

    const doc = await Employee.findOneAndUpdate({ _id: params.id, ...notDeleted }, rest, {
      returnDocument: "after",
    });
    if (!doc) throw new ApiError(404, "Employee not found");

    const profilePatch: Record<string, unknown> = {
      email: doc.email.toLowerCase(),
      name: doc.name,
      title: doc.title,
      employeeId: doc._id,
      role: "employee",
      deletedAt: null,
    };
    if (password) profilePatch.passwordHash = await bcrypt.hash(password, 10);

    // Match login profile by employee link or previous/current email (credentials use Profile.email).
    await Profile.findOneAndUpdate(
      {
        ...notDeleted,
        $or: [
          { employeeId: doc._id },
          { email: before.email.toLowerCase() },
          { email: doc.email.toLowerCase() },
        ],
      },
      profilePatch,
      { upsert: true, returnDocument: "after" }
    );

    return json({ ...serializeDoc(doc), hasLogin: true });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    await requireCap("employees.manage");
    await connectMongo();
    await softDeleteById(Employee, params.id);
    await Profile.findOneAndUpdate(
      { employeeId: params.id, ...notDeleted },
      { deletedAt: new Date(), passwordHash: null }
    );
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
