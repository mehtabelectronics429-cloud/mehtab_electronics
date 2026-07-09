export const pkr = (n: number) =>
  "PKR " + new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(n);

export const num = (n: number) => new Intl.NumberFormat("en-US").format(n);
