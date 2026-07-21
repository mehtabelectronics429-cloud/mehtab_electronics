"use client";

import type { ListParams, Paginated } from "./types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(
      (data as { error?: string }).error || res.statusText || "Request failed",
    );
  return data as T;
}

function qs(params?: ListParams) {
  if (!params) return "";
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== null) sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const api = {
  me: () => request<{ user: import("./types").User }>("/api/auth/me"),
  dashboard: () =>
    request<{
      kpis: Record<string, number>;
      activity: import("./types").ActivityItem[];
    }>("/api/dashboard"),
  analytics: (params?: {
    mode?: "overall" | "range";
    from?: string;
    to?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.mode) qs.set("mode", params.mode);
    if (params?.from) qs.set("from", params.from);
    if (params?.to) qs.set("to", params.to);
    const s = qs.toString();
    return request<import("./types").Analytics>(
      `/api/analytics${s ? `?${s}` : ""}`,
    );
  },

  customers: (params?: ListParams) =>
    request<Paginated<import("./types").Customer>>(
      `/api/customers${qs(params)}`,
    ),
  getCustomer: (id: string) =>
    request<import("./types").Customer>(`/api/customers/${id}`),
  createCustomer: (body: Partial<import("./types").Customer>) =>
    request<import("./types").Customer>("/api/customers", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateCustomer: (id: string, body: Partial<import("./types").Customer>) =>
    request<import("./types").Customer>(`/api/customers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  archiveCustomer: (id: string) =>
    request<{ ok: boolean }>(`/api/customers/${id}`, { method: "DELETE" }),
  customerLedger: (id: string) =>
    request<{
      customer: import("./types").Customer;
      ledger: import("./types").LedgerEntry[];
      installations: import("./types").Installation[];
      invoices: import("./types").Invoice[];
    }>(`/api/customers/${id}/ledger`),
  remindCustomer: (
    id: string,
    event?: string,
    channel?: "direct" | "business",
  ) =>
    request<{
      ok: boolean;
      jobId: string | null;
      waUrl: string | null;
      channel: "direct" | "business";
      requestedChannel?: "direct" | "business";
      businessApiReady?: boolean;
      template?: string;
    }>(`/api/customers/${id}/remind`, {
      method: "POST",
      body: JSON.stringify({ event: event || "payment_reminder", channel }),
    }),

  employees: (params?: ListParams) =>
    request<Paginated<import("./types").Employee>>(
      `/api/employees${qs(params)}`,
    ),
  getEmployee: (id: string) =>
    request<import("./types").Employee>(`/api/employees/${id}`),
  createEmployee: (body: Partial<import("./types").Employee>) =>
    request<import("./types").Employee>("/api/employees", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateEmployee: (id: string, body: Partial<import("./types").Employee>) =>
    request<import("./types").Employee>(`/api/employees/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  archiveEmployee: (id: string) =>
    request<{ ok: boolean }>(`/api/employees/${id}`, { method: "DELETE" }),

  products: (params?: ListParams) =>
    request<Paginated<import("./types").Product>>(`/api/products${qs(params)}`),
  getProduct: (id: string) =>
    request<import("./types").Product>(`/api/products/${id}`),
  createProduct: (body: Partial<import("./types").Product>) =>
    request<import("./types").Product>("/api/products", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateProduct: (id: string, body: Partial<import("./types").Product>) =>
    request<import("./types").Product>(`/api/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  archiveProduct: (id: string) =>
    request<{ ok: boolean }>(`/api/products/${id}`, { method: "DELETE" }),

  categories: (params?: ListParams) =>
    request<Paginated<import("./types").Category>>(
      `/api/categories${qs(params)}`,
    ),
  createCategory: (body: Partial<import("./types").Category>) =>
    request<import("./types").Category>("/api/categories", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateCategory: (id: string, body: Partial<import("./types").Category>) =>
    request<import("./types").Category>(`/api/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  archiveCategory: (id: string) =>
    request<{ ok: boolean }>(`/api/categories/${id}`, { method: "DELETE" }),

  purchases: (params?: ListParams) =>
    request<Paginated<import("./types").Purchase>>(
      `/api/purchases${qs(params)}`,
    ),
  createPurchase: (body: Record<string, unknown>) =>
    request<import("./types").Purchase>("/api/purchases", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  payPurchase: (id: string, amount: number) =>
    request<import("./types").Purchase>(`/api/purchases/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ amount }),
    }),
  archivePurchase: (id: string) =>
    request<{ ok: boolean }>(`/api/purchases/${id}`, { method: "DELETE" }),

  createSale: (body: Record<string, unknown>) =>
    request<import("./types").Invoice & { balance: number }>("/api/pos", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  suppliers: (params?: ListParams) =>
    request<Paginated<import("./types").Supplier>>(
      `/api/suppliers${qs(params)}`,
    ),
  createSupplier: (body: Partial<import("./types").Supplier>) =>
    request<import("./types").Supplier>("/api/suppliers", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateSupplier: (id: string, body: Partial<import("./types").Supplier>) =>
    request<import("./types").Supplier>(`/api/suppliers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  archiveSupplier: (id: string) =>
    request<{ ok: boolean }>(`/api/suppliers/${id}`, { method: "DELETE" }),

  materials: (params?: ListParams) =>
    request<Paginated<import("./types").Material>>(
      `/api/materials${qs(params)}`,
    ),
  getMaterial: (id: string) =>
    request<import("./types").Material>(`/api/materials/${id}`),
  createMaterial: (body: Partial<import("./types").Material>) =>
    request<import("./types").Material>("/api/materials", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateMaterial: (id: string, body: Partial<import("./types").Material>) =>
    request<import("./types").Material>(`/api/materials/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  archiveMaterial: (id: string) =>
    request<{ ok: boolean }>(`/api/materials/${id}`, { method: "DELETE" }),

  installations: (params?: ListParams) =>
    request<Paginated<import("./types").Installation>>(
      `/api/installations${qs(params)}`,
    ),
  getInstallation: (id: string) =>
    request<import("./types").Installation>(`/api/installations/${id}`),
  createInstallation: (body: Record<string, unknown>) =>
    request<import("./types").Installation>("/api/installations", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateInstallation: (id: string, body: Record<string, unknown>) =>
    request<import("./types").Installation>(`/api/installations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  archiveInstallation: (id: string) =>
    request<{ ok: boolean }>(`/api/installations/${id}`, { method: "DELETE" }),

  invoices: (params?: ListParams) =>
    request<Paginated<import("./types").Invoice>>(`/api/invoices${qs(params)}`),
  getInvoice: (id: string) =>
    request<import("./types").Invoice>(`/api/invoices/${id}`),
  createInvoice: (body: Record<string, unknown>) =>
    request<import("./types").Invoice>("/api/invoices", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateInvoice: (id: string, body: Record<string, unknown>) =>
    request<import("./types").Invoice>(`/api/invoices/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  archiveInvoice: (id: string) =>
    request<{ ok: boolean }>(`/api/invoices/${id}`, { method: "DELETE" }),

  ledger: (params?: ListParams) =>
    request<Paginated<import("./types").LedgerEntry>>(
      `/api/ledger${qs(params)}`,
    ),
  getLedger: (id: string) =>
    request<import("./types").LedgerEntry>(`/api/ledger/${id}`),
  createLedger: (body: Record<string, unknown>) =>
    request<import("./types").LedgerEntry>("/api/ledger", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateLedger: (id: string, body: Record<string, unknown>) =>
    request<import("./types").LedgerEntry>(`/api/ledger/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  archiveLedger: (id: string) =>
    request<{ ok: boolean }>(`/api/ledger/${id}`, { method: "DELETE" }),
  sendLedgerWhatsapp: (
    id: string,
    event?: string,
    channel?: "direct" | "business",
  ) =>
    request<{
      ok: boolean;
      jobId: string | null;
      waUrl: string | null;
      channel: "direct" | "business";
      requestedChannel?: "direct" | "business";
      businessApiReady?: boolean;
      template?: string;
    }>(`/api/ledger/${id}/whatsapp`, {
      method: "POST",
      body: JSON.stringify({ event, channel }),
    }),
  downloadLedger: (customerId?: string) => {
    const q = customerId ? `?customerId=${encodeURIComponent(customerId)}` : "";
    window.open(`/api/ledger/export${q}`, "_blank");
  },

  whatsapp: (params?: ListParams) =>
    request<
      Paginated<import("./types").WhatsAppMsg> & {
        templates: { event: string; label: string }[] | string[];
        fromPhone?: string;
        sendMode?: "direct" | "business";
        businessApiReady?: boolean;
      }
    >(`/api/whatsapp${qs(params)}`),
  sendWhatsapp: (body: Record<string, unknown>) =>
    request<{
      message: import("./types").WhatsAppMsg;
      jobId: string | null;
      channel: "direct" | "business";
      requestedChannel?: "direct" | "business";
      businessApiReady?: boolean;
      waUrl: string | null;
    }>("/api/whatsapp", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  retryWhatsapp: (id: string) =>
    request<{ message: import("./types").WhatsAppMsg; jobId: string }>(
      `/api/whatsapp/${id}/retry`,
      {
        method: "POST",
      },
    ),

  settings: () =>
    request<{ settings: Record<string, unknown> }>("/api/settings"),
  saveSettings: (key: string, value: Record<string, unknown>) =>
    request("/api/settings", {
      method: "PUT",
      body: JSON.stringify({ key, value }),
    }),

  tickJobs: () =>
    request<{ processed: number }>("/api/jobs/tick", { method: "POST" }),
};
