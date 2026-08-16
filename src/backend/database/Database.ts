import { MongoClient, ObjectId } from "mongodb";
import { loadEnvFile } from "process";
import { type User } from "../../shared/models/Users.ts";
import { type StoredTicket, type Ticket } from "../../shared/models/Tickets.ts";
import { type StoredPhase, type Phase } from "../../shared/models/Phases.ts";

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
const PHASES_COLLECTION = process.env.DB_PHASES_COLLECTION_NAME || "phases";

let connectionTimeout: ReturnType<typeof setTimeout> | undefined | null;

if (!URI || !DB_NAME || !USERS_COLLECTION || !TICKETS_COLLECTION) {
  throw new Error(
    `MONGODB_URI, DB_NAME, DB_USERS_COLLECTION_NAME, and DB_TICKETS_COLLECTION_NAME are all required env variables`
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

export interface UserDocument extends Omit<User, "_id"> {
  _id: ObjectId;
}

export interface TicketDocument extends Omit<
  Ticket,
  "_id" | "phaseId" | "assigneeId" | "completedAt"
> {
  _id: ObjectId;
  phaseId: ObjectId | null;
  assigneeId: ObjectId | null;
  completedAt: Date | null;
}

export interface PhaseDocument extends Omit<Phase, "_id" | "startsAt"> {
  _id: ObjectId;
  startsAt: Date;
}

export function convertToUserDocument(user: User): UserDocument {
  return { ...user, _id: new ObjectId(user._id) }; //should work since unpack everything first, then overwrite _id with ObjectId
}

export function convertToUser(userDocument: UserDocument): User {
  const id =
    typeof userDocument._id == "string"
      ? userDocument._id
      : userDocument._id.toHexString();
  return { ...userDocument, _id: id };
}

export function convertToTicket(ticketDocument: TicketDocument): StoredTicket {
  return {
    ...ticketDocument,
    _id: ticketDocument._id.toHexString(),
    phaseId: ticketDocument.phaseId?.toHexString() ?? null,
    assigneeId: ticketDocument.assigneeId?.toHexString() ?? null,
    completedAt: ticketDocument.completedAt?.toISOString() ?? null,
  };
}

export function convertToPhase(phaseDocument: PhaseDocument): StoredPhase {
  return {
    ...phaseDocument,
    _id: phaseDocument._id.toHexString(),
    startsAt: phaseDocument.startsAt.toISOString(),
  };
}

export async function getUsersCollection() {
  const db = await getAgilityDB();
  if (USERS_COLLECTION && db)
    return db.collection<UserDocument>(USERS_COLLECTION);
  throw new Error(
    "Could not connect to Agility Db or could not find users collection in db"
  );
}

export async function getTicketsCollection() {
  const db = await getAgilityDB();
  if (TICKETS_COLLECTION && db)
    return db.collection<TicketDocument>(TICKETS_COLLECTION);
  throw new Error(
    "Could not connect to Agility Db or could not find tickets collection in db"
  );
}

export async function getPhasesCollection() {
  const db = await getAgilityDB();
  if (db) return db.collection<PhaseDocument>(PHASES_COLLECTION);
  throw new Error(
    "Could not connect to Agility Db or could not find phases collection in db"
  );
}
try {
  void (await getUsersCollection()).createIndex(
    { username: 1 },
    { unique: true }
  );
} catch (error) {
  console.error((error as Error).message);
}
