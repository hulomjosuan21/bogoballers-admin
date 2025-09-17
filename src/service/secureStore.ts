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
const STATE_KEY = import.meta.env.VITE_GAME_STATE_KEY || "currentGameState";

export async function saveEncryptedState(
  stateObject: GameState
): Promise<void> {
  try {
    const stateString = JSON.stringify(stateObject);
    const encryptedState = CryptoJS.AES.encrypt(
      stateString,
      SECRET_KEY
    ).toString();

    await db.gameState.put({ key: STATE_KEY, value: encryptedState });
  } catch (error) {
    console.error("Failed to save state:", error);
  }
}

export async function loadDecryptedState(): Promise<GameState | null> {
  try {
    const record = await db.gameState.get(STATE_KEY);

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
    await db.gameState.delete(STATE_KEY);
    return null;
  }
}
