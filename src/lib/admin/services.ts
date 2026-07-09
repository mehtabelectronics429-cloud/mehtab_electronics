import * as db from "./mock-data";
import type { Customer } from "./types";

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

// In-memory stores (cloned so CRUD works during a session).
let customers: Customer[] = [...db.CUSTOMERS];

export const api = {
  async customers() { await delay(); return [...customers].filter((c) => !c.archived); },
  async createCustomer(input: Omit<Customer, "id" | "balance" | "installations" | "createdAt">) {
    await delay();
    const c: Customer = { ...input, id: "c" + Date.now(), balance: 0, installations: 0, createdAt: new Date().toISOString().slice(0, 10) };
    customers = [c, ...customers];
    return c;
  },
  async updateCustomer(id: string, patch: Partial<Customer>) {
    await delay();
    customers = customers.map((c) => (c.id === id ? { ...c, ...patch } : c));
    return customers.find((c) => c.id === id)!;
  },
  async archiveCustomer(id: string) { await delay(); customers = customers.map((c) => (c.id === id ? { ...c, archived: true } : c)); },

  async employees() { await delay(); return db.EMPLOYEES; },
  async products() { await delay(); return db.PRODUCTS; },
  async materials() { await delay(); return db.MATERIALS; },
  async installations() { await delay(); return db.INSTALLATIONS; },
  async invoices() { await delay(); return db.INVOICES; },
  async ledger() { await delay(); return db.LEDGER; },
};
