import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, localCredentials, onboardingResponses } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Local Auth Helpers ────────────────────────────────────────────────────

/**
 * Create a new user row (with a synthetic openId) and a matching
 * local_credentials row in one transaction-like sequence.
 */
export async function createLocalUser(
  email: string,
  passwordHash: string,
  name?: string
): Promise<{ userId: number; email: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Use email as the openId for local users (prefixed to avoid collisions)
  const openId = `local:${email}`;

  await db
    .insert(users)
    .values({ openId, email, name: name ?? email.split("@")[0], loginMethod: "local" })
    .onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });

  const [user] = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  if (!user) throw new Error("Failed to create user");

  await db
    .insert(localCredentials)
    .values({ userId: user.id, email, passwordHash });

  return { userId: user.id, email };
}

/**
 * Look up a local credential by email.
 */
export async function getLocalCredentialByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(localCredentials)
    .where(eq(localCredentials.email, email))
    .limit(1);
  return result[0] ?? undefined;
}

/**
 * Fetch a full user row by numeric id.
 */
export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] ?? undefined;
}

/**
 * Save onboarding survey responses for a user.
 */
export async function saveOnboardingResponses(
  userId: number,
  responses: Record<string, string>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .insert(onboardingResponses)
    .values({
      userId,
      responses: JSON.stringify(responses),
    })
    .onDuplicateKeyUpdate({
      set: { responses: JSON.stringify(responses) },
    });
}

/**
 * Get onboarding survey responses for a user.
 * Returns parsed JSON object or null if not found.
 */
export async function getOnboardingResponses(
  userId: number
): Promise<Record<string, string> | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(onboardingResponses)
    .where(eq(onboardingResponses.userId, userId))
    .limit(1);

  if (!result[0]) return null;

  try {
    return JSON.parse(result[0].responses);
  } catch {
    return null;
  }
}
