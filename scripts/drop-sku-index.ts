/**
 * One-time migration: the Product.sku index used to be a plain unique index
 * (`sku_1`), which rejects a second product with a blank SKU. SKU is now
 * optional, enforced by a PARTIAL unique index (only non-empty SKUs must be
 * unique). This drops the old index and rebuilds indexes to match the schema.
 *
 * Usage: npx tsx scripts/drop-sku-index.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config(); // fallback .env
import mongoose from "mongoose";
import { Product } from "../src/lib/db/models/Product";

const URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mehtab_electronics";

async function main() {
  const redacted = URI.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");
  console.log("Connecting to", redacted);
  await mongoose.connect(URI);

  try {
    await Product.collection.dropIndex("sku_1");
    console.log('Dropped old unique index "sku_1".');
  } catch (err) {
    console.log(
      'Old index "sku_1" not present (already migrated) —',
      (err as Error).message,
    );
  }

  // Rebuild indexes from the current schema (creates the partial unique index).
  await Product.syncIndexes();
  console.log("Synced Product indexes:");
  console.log(await Product.collection.indexes());

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
