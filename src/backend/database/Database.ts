import { MongoClient, ObjectId } from "mongodb";
import { loadEnvFile } from "process";
import type { User } from "../../shared/models/Users.ts";

const TIMEOUT_IN_MINS = 15;

try {
  loadEnvFile();
} catch {
  //variables already loaded.
}

const URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;
const USERS_COLLECTION = process.env.DB_USERS_COLLECTION_NAME;
const TICKETS_COLLECTION = process.env.DB_TICKETS_COLLECTION_NAME;

let connectionTimeout: ReturnType<typeof setTimeout> | undefined | null;

if (!URI || !DB_NAME || !USERS_COLLECTION || !TICKETS_COLLECTION) {
  throw new Error(
    `MONGODB_URI, DB_NAME, DB_USERS_COLLECTION_NAME, and DB_TICKETS_COLLECTION_NAME are all required env variables`;
  );
}

const client = new MongoClient(URI);

async function cleanupConnection() {
  await client.close();
  connectionTimeout = null;
  console.log("MongoClient connection timed out");
}
/**
 * Closes MongoClient Connection after TIMEOUT_IN_MINS time.
 */
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
async function getAgilityDB() {
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

export async function getUsersCollection() {
  const db = await getAgilityDB();
  if (USERS_COLLECTION && db) return db.collection<User>(USERS_COLLECTION);
  throw new Error("Could not connect to Agility Db or could not find users collection in db");
}

export async function getTicketsCollection() {
  const db = await getAgilityDB();
  if (TICKETS_COLLECTION && db) return db.collection(TICKETS_COLLECTION); //FIXME: Add the ticket interface as  a generic to collection
  throw new Error("Could not connect to Agility Db or could not find tickets collection in db");
}
interface objectWithIdProperty extends Object {
  _id : InstanceType<typeof ObjectId> | undefined;
}
