import mongoose from "mongoose";

const URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mehtab_electronics";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cache;

export async function connectMongo(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(URI, { bufferCommands: false });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
