import { z } from "zod";

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().optional(),
  sort: z.string().optional(),
});

export const customerInput = z.object({
  name: z.string().min(2),
  phone: z.string().min(7),
  whatsapp: z.string().min(7),
  address: z.string().min(3),
  mapUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export const employeeInput = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  title: z.string().min(2),
  role: z.enum(["admin", "manager", "cashier", "technician"]).optional(),
  active: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
  password: z.string().min(6).optional(),
});

// Create requires password  enforced in route
export const employeeCreateInput = employeeInput.extend({
  password: z.string().min(6),
});

export const productInput = z.object({
  category: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().min(1),
  sku: z.string().min(1),
  barcode: z.string().optional(),
  purchasePrice: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(0),
  warranty: z.string().optional(),
  stock: z.coerce.number().int().min(0).optional(),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  features: z.string().optional(),
  highlights: z.string().optional(),
});

export const productGroupItemInput = z.object({
  productId: z.string().min(1),
  qty: z.coerce.number().min(0.01),
});

export const productGroupInput = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  active: z.boolean().optional(),
  items: z.array(productGroupItemInput).min(1, "Add at least one product"),
});

export const categoryInput = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  image: z.string().optional(),
  description: z.string().optional(),
  order: z.coerce.number().int().optional(),
});

export const purchaseItemInput = z.object({
  productId: z.string().optional().nullable(),
  name: z.string().min(1),
  qty: z.coerce.number().min(0.01),
  unitCost: z.coerce.number().min(0),
});

export const purchaseInput = z.object({
  supplierId: z.string().min(1),
  supplierInvoiceNo: z.string().optional(),
  items: z.array(purchaseItemInput).min(1),
  discount: z.coerce.number().min(0).optional(),
  taxRate: z.coerce.number().min(0).optional(),
  shipping: z.coerce.number().min(0).optional(),
  paid: z.coerce.number().min(0).optional(),
  date: z.string().or(z.date()),
  notes: z.string().optional(),
  ref: z.string().optional(),
  invoiceUrl: z.string().url().optional().or(z.literal("")),
});

/** Record a payment against a purchase (to the supplier). */
export const purchasePaymentInput = z.object({
  amount: z.coerce.number().min(0),
});

export const supplierInput = z.object({
  name: z.string().min(2),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  balance: z.coerce.number().optional(),
  notes: z.string().optional(),
});

export const materialInput = z.object({
  name: z.string().min(1),
  unit: z.string().min(1),
  opening: z.number().min(0).optional(),
  issued: z.number().min(0).optional(),
  used: z.number().min(0).optional(),
  returned: z.number().min(0).optional(),
  damaged: z.number().min(0).optional(),
  reorder: z.number().min(0).optional(),
});

export const installationMaterialInput = z.object({
  materialId: z.string().min(1),
  qty: z.number().min(0),
  used: z.number().min(0).optional(),
});

export const installationItemInput = z.object({
  productId: z.string().optional().nullable(),
  name: z.string().min(1),
  unitPrice: z.coerce.number().min(0),
  qty: z.coerce.number().min(0),
});

export const invoiceItemInput = z.object({
  description: z.string().min(1),
  qty: z.coerce.number().min(0),
  unitPrice: z.coerce.number().min(0),
  productId: z.string().optional().nullable(),
});

/** Record a customer return / refund against a sale invoice. */
export const saleReturnInput = z.object({
  reason: z.string().min(2, "A return reason is required"),
  note: z.string().optional(),
  items: z
    .array(
      z.object({
        /** Index of the original line in the invoice's items array. */
        index: z.coerce.number().int().min(0),
        qty: z.coerce.number().min(0.01),
        /** Add the returned units back to stock (resalable). */
        restock: z.boolean().optional(),
      }),
    )
    .min(1, "Select at least one item to return"),
});

export const posItemInput = z.object({
  productId: z.string().optional().nullable(),
  description: z.string().min(1),
  qty: z.coerce.number().min(0.01),
  unitPrice: z.coerce.number().min(0),
});

export const posSaleInput = z.object({
  customerId: z.string().optional().nullable(),
  items: z.array(posItemInput).min(1),
  discount: z.coerce.number().min(0).optional(),
  taxRate: z.coerce.number().min(0).optional(),
  shipping: z.coerce.number().min(0).optional(),
  paid: z.coerce.number().min(0).optional(),
  date: z.string().optional(),
});

export const installationInput = z.object({
  customerId: z.string().min(1),
  employeeId: z.string().optional().nullable(),
  employeeIds: z.array(z.string().min(1)).optional(),
  type: z.string().min(2),
  status: z
    .enum([
      "pending",
      "assigned",
      "in_progress",
      "submitted",
      "approved",
      "rejected",
      "completed",
    ])
    .optional(),
  date: z.string().or(z.date()),
  amount: z.number().min(0).optional(),
  notes: z.string().optional(),
  ref: z.string().optional(),
  items: z.array(installationItemInput).optional(),
  materials: z.array(installationMaterialInput).optional(),
  discount: z.coerce.number().min(0).optional(),
  taxRate: z.coerce.number().min(0).optional(),
  shipping: z.coerce.number().min(0).optional(),
  invoiceId: z.string().optional().nullable(),
  createInvoice: z.boolean().optional(),
});

export const invoiceInput = z.object({
  customerId: z.string().min(1),
  employeeId: z.string().optional().nullable(),
  installationId: z.string().optional().nullable(),
  items: z.array(invoiceItemInput).optional(),
  discount: z.coerce.number().min(0).optional(),
  taxRate: z.coerce.number().min(0).optional(),
  shipping: z.coerce.number().min(0).optional(),
  amount: z.coerce.number().min(0).optional(),
  cost: z.coerce.number().min(0).optional(),
  paid: z.coerce.number().min(0).optional(),
  status: z.enum(["draft", "pending", "approved", "rejected"]).optional(),
  date: z.string().or(z.date()),
  notes: z.string().optional(),
  number: z.string().optional(),
});

export const ledgerInput = z.object({
  customerId: z.string().min(1),
  employeeId: z.string().optional().nullable(),
  invoiceId: z.string().optional().nullable(),
  installationId: z.string().optional().nullable(),
  type: z.enum(["invoice", "payment", "credit", "debit", "adjustment"]),
  amount: z.number(),
  status: z.enum(["pending", "approved"]).optional(),
  date: z.string().or(z.date()),
  note: z.string().optional(),
});

export const whatsappSendInput = z.object({
  customerId: z.string().optional(),
  toName: z.string().min(1),
  toPhone: z.string().min(7),
  /** Event key (payment_reminder) or display label (Payment Reminder) */
  template: z.string().min(1),
  event: z.string().optional(),
  body: z.string().optional(),
  /** direct = wa.me · business = Cloud API */
  channel: z.enum(["direct", "business"]).optional(),
});

export const settingsInput = z.object({
  key: z.string().min(1),
  value: z.record(z.unknown()),
});
