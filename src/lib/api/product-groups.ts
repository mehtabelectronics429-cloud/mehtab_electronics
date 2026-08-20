type PopulatedProduct = {
  _id?: unknown;
  brand?: string;
  model?: string;
  sku?: string;
  sellingPrice?: number;
  stock?: number;
};

/**
 * Resolve each group item's populated product into the flat shape the POS needs
 * to add a cart line (name, price, live stock) in one click.
 */
export function mapGroup(item: Record<string, unknown>) {
  const items = (item.items as { productId: unknown; qty: number }[]) ?? [];
  const mapped = items.map((it) => {
    const p = it.productId as PopulatedProduct | string | null;
    const isObj = typeof p === "object" && p !== null;
    return {
      productId: isObj && p?._id ? String(p._id) : p ? String(p) : null,
      qty: it.qty,
      name: isObj ? `${p.brand ?? ""} ${p.model ?? ""}`.trim() : "",
      sku: isObj ? p.sku ?? "" : "",
      sellingPrice: isObj ? p.sellingPrice ?? 0 : 0,
      stock: isObj ? p.stock ?? 0 : 0,
    };
  });
  return { ...item, items: mapped };
}
