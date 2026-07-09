import type {
  Customer, Employee, Product, Material, Installation, Invoice, LedgerEntry, ActivityItem, AppNotification,
} from "./types";

export const CUSTOMERS: Customer[] = [
  { id: "c1", name: "Ayesha Khan", phone: "+92 300 1112233", whatsapp: "+92 300 1112233", address: "DHA Phase 6, Lahore", mapUrl: "https://maps.google.com", balance: 84000, installations: 2, createdAt: "2025-03-12", notes: "Prefers weekend visits." },
  { id: "c2", name: "Bilal Ahmed", phone: "+92 321 4455667", whatsapp: "+92 321 4455667", address: "Gulberg III, Lahore", balance: 0, installations: 1, createdAt: "2025-04-02" },
  { id: "c3", name: "Sana Malik", phone: "+92 333 7788990", whatsapp: "+92 333 7788990", address: "Model Town, Lahore", balance: 156000, installations: 3, createdAt: "2025-01-20", notes: "Corporate account." },
  { id: "c4", name: "Usman Tariq", phone: "+92 301 2223344", whatsapp: "+92 301 2223344", address: "Bahria Town, Lahore", balance: 22000, installations: 1, createdAt: "2025-05-08" },
  { id: "c5", name: "Hamza Raza", phone: "+92 345 6677889", whatsapp: "+92 345 6677889", address: "Johar Town, Lahore", balance: 0, installations: 2, createdAt: "2025-02-15" },
];

export const EMPLOYEES: Employee[] = [
  { id: "e1", name: "Ahmed Sheikh", email: "staff@mehtab.pk", phone: "+92 300 5551122", title: "Installation Technician", active: true, assigned: 4, completed: 38, rating: 4.8, joinedAt: "2022-06-01" },
  { id: "e2", name: "Fatima Noor", email: "fatima@mehtab.pk", phone: "+92 322 5553344", title: "Security Systems Lead", active: true, assigned: 2, completed: 51, rating: 4.9, joinedAt: "2021-09-15" },
  { id: "e3", name: "Hassan Raza", email: "hassan@mehtab.pk", phone: "+92 333 5556677", title: "Solar Engineer", active: true, assigned: 3, completed: 44, rating: 4.7, joinedAt: "2020-03-10" },
  { id: "e4", name: "Zoya Ali", email: "zoya@mehtab.pk", phone: "+92 301 5558899", title: "Automation Specialist", active: false, assigned: 0, completed: 29, rating: 4.6, joinedAt: "2023-01-05" },
];

export const PRODUCTS: Product[] = [
  { id: "p1", category: "Solar Panels", brand: "Canadian Solar", model: "CS7L-555MS", sku: "SP-555-CS", purchasePrice: 24000, sellingPrice: 31000, warranty: "25 years", stock: 120, description: "555W mono-PERC" },
  { id: "p2", category: "Solar Inverters", brand: "Solis", model: "S6-EH3P10K", sku: "INV-10K-SL", purchasePrice: 210000, sellingPrice: 265000, warranty: "10 years", stock: 8 },
  { id: "p3", category: "Batteries", brand: "Pylontech", model: "US5000", sku: "BAT-US5000", purchasePrice: 165000, sellingPrice: 205000, warranty: "10 years", stock: 5 },
  { id: "p4", category: "CCTV Cameras", brand: "Hikvision", model: "DS-2CD2387G2", sku: "CAM-4K-HK", purchasePrice: 18000, sellingPrice: 24500, warranty: "3 years", stock: 60 },
  { id: "p5", category: "NVR", brand: "Dahua", model: "NVR5216", sku: "NVR-16-DH", purchasePrice: 45000, sellingPrice: 58000, warranty: "3 years", stock: 3 },
  { id: "p6", category: "Networking Equipment", brand: "TP-Link", model: "Deco X60", sku: "NET-X60-TP", purchasePrice: 32000, sellingPrice: 41000, warranty: "2 years", stock: 24 },
];

export const MATERIALS: Material[] = [
  { id: "m1", name: "Cable 2.5mm", unit: "m", opening: 5000, issued: 1200, used: 1100, returned: 60, damaged: 40, reorder: 800 },
  { id: "m2", name: "PVC Pipe", unit: "m", opening: 2000, issued: 600, used: 560, returned: 20, damaged: 20, reorder: 400 },
  { id: "m3", name: "RJ45 Connector", unit: "pcs", opening: 3000, issued: 900, used: 850, returned: 0, damaged: 50, reorder: 500 },
  { id: "m4", name: "MC4 Connector", unit: "pcs", opening: 1200, issued: 400, used: 380, returned: 10, damaged: 10, reorder: 300 },
  { id: "m5", name: "Breaker 32A", unit: "pcs", opening: 300, issued: 120, used: 110, returned: 5, damaged: 5, reorder: 100 },
  { id: "m6", name: "Mounting Structure", unit: "set", opening: 150, issued: 70, used: 68, returned: 0, damaged: 2, reorder: 60 },
];

