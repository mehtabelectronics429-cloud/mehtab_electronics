import type { Role } from "./types";

/**
 * Capability-based permissions. Add roles by extending this map — no component
 * refactor needed (components ask `can(role, capability)`).
 */
export type Capability =
  | "dashboard.view"
  | "customers.view" | "customers.manage"
  | "installations.view.all" | "installations.view.own" | "installations.manage" | "installations.approve"
  | "materials.view" | "materials.manage"
  | "products.view" | "products.manage"
  | "inventory.view"
  | "billing.view.all" | "billing.view.own" | "billing.manage" | "billing.approve"
  | "ledger.view.all" | "ledger.view.own" | "ledger.manage" | "ledger.approve"
  | "employees.view" | "employees.manage"
  | "whatsapp.view" | "reports.view" | "settings.manage"
  | "profile.view";

const MATRIX: Record<Role, Capability[]> = {
  admin: [
    "dashboard.view", "customers.view", "customers.manage",
    "installations.view.all", "installations.manage", "installations.approve",
    "materials.view", "materials.manage", "products.view", "products.manage",
    "inventory.view", "billing.view.all", "billing.manage", "billing.approve",
    "ledger.view.all", "ledger.manage", "ledger.approve",
    "employees.view", "employees.manage", "whatsapp.view", "reports.view",
    "settings.manage", "profile.view",
  ],
  employee: [
    "dashboard.view", "installations.view.own", "billing.view.own",
    "billing.manage", "ledger.view.own", "ledger.manage", "profile.view",
  ],
};

export function can(role: Role, cap: Capability): boolean {
  return MATRIX[role]?.includes(cap) ?? false;
}
