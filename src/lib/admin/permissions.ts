import type { Role } from "./types";

/**
 * Capability-based permissions. Add roles by extending this map  no component
 * refactor needed (components ask `can(role, capability)`).
 */
export type Capability =
  | "dashboard.view"
  | "customers.view"
  | "customers.view.own"
  | "customers.manage"
  | "installations.view.all"
  | "installations.view.own"
  | "installations.manage"
  | "installations.approve"
  | "materials.view"
  | "materials.manage"
  | "products.view"
  | "products.manage"
  | "inventory.view"
  | "billing.view.all"
  | "billing.view.own"
  | "billing.manage"
  | "billing.approve"
  | "ledger.view.all"
  | "ledger.view.own"
  | "ledger.manage"
  | "ledger.approve"
  | "employees.view"
  | "employees.manage"
  | "whatsapp.view"
  | "whatsapp.send"
  | "reports.view"
  | "settings.manage"
  | "pos.use"
  | "suppliers.view"
  | "suppliers.manage"
  | "purchases.view"
  | "purchases.manage"
  | "profile.view";

const MATRIX: Record<Role, Capability[]> = {
  admin: [
    "dashboard.view",
    "customers.view",
    "customers.manage",
    "installations.view.all",
    "installations.manage",
    "installations.approve",
    "materials.view",
    "materials.manage",
    "products.view",
    "products.manage",
    "inventory.view",
    "billing.view.all",
    "billing.manage",
    "billing.approve",
    "ledger.view.all",
    "ledger.manage",
    "ledger.approve",
    "employees.view",
    "employees.manage",
    "whatsapp.view",
    "whatsapp.send",
    "reports.view",
    "settings.manage",
    "pos.use",
    "suppliers.view",
    "suppliers.manage",
    "purchases.view",
    "purchases.manage",
    "profile.view",
  ],
  // Manager: runs the whole business day-to-day, but not system settings.
  manager: [
    "dashboard.view",
    "customers.view",
    "customers.manage",
    "installations.view.all",
    "installations.manage",
    "installations.approve",
    "materials.view",
    "materials.manage",
    "products.view",
    "products.manage",
    "inventory.view",
    "billing.view.all",
    "billing.manage",
    "billing.approve",
    "ledger.view.all",
    "ledger.manage",
    "ledger.approve",
    "employees.view",
    "whatsapp.view",
    "whatsapp.send",
    "reports.view",
    "pos.use",
    "suppliers.view",
    "suppliers.manage",
    "purchases.view",
    "purchases.manage",
    "profile.view",
  ],
  // Cashier: the POS / retail counter role.
  cashier: [
    "dashboard.view",
    "pos.use",
    "customers.view",
    "customers.manage",
    "products.view",
    "inventory.view",
    "materials.view",
    "suppliers.view",
    "suppliers.manage",
    "purchases.view",
    "purchases.manage",
    "billing.view.all",
    "billing.manage",
    "ledger.view.all",
    "whatsapp.send",
    "profile.view",
  ],
  // Technician: the installation field role (own jobs only).
  technician: [
    "dashboard.view",
    "customers.view",
    "customers.manage",
    "installations.view.own",
    "installations.manage",
    "materials.view",
    "billing.view.own",
    "billing.manage",
    "ledger.view.own",
    "whatsapp.send",
    "profile.view",
  ],
  // Legacy generic employee (kept for existing profiles)  same as technician.
  employee: [
    "dashboard.view",
    "customers.view",
    "customers.manage",
    "installations.view.own",
    "installations.manage",
    "materials.view",
    "billing.view.own",
    "billing.manage",
    "ledger.view.own",
    "whatsapp.send",
    "profile.view",
  ],
};

export function can(role: Role, cap: Capability): boolean {
  return MATRIX[role]?.includes(cap) ?? false;
}
