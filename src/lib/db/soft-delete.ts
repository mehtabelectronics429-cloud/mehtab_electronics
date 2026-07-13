import { Schema, type SchemaDefinition } from "mongoose";

export interface SoftDeleteFields {
  deletedAt: Date | null;
}

export interface TimestampFields {
  createdAt: Date;
  updatedAt: Date;
}

export function withTimestamps(def: SchemaDefinition) {
  return new Schema(
    { ...def, deletedAt: { type: Date, default: null, index: true } },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
  );
}

/** Default filter: exclude soft-deleted docs. */
export const notDeleted = { deletedAt: null };
