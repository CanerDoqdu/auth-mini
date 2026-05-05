import { ensureUserStore, getUserStoreFilePath } from "./userStore";

type LocalStoreConnection = {
  connected: true;
  storeFilePath: string;
};

export { getUserStoreFilePath };

export default async function dbConnect(
  env: NodeJS.ProcessEnv = process.env,
): Promise<LocalStoreConnection> {
  try {
    await ensureUserStore(env);

    return {
      connected: true,
      storeFilePath: getUserStoreFilePath(env),
    };
  } catch (error) {
    console.error("Local user store initialization error:", error);
    throw error;
  }
}
