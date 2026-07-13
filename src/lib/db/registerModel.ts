import mongoose, { type Model, type Schema } from "mongoose";

/**
 * Register a Mongoose model, recompiling when the cached model is missing
 * schema paths (common under Next.js HMR with `models.X || model(...)`).
 * In development, always recompile so schema edits apply without a full restart.
 */
export function registerModel<T>(name: string, schema: Schema): Model<T> {
  const existing = mongoose.models[name] as Model<T> | undefined;
  if (existing) {
    const missingPath = Object.keys(schema.paths).some((path) => !existing.schema.path(path));
    const stale = missingPath || process.env.NODE_ENV === "development";
    if (!stale) return existing;
    delete mongoose.models[name];
    delete mongoose.connection.models[name];
  }
  return mongoose.model<T>(name, schema);
}
