import Dexie, { type Table } from "dexie";
import CryptoJS from "crypto-js";
import type { MatchBook } from "@/types/scorebook";

export interface GameState {
  present: MatchBook;
  past: MatchBook[];
  future: MatchBook[];
}

export interface StoredState {
  key: string;
  value: string;
}

class SecureDexie extends Dexie {
  gameState!: Table<StoredState>;

  constructor() {
    super("BasketballScorebookDB");
    this.version(1).stores({
      gameState: "key",
    });
  }
}

const db = new SecureDexie();
const SECRET_KEY =
  import.meta.env.VITE_SECRET_KEY || "your-very-strong-secret-key";

export async function saveEncryptedState(
  matchId: string,
  stateObject: GameState
): Promise<void> {
  try {
    const stateString = JSON.stringify(stateObject);
    const encryptedState = CryptoJS.AES.encrypt(
      stateString,
      SECRET_KEY
    ).toString();

    await db.gameState.put({ key: matchId, value: encryptedState });
  } catch (error) {
    console.error("Failed to save state:", error);
  }
}

/**
 * Load decrypted state by matchId
 */
export async function loadDecryptedState(
  matchId: string
): Promise<GameState | null> {
  try {
    const record = await db.gameState.get(matchId);

    if (record?.value) {
      const bytes = CryptoJS.AES.decrypt(record.value, SECRET_KEY);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedString) {
        throw new Error("Decryption failed. Incorrect key or corrupt data.");
      }

      return JSON.parse(decryptedString) as GameState;
    }
    return null;
  } catch (error) {
    console.error("Failed to load state:", error);
    await db.gameState.delete(matchId);
    return null;
  }
}

export async function listSavedStates(): Promise<
  { matchId: string; state: GameState }[]
> {
  try {
    const records = await db.gameState.toArray();
    const result: { matchId: string; state: GameState }[] = [];

    for (const record of records) {
      try {
        const bytes = CryptoJS.AES.decrypt(record.value, SECRET_KEY);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        if (decryptedString) {
          const parsed = JSON.parse(decryptedString) as GameState;
          result.push({ matchId: record.key, state: parsed });
        }
      } catch {
        await db.gameState.delete(record.key);
      }
    }

    return result;
  } catch (error) {
    console.error("Failed to list saved states:", error);
    return [];
  }
}

export async function deleteSavedState(matchId: string): Promise<void> {
  try {
    await db.gameState.delete(matchId);
  } catch (error) {
    console.error("Failed to delete saved state:", error);
  }
}
