export type Role = "admin" | "employee";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  title?: string;
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
  createdAt: string;
  archived?: boolean;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
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
  type: string;
  status: InstallationStatus;
  date: string;
  amount: number;
}

export interface Invoice {
  id: string;
  number: string;
  customer: string;
  amount: number;
  paid: number;
  status: InvoiceStatus;
  date: string;
}

export interface LedgerEntry {
  id: string;
  customer: string;
  type: "invoice" | "payment" | "credit" | "debit" | "adjustment";
  amount: number;
  status: "pending" | "approved";
  date: string;
  note?: string;
}

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
  kind: "install" | "invoice" | "payment" | "stock" | "customer" | "approval";
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
  kind: "approval" | "assigned" | "completed" | "stock" | "invoice" | "payment" | "rejected";
}
