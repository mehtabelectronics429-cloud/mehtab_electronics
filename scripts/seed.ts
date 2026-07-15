/**
 * Seed MongoDB with demo operational data + NextAuth profiles.
 * Usage: npx tsx scripts/seed.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config(); // fallback .env
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mehtab_electronics";

async function main() {
  console.log(
    "Seeding MongoDB...",
    URI.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@"),
  );
  await mongoose.connect(URI);
  const redacted = URI.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");
  console.log("Connected to", redacted);

  const db = mongoose.connection.db!;
  // Prefer explicit DB name; Atlas default path "/" lands on "test".
  if (db.databaseName === "test") {
    console.warn(
      'Warning: connected to database "test". Set path /mehtab_electronics in MONGODB_URI.',
    );
  }

  const cols = [
    "profiles",
    "customers",
    "employees",
    "products",
    "materials",
    "installations",
    "invoices",
    "ledgerentries",
    "whatsappmessages",
    "jobs",
    "settings",
    "activities",
  ];
  for (const c of cols) {
    try {
      await db.collection(c).deleteMany({});
    } catch {
      /* ignore */
    }
  }

  // Drop legacy Supabase index if present
  try {
    await db.collection("profiles").dropIndex("supabaseUserId_1");
    console.log("Dropped legacy index supabaseUserId_1");
  } catch {
    /* ignore */
  }

  const employees = await db.collection("employees").insertMany([
    {
      name: "Ahmed Sheikh",
      email: "staff@mehtab.pk",
      phone: "+92 300 5551122",
      title: "Installation Technician",
      active: true,
      assigned: 4,
      completed: 38,
      rating: 4.8,
      joinedAt: new Date("2022-06-01"),
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Fatima Noor",
      email: "fatima@mehtab.pk",
      phone: "+92 322 5553344",
      title: "Security Systems Lead",
      active: true,
      assigned: 2,
      completed: 51,
      rating: 4.9,
      joinedAt: new Date("2021-09-15"),
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Hassan Raza",
      email: "hassan@mehtab.pk",
      phone: "+92 333 5556677",
      title: "Solar Engineer",
      active: true,
      assigned: 3,
      completed: 44,
      rating: 4.7,
      joinedAt: new Date("2020-03-10"),
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const empIds = Object.values(employees.insertedIds);

  const customers = await db.collection("customers").insertMany([
    {
      name: "Ayesha Khan",
      phone: "+92 300 1112233",
      whatsapp: "+92 300 1112233",
      address: "DHA Phase 6, Lahore",
      mapUrl: "https://maps.google.com",
      notes: "Prefers weekend visits.",
      balance: 84000,
      installations: 2,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Bilal Ahmed",
      phone: "+92 321 4455667",
      whatsapp: "+92 321 4455667",
      address: "Gulberg III, Lahore",
      balance: 0,
      installations: 1,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Sana Malik",
      phone: "+92 333 7788990",
      whatsapp: "+92 333 7788990",
      address: "Model Town, Lahore",
      notes: "Corporate account.",
      balance: 156000,
      installations: 3,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Usman Tariq",
      phone: "+92 301 2223344",
      whatsapp: "+92 301 2223344",
      address: "Bahria Town, Lahore",
      balance: 22000,
      installations: 1,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const custIds = Object.values(customers.insertedIds);

  await db.collection("products").insertMany([
    {
      category: "Solar Panels",
      brand: "Canadian Solar",
      model: "CS7L-555MS",
      sku: "SP-555-CS",
      purchasePrice: 24000,
      sellingPrice: 31000,
      warranty: "25 years",
      stock: 120,
      description: "555W mono-PERC",
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      category: "Solar Inverters",
      brand: "Solis",
      model: "S6-EH3P10K",
      sku: "INV-10K-SL",
      purchasePrice: 210000,
      sellingPrice: 265000,
      warranty: "10 years",
      stock: 8,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      category: "Batteries",
      brand: "Pylontech",
      model: "US5000",
      sku: "BAT-US5000",
      purchasePrice: 165000,
      sellingPrice: 205000,
      warranty: "10 years",
      stock: 5,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      category: "CCTV Cameras",
      brand: "Hikvision",
      model: "DS-2CD2387G2",
      sku: "CAM-4K-HK",
      purchasePrice: 18000,
      sellingPrice: 24500,
      warranty: "3 years",
      stock: 60,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      category: "NVR",
      brand: "Dahua",
      model: "NVR5216",
      sku: "NVR-16-DH",
      purchasePrice: 45000,
      sellingPrice: 58000,
      warranty: "3 years",
      stock: 3,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  await db.collection("materials").insertMany([
    {
      name: "Cable 2.5mm",
      unit: "m",
      opening: 5000,
      issued: 1200,
      used: 1100,
      returned: 60,
      damaged: 40,
      reorder: 800,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "PVC Pipe",
      unit: "m",
      opening: 2000,
      issued: 600,
      used: 560,
      returned: 20,
      damaged: 20,
      reorder: 400,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "MC4 Connector",
      unit: "pcs",
      opening: 1200,
      issued: 400,
      used: 380,
      returned: 10,
      damaged: 10,
      reorder: 300,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  await db.collection("installations").insertMany([
    {
      ref: "INST-1042",
      customerId: custIds[0],
      employeeId: empIds[0],
      type: "Hybrid Solar 10kW",
      status: "in_progress",
      date: new Date("2026-07-08"),
      amount: 1650000,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      ref: "INST-1043",
      customerId: custIds[1],
      employeeId: empIds[1],
      type: "8-Camera CCTV",
      status: "submitted",
      date: new Date("2026-07-06"),
      amount: 385000,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      ref: "INST-1044",
      customerId: custIds[2],
      employeeId: empIds[2],
      type: "On-Grid Solar 12kW",
      status: "assigned",
      date: new Date("2026-07-10"),
      amount: 1980000,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      ref: "INST-1045",
      customerId: custIds[3],
      employeeId: empIds[0],
      type: "Smart Home Basic",
      status: "pending",
      date: new Date("2026-07-12"),
      amount: 420000,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  await db.collection("invoices").insertMany([
    {
      number: "INV-2041",
      customerId: custIds[0],
      employeeId: empIds[0],
      amount: 1650000,
      paid: 1000000,
      status: "approved",
      date: new Date("2026-07-02"),
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      number: "INV-2042",
      customerId: custIds[1],
      employeeId: empIds[1],
      amount: 385000,
      paid: 0,
      status: "pending",
      date: new Date("2026-07-06"),
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  await db.collection("ledgerentries").insertMany([
    {
      customerId: custIds[0],
      employeeId: empIds[0],
      type: "invoice",
      amount: 1650000,
      status: "approved",
      date: new Date("2026-07-02"),
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      customerId: custIds[0],
      employeeId: empIds[0],
      type: "payment",
      amount: -1000000,
      status: "approved",
      date: new Date("2026-07-03"),
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      customerId: custIds[1],
      employeeId: empIds[1],
      type: "payment",
      amount: -50000,
      status: "pending",
      date: new Date("2026-07-06"),
      note: "Advance, awaiting approval",
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  await db.collection("settings").insertMany([
    {
      key: "company",
      value: {
        name: "Mehtab Electronics",
        phone: "+92 300 1234567",
        email: "hello@mehtabelectronics.pk",
        city: "Lahore",
        address: "Hall Road Electronics Market, Lahore, Pakistan",
      },
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  await db.collection("activities").insertMany([
    {
      actor: "Ahmed Sheikh",
      action: "submitted installation",
      target: "INST-1043",
      kind: "install",
      at: new Date("2026-07-06T09:12:00"),
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      actor: "System",
      action: "low stock alert",
      target: "NVR5216 (3 left)",
      kind: "stock",
      at: new Date("2026-07-06T08:40:00"),
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  // NextAuth login profiles (credentials stored in Mongo)
  const adminHash = await bcrypt.hash("admin123", 10);
  const staffHash = await bcrypt.hash("developer123", 10);

  await db.collection("profiles").insertMany([
    {
      email: "admin@mehtabelectronics.com",
      name: "Imran Mehtab",
      role: "admin",
      title: "Administrator",
      passwordHash: adminHash,
      googleId: null,
      employeeId: null,
      avatar: "",
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      email: "developer@mehtabelectronics.com",
      name: "M Umar Liaqat",
      role: "admin",
      title: "Software Developer",
      passwordHash: staffHash,
      googleId: null,
      employeeId: null,
      avatar: "",
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  console.log(
    "Auth profiles ready: admin@mehtab.pk / admin123, staff@mehtab.pk / staff123",
  );
  console.log("Seed complete.");
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
