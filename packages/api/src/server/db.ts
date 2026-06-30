import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB || "reelparty";

/**
 * Lazily-created, cached Mongo connection. Caching on globalThis avoids
 * exhausting connections during Next.js dev hot-reloads / serverless reuse.
 */
const globalForMongo = globalThis as unknown as {
  _reelpartyMongo?: Promise<Db>;
};

async function connect(): Promise<Db> {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  try {
    await db.collection("members").dropIndex("id_1");
  } catch {
    // index may not exist on fresh databases
  }

  await Promise.all([
    db.collection("parties").createIndex({ code: 1 }, { unique: true }),
    db
      .collection("members")
      .createIndex({ id: 1, party_code: 1 }, { unique: true }),
    db.collection("members").createIndex({ party_code: 1, joined_at: 1 }),
    db.collection("queue_items").createIndex({ id: 1 }, { unique: true }),
    db.collection("queue_items").createIndex({ party_code: 1, position: 1 }),
  ]);

  return db;
}

export function getDb(): Promise<Db> {
  if (!globalForMongo._reelpartyMongo) {
    globalForMongo._reelpartyMongo = connect();
  }
  return globalForMongo._reelpartyMongo;
}
