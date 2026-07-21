export type Role = "admin" | "manager" | "cashier" | "technician" | "employee";

/** Employee categories that map to a permission role. */
export const EMPLOYEE_ROLES: { value: Exclude<Role, "employee">; label: string; desc: string }[] = [
  { value: "admin", label: "Admin", desc: "Full access to everything" },
  { value: "manager", label: "Manager", desc: "Operations, sales & reports (no settings)" },
  { value: "cashier", label: "Cashier", desc: "POS sales, customers, suppliers & billing" },
  { value: "technician", label: "Technician", desc: "Installations, materials & own jobs" },
];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  title?: string;
  employeeId?: string | null;
}

export type InstallationStatus =
  | "pending" | "assigned" | "in_progress" | "submitted" | "approved" | "rejected" | "completed";

export type InvoiceStatus = "draft" | "pending" | "approved" | "rejected";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  address: string;
  mapUrl?: string;
  notes?: string;
  balance: number;
  installations: number;
  createdAt?: string;
  archived?: boolean;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  role?: "admin" | "manager" | "cashier" | "technician";
  active: boolean;
  assigned: number;
  completed: number;
  rating: number;
  joinedAt: string;
}

export interface Product {
  id: string;
  category: string;
  brand: string;
  model: string;
  sku: string;
  purchasePrice: number;
  sellingPrice: number;
  warranty: string;
  stock: number;
  description?: string;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  order?: number;
}

export interface Supplier {
  id: string;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  address?: string;
  balance: number;
  notes?: string;
  createdAt?: string;
}

export interface Purchase {
  id: string;
  ref: string;
  supplierId?: string | null;
  supplier?: string;
  supplierInvoiceNo?: string;
  items?: { productId?: string | null; name: string; qty: number; unitCost: number }[];
  discount?: number;
  taxRate?: number;
  shipping?: number;
  amount: number;
  paid: number;
  status: "unpaid" | "partial" | "paid";
  date: string;
  notes?: string;
}

export interface Material {
  id: string;
  name: string;
  unit: string;
  opening: number;
  issued: number;
  used: number;
  returned: number;
  damaged: number;
  reorder: number;
}

export interface Installation {
  id: string;
  ref: string;
  customer: string;
  employee: string;
  customerId?: string | null;
  employeeId?: string | null;
  employeeIds?: string[];
  employees?: { id: string; name: string }[];
  invoiceId?: string | null;
  invoiceNumber?: string;
  invoiceStatus?: string;
  type: string;
  status: InstallationStatus;
  date: string;
  amount: number;
  notes?: string;
  items?: InstallationItem[];
  materials?: { materialId: string; name: string; unit: string; qty: number; used: number }[];
}

export interface Invoice {
  id: string;
  number: string;
  customer: string;
  customerId?: string | null;
  employeeId?: string | null;
  installationId?: string | null;
  items?: { description: string; qty: number; unitPrice: number }[];
  discount?: number;
  taxRate?: number;
  shipping?: number;
  amount: number;
  cost?: number;
  paid: number;
  status: InvoiceStatus;
  date: string;
  notes?: string;
  customerId?: string | null;
  customerPhone?: string;
  customerWhatsapp?: string;
  customerAddress?: string;
}

export interface InstallationItem {
  productId?: string | null;
  name: string;
  unitPrice: number;
  qty: number;
}

export interface LedgerEntry {
  id: string;
  customer: string;
  customerId?: string | null;
  customerWhatsapp?: string;
  employeeId?: string | null;
  installationId?: string | null;
  installationRef?: string;
  type: "invoice" | "payment" | "credit" | "debit" | "adjustment";
  amount: number;
  status: "pending" | "approved";
  date: string;
  note?: string;
}

export interface WhatsAppMsg {
  id: string;
  to: string;
  toName?: string;
  toPhone?: string;
  fromPhone?: string;
  from?: string;
  channel?: "direct" | "business";
  event?: string;
  template: string;
  body?: string;
  waUrl?: string;
  status: string;
  at?: string;
  error?: string;
}

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
  kind: "install" | "invoice" | "payment" | "stock" | "customer" | "approval" | "whatsapp";
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
  kind: "approval" | "assigned" | "completed" | "stock" | "invoice" | "payment" | "rejected";
}

export interface EmployeeAnalytics {
  id: string;
  name: string;
  title: string;
  active: boolean;
  rating: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  invoices: number;
  avgInvoice: number;
  jobs: number;
  completed: number;
  inProgress: number;
  completionRate: number;
}

export interface Analytics {
  totals: {
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
    collected: number;
    outstanding: number;
    approvedInvoices: number;
    totalInvoices: number;
    costCoverage: number;
    jobs: number;
    completed: number;
    purchaseTotal: number;
    purchasePaid: number;
    payable: number;
    grossProfit: number;
  };
  byStatus: Record<string, number>;
  months: { key: string; label: string; revenue: number; cost: number; profit: number }[];
  employees: EmployeeAnalytics[];
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListParams {
  page?: number;
  limit?: number;
  q?: string;
  sort?: string;
  status?: string;
  category?: string;
  customerId?: string;
}
