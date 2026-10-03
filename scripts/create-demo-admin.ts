/**
 * Create (or reset) a single demo admin login without touching any other data.
 * Unlike scripts/seed.ts this never deletes anything — it upserts one profile.
 *
 * Usage:
 *   npx tsx scripts/create-demo-admin.ts
 *   DEMO_EMAIL=someone@example.com DEMO_PASSWORD=secret npx tsx scripts/create-demo-admin.ts
 *   npx tsx scripts/create-demo-admin.ts --remove   # soft-delete the demo login
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config(); // fallback .env
import crypto from "node:crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mehtab_electronics";
const EMAIL = (process.env.DEMO_EMAIL || "demo@mehtabelectronics.com")
  .trim()
  .toLowerCase();
const NAME = process.env.DEMO_NAME || "Demo Admin";
const PASSWORD =
  process.env.DEMO_PASSWORD ||
  `Demo-${crypto.randomBytes(6).toString("base64url")}`;
console.log(`Using demo login: ${EMAIL} / ${PASSWORD}`);
async function main() {
  await mongoose.connect(URI);
  console.log("Connected to", URI.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@"));
  const profiles = mongoose.connection.db!.collection("profiles");

  if (process.argv.includes("--remove")) {
    const res = await profiles.updateOne(
      { email: EMAIL },
      {
        $set: {
          deletedAt: new Date(),
          passwordHash: null,
          updatedAt: new Date(),
        },
      },
    );
    console.log(
      res.matchedCount ? `Disabled ${EMAIL}` : `No profile for ${EMAIL}`,
    );
    return;
  }

  const existing = await profiles.findOne({ email: EMAIL });
  if (existing && existing.title !== "Demo account") {
    throw new Error(
      `${EMAIL} already belongs to a real profile — pick another DEMO_EMAIL.`,
    );
  }

  await profiles.updateOne(
    { email: EMAIL },
    {
      $set: {
        name: NAME,
        role: "admin",
        title: "Demo account",
        passwordHash: await bcrypt.hash(PASSWORD, 10),
        deletedAt: null,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        email: EMAIL,
        googleId: null,
        employeeId: null,
        avatar: "",
        createdAt: new Date(),
      },
    },
    { upsert: true },
  );

  console.log(`\nDemo admin ${existing ? "reset" : "created"}:`);
  console.log(
    `  URL:      ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/admin/login`,
  );
  console.log(`  Email:    ${EMAIL}`);
  console.log(`  Password: ${PASSWORD}\n`);
}

main()
  .catch((err) => {
    console.error(err.message || err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
