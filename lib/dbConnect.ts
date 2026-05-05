import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const mongooseCache = globalForMongoose.mongooseCache ?? {
  conn: null,
  promise: null,
};

globalForMongoose.mongooseCache = mongooseCache;

export function getMongoUri(env: NodeJS.ProcessEnv = process.env) {
  const mongoUri = env.MONGO_URI ?? env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "Please define the MONGO_URI or MONGODB_URI environment variable.",
    );
  }

  return mongoUri;
}

export default async function dbConnect() {
  if (mongooseCache.conn) {
    return mongooseCache.conn;
  }

  if (!mongooseCache.promise) {
    mongooseCache.promise = mongoose.connect(getMongoUri());
  }

  try {
    mongooseCache.conn = await mongooseCache.promise;
    return mongooseCache.conn;
  } catch (error) {
    console.error("Database connection error:", error);
    mongooseCache.promise = null;
    throw error;
  }
}
