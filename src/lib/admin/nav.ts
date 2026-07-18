import type { Capability } from "./permissions";

export interface NavItem {
  label: string;
  href: string;
  icon: string;      // lucide icon name
  cap: Capability;   // capability required to see it
  group?: string;
}

export const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "LayoutDashboard", cap: "dashboard.view", group: "Overview" },
  { label: "Customers", href: "/admin/customers", icon: "Users", cap: "customers.view", group: "Operations" },
  { label: "My Customers", href: "/admin/customers", icon: "Users", cap: "customers.view.own", group: "Operations" },
  { label: "Installations", href: "/admin/installations", icon: "Wrench", cap: "installations.view.all", group: "Operations" },
  { label: "My Installations", href: "/admin/installations", icon: "Wrench", cap: "installations.view.own", group: "Operations" },
  { label: "Materials", href: "/admin/materials", icon: "Boxes", cap: "materials.view", group: "Inventory" },
  { label: "Categories", href: "/admin/categories", icon: "Tags", cap: "products.view", group: "Inventory" },
  { label: "Products", href: "/admin/products", icon: "Package", cap: "products.view", group: "Inventory" },
  { label: "Inventory", href: "/admin/inventory", icon: "Warehouse", cap: "inventory.view", group: "Inventory" },
  { label: "Billing", href: "/admin/billing", icon: "ReceiptText", cap: "billing.view.all", group: "Finance" },
  { label: "My Billing", href: "/admin/billing", icon: "ReceiptText", cap: "billing.view.own", group: "Finance" },
  { label: "Ledger", href: "/admin/ledger", icon: "BookOpen", cap: "ledger.view.all", group: "Finance" },
  { label: "My Ledger", href: "/admin/ledger", icon: "BookOpen", cap: "ledger.view.own", group: "Finance" },
  { label: "Employees", href: "/admin/employees", icon: "IdCard", cap: "employees.view", group: "Team" },
  { label: "WhatsApp", href: "/admin/whatsapp", icon: "MessageCircle", cap: "whatsapp.view", group: "Team" },
  { label: "Reports", href: "/admin/reports", icon: "ChartColumn", cap: "reports.view", group: "Insights" },
  { label: "Settings", href: "/admin/settings", icon: "Settings", cap: "settings.manage", group: "System" },
  { label: "Profile", href: "/admin/profile", icon: "CircleUser", cap: "profile.view", group: "System" },
];
