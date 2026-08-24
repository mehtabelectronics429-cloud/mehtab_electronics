/**
 * Flexible product type-ahead filter shared by the products list and CSV export.
 * Every whitespace token must match somewhere (AND); each token is a
 * case-insensitive partial match against any searchable field (OR). So
 * "sol pan" finds "Solar Panel", order-free — mirroring the POS search.
 */
export function productSearchFilter(q: string): Record<string, unknown> {
  const term = (q || "").trim();
  if (!term) return {};
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const fields = ["brand", "model", "sku", "barcode", "category"];
  const tokens = term.split(/\s+/).filter(Boolean).slice(0, 6);
  return {
    $and: tokens.map((tok) => ({
      $or: fields.map((f) => ({ [f]: { $regex: esc(tok), $options: "i" } })),
    })),
  };
}
