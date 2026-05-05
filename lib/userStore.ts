import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import bcrypt from "bcrypt";

import { INVALID_AUTH_EMAIL_MESSAGE, isValidEmailAddress } from "./auth";
import type { IUser } from "../models/User";

export type UserStoreEnv = NodeJS.ProcessEnv | undefined;

type UserStoreData = {
  users: IUser[];
};

type GlobalUserStoreState = {
  writeQueue: Promise<void>;
};

const DEMO_USERS: IUser[] = [
  {
    _id: "demo-user-1",
    username: "demo",
    email: "demo@authmini.dev",
    password: "$2b$10$TIcjgaNprPWaIIZS7apk0eYVB26H8Zw0dn67vSDRaXBXbqLpiRx26",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    _id: "demo-user-2",
    username: "guest",
    email: "guest@authmini.dev",
    password: "$2b$10$QygEsi31C9SLAmB80/HehuIz3x0NIRvBGo1iuZ1DI22ibohBrcifS",
    createdAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
];

const globalForUserStore = globalThis as typeof globalThis & {
  userStoreState?: GlobalUserStoreState;
};

const userStoreState = globalForUserStore.userStoreState ?? {
  writeQueue: Promise.resolve(),
};

globalForUserStore.userStoreState = userStoreState;

function cloneUser(user: IUser): IUser {
  return { ...user };
}

function cloneUsers(users: IUser[]): IUser[] {
  return users.map(cloneUser);
}

function getUsernameLookupKey(username: string): string {
  return username.trim().toLowerCase();
}

function getEmailLookupKey(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeStoredUsername(username: string): string {
  return username.trim();
}

function normalizeStoredEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getSeedUsers(): IUser[] {
  return cloneUsers(DEMO_USERS);
}

export function getUserStoreFilePath(env: UserStoreEnv = process.env): string {
  const configuredPath = env?.AUTH_USER_STORE_FILE;

  if (configuredPath) {
    return configuredPath;
  }

  return path.join(process.cwd(), "data", "users.json");
}

async function writeStore(
  storeFilePath: string,
  data: UserStoreData,
): Promise<void> {
  const nextWrite = userStoreState.writeQueue
    .catch(() => undefined)
    .then(async () => {
      try {
        await fs.mkdir(path.dirname(storeFilePath), { recursive: true });
        await fs.writeFile(
          storeFilePath,
          `${JSON.stringify(data, null, 2)}\n`,
          "utf8",
        );
      } catch (error) {
        console.error("User store write error:", error);
        throw error;
      }
    });

  userStoreState.writeQueue = nextWrite;
  await nextWrite;
}

export async function ensureUserStore(
  env: UserStoreEnv = process.env,
): Promise<string> {
  const storeFilePath = getUserStoreFilePath(env);

  try {
    await fs.access(storeFilePath);
    return storeFilePath;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;

    if (err.code && err.code !== "ENOENT") {
      console.error("User store access error:", error);
      throw error;
    }

    try {
      await writeStore(storeFilePath, { users: getSeedUsers() });
      return storeFilePath;
    } catch (error) {
      console.error("User store seed error:", error);
      throw error;
    }
  }
}

async function readUserStore(
  env: UserStoreEnv = process.env,
): Promise<UserStoreData> {
  const storeFilePath = await ensureUserStore(env);

  try {
    const fileContents = await fs.readFile(storeFilePath, "utf8");
    const parsed = JSON.parse(fileContents) as Partial<UserStoreData>;
    const users = Array.isArray(parsed.users) ? parsed.users : [];

    return { users };
  } catch (error) {
    console.error("User store read error:", error);
    throw error;
  }
}

export async function findUserById(
  userId: string,
  env: UserStoreEnv = process.env,
): Promise<IUser | null> {
  const store = await readUserStore(env);
  const user = store.users.find((storedUser) => storedUser._id === userId);
  return user ? cloneUser(user) : null;
}

export async function findUserByUsername(
  username: string,
  env: UserStoreEnv = process.env,
): Promise<IUser | null> {
  const store = await readUserStore(env);
  const usernameLookupKey = getUsernameLookupKey(username);

  if (!usernameLookupKey) {
    return null;
  }

  const user = store.users.find(
    (storedUser) => getUsernameLookupKey(storedUser.username) === usernameLookupKey,
  );
  return user ? cloneUser(user) : null;
}

export async function createUser(
  input: { username: string; email: string; password: string },
  env: UserStoreEnv = process.env,
): Promise<IUser> {
  const storeFilePath = await ensureUserStore(env);
  const store = await readUserStore(env);
  const username = normalizeStoredUsername(input.username);
  const email = normalizeStoredEmail(input.email);
  const usernameLookupKey = getUsernameLookupKey(username);
  const emailLookupKey = getEmailLookupKey(email);

  if (!usernameLookupKey) {
    throw new Error("Username is required.");
  }

  if (!emailLookupKey || !isValidEmailAddress(email)) {
    throw new Error(INVALID_AUTH_EMAIL_MESSAGE);
  }

  const hasDuplicateUser = store.users.some(
    (user) =>
      getUsernameLookupKey(user.username) === usernameLookupKey ||
      getEmailLookupKey(user.email) === emailLookupKey,
  );

  if (hasDuplicateUser) {
    throw new Error("Username or email already exists.");
  }

  try {
    const timestamp = new Date().toISOString();
    const passwordHash = await bcrypt.hash(input.password, 10);
    const user: IUser = {
      _id: crypto.randomUUID(),
      username,
      email,
      password: passwordHash,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    store.users.push(user);
    await writeStore(storeFilePath, store);

    return cloneUser(user);
  } catch (error) {
    console.error("User creation error:", error);
    throw error;
  }
}
