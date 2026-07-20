import mongoose from "mongoose";

const URI =
  process.env.MONGODB_URI?.trim() ||
  "mongodb://127.0.0.1:27017/mehtab_electronics";
const redactedUri = URI.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");
console.log("MongoDB URI:", redactedUri);

const connectOptions = {
  bufferCommands: false,
  connectTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4,
};

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};
global.mongooseCache = cache;

export async function connectMongo(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    console.log("Initiating new MongoDB connection...");
    console.log("URI (redacted):", redactedUri);
    console.log("Connect options:", connectOptions);

    cache.promise = mongoose
      .connect(URI, connectOptions)
      .then((conn) => {
        console.log(
          "Mongoose connect resolved, readyState:",
          mongoose.connection.readyState,
        );
        return conn;
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err);
        cache.promise = null;
        cache.conn = null;
        throw err;
      });
  }

  cache.conn = await cache.promise;
  console.log(
    "MongoDB connection established, readyState:",
    mongoose.connection.readyState,
  );
  return cache.conn;
}

export function getRedactedMongoUri(): string {
  return redactedUri;
}
