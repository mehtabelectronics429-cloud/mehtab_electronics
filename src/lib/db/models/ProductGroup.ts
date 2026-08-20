import { Schema, type Model, type Types } from "mongoose";
import { registerModel } from "@/lib/db/registerModel";

/** A product inside a group, with the default quantity added to the cart. */
export interface IProductGroupItem {
  productId: Types.ObjectId;
  qty: number;
}

/**
 * A named bundle of products for one-click adding at the POS counter (e.g.
 * "5kW Solar Kit" → panels ×8, inverter ×1, battery ×2). Quantities are
 * defaults; the cashier can still adjust each line after adding.
 */
export interface IProductGroup {
  _id: Types.ObjectId;
  name: string;
  description: string;
  items: IProductGroupItem[];
  active: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IProductGroup>(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: "" },
    items: {
      type: [
        new Schema<IProductGroupItem>(
          {
            productId: {
              type: Schema.Types.ObjectId,
              ref: "Product",
              required: true,
            },
            qty: { type: Number, default: 1, min: 0.01 },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    active: { type: Boolean, default: true, index: true },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

export const ProductGroup: Model<IProductGroup> = registerModel<IProductGroup>(
  "ProductGroup",
  schema,
);