export const INSTALLATIONS: Installation[] = [
  { id: "i1", ref: "INST-1042", customer: "Ayesha Khan", employee: "Ahmed Sheikh", type: "Hybrid Solar 10kW", status: "in_progress", date: "2026-07-08", amount: 1650000 },
  { id: "i2", ref: "INST-1043", customer: "Bilal Ahmed", employee: "Fatima Noor", type: "8-Camera CCTV", status: "submitted", date: "2026-07-06", amount: 385000 },
  { id: "i3", ref: "INST-1044", customer: "Sana Malik", employee: "Hassan Raza", type: "On-Grid Solar 12kW", status: "assigned", date: "2026-07-10", amount: 1980000 },
  { id: "i4", ref: "INST-1045", customer: "Usman Tariq", employee: "Ahmed Sheikh", type: "Smart Home Basic", status: "pending", date: "2026-07-12", amount: 420000 },
  { id: "i5", ref: "INST-1041", customer: "Hamza Raza", employee: "Fatima Noor", type: "Electric Fencing", status: "completed", date: "2026-07-01", amount: 240000 },
  { id: "i6", ref: "INST-1040", customer: "Sana Malik", employee: "Hassan Raza", type: "UPS + Battery Bank", status: "approved", date: "2026-06-28", amount: 560000 },
];

export const INVOICES: Invoice[] = [
  { id: "v1", number: "INV-2041", customer: "Ayesha Khan", amount: 1650000, paid: 1000000, status: "approved", date: "2026-07-02" },
  { id: "v2", number: "INV-2042", customer: "Bilal Ahmed", amount: 385000, paid: 0, status: "pending", date: "2026-07-06" },
  { id: "v3", number: "INV-2043", customer: "Sana Malik", amount: 560000, paid: 560000, status: "approved", date: "2026-06-29" },
  { id: "v4", number: "INV-2044", customer: "Usman Tariq", amount: 420000, paid: 100000, status: "draft", date: "2026-07-05" },
];

export const LEDGER: LedgerEntry[] = [
  { id: "l1", customer: "Ayesha Khan", type: "invoice", amount: 1650000, status: "approved", date: "2026-07-02" },
  { id: "l2", customer: "Ayesha Khan", type: "payment", amount: -1000000, status: "approved", date: "2026-07-03" },
  { id: "l3", customer: "Sana Malik", type: "invoice", amount: 560000, status: "approved", date: "2026-06-29" },
  { id: "l4", customer: "Bilal Ahmed", type: "payment", amount: -50000, status: "pending", date: "2026-07-06", note: "Advance, awaiting approval" },
  { id: "l5", customer: "Usman Tariq", type: "adjustment", amount: -8000, status: "pending", date: "2026-07-05", note: "Goodwill discount" },
];

export const ACTIVITY: ActivityItem[] = [
  { id: "a1", actor: "Ahmed Sheikh", action: "submitted installation", target: "INST-1043", at: "2026-07-06T09:12:00", kind: "install" },
  { id: "a2", actor: "System", action: "low stock alert", target: "NVR5216 (3 left)", at: "2026-07-06T08:40:00", kind: "stock" },
  { id: "a3", actor: "Imran Mehtab", action: "approved invoice", target: "INV-2043", at: "2026-07-05T17:20:00", kind: "invoice" },
  { id: "a4", actor: "Sana Malik", action: "payment received", target: "PKR 560,000", at: "2026-07-05T15:02:00", kind: "payment" },
  { id: "a5", actor: "Fatima Noor", action: "completed installation", target: "INST-1041", at: "2026-07-01T13:44:00", kind: "install" },
];

export const NOTIFICATIONS: AppNotification[] = [
  { id: "n1", title: "Approval needed", body: "INST-1043 submitted by Ahmed Sheikh", at: "2026-07-06T09:12:00", read: false, kind: "approval" },
  { id: "n2", title: "Low stock", body: "NVR5216 has only 3 units left", at: "2026-07-06T08:40:00", read: false, kind: "stock" },
  { id: "n3", title: "Payment received", body: "PKR 560,000 from Sana Malik", at: "2026-07-05T15:02:00", read: true, kind: "payment" },
];

export const KPIS = {
  todayInstalls: 3, pendingInstalls: 5, completedInstalls: 128, pendingApproval: 4,
  revenue: 18450000, outstanding: 262000, expenses: 9120000, inventoryValue: 6840000,
  lowStock: 3, pendingWhatsapp: 7,
};

export const MONTHLY_INSTALLS = [12, 18, 15, 22, 19, 26, 24, 30, 28, 34, 31, 38];
export const MONTHLY_REVENUE = [6.2, 8.1, 7.4, 9.8, 8.9, 11.2, 10.4, 13.1, 12.2, 15.4, 14.1, 18.4];
export const MONTHLY_EXPENSES = [3.1, 4.0, 3.6, 4.9, 4.4, 5.6, 5.1, 6.4, 6.0, 7.6, 6.9, 9.1];
export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
