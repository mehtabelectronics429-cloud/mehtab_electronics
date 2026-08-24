import type { SearchableOption } from "@/components/admin/ui/SearchableSelect";
import type { Product } from "@/lib/admin/types";
import { api } from "@/lib/admin/services";

/** Build a SearchableSelect option from a product, carrying the row on `.data`. */
export function productOption(p: Product): SearchableOption {
  return {
    value: p.id,
    label: `${p.brand} ${p.model}`.trim(),
    searchText: `${p.brand} ${p.model} ${p.sku} ${p.category}`,
    data: p as unknown as Record<string, unknown>,
  };
}

/**
 * Server-backed product search for SearchableSelect's `onSearch` — queries the
 * whole catalogue (like POS) instead of only the pre-loaded page. Read the
 * chosen product back from the option's `.data` in the picker.
 */
export async function searchProductOptions(q: string): Promise<SearchableOption[]> {
  const res = await api.products({ q, limit: 50 });
  return res.items.map(productOption);
}

/** Read the full product back off a picked option (from onSearch results). */
export function productFromOption(
  option?: { data?: Record<string, unknown> },
): Product | undefined {
  return option?.data as Product | undefined;
}
