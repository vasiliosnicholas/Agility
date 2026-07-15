import { MongoClient } from "mongodb";
import { loadEnvFile } from "process";

const TIMEOUT_IN_MINS = 15;

try {
  loadEnvFile();
} catch {
  //variables already loaded.
}

const URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;
let connectionTimeout: ReturnType<typeof setTimeout> | undefined | null;

if (!URI || !DB_NAME) {
  const suffix = "is a required env variable";
  throw new Error(
    `${!URI ? `URI ${suffix}` : ""} ${!DB_NAME ? `DB_NAME ${suffix}` : ""}`
  );
}

const client = new MongoClient(URI);

async function cleanupConnection() {
  await client.close();
  connectionTimeout = null;
  console.log("MongoClient connection timed out");
}

function handleConnection() {
  if (connectionTimeout) {
    clearTimeout(connectionTimeout);
  }
  connectionTimeout = setTimeout(
    () => void cleanupConnection(),
    TIMEOUT_IN_MINS * 60000
  );
}

/**
 * Returns a Db containing Agility connections.
 * @returns a Db from a MongoDB cluster.
 */
export default async function getAgilityDB() {
  try {
    console.log("Received DB request.");
    await client.connect();
    console.log("DB connected");
    handleConnection();
    return client.db(DB_NAME);
  } catch (error) {
    console.error("Error with MongoDB client: ", error);
  } finally {
    handleConnection();
  }
}
