import CryptoJS from "crypto-js";
import type { StateStorage } from "zustand/middleware";
import { dexieDB } from "@/lib/db/dexieDb";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY ?? "YOUR_SECRET_KEY_HERE";

export const dexieEncryptedStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const entry = await dexieDB.store.get(name);
      if (!entry?.value) return null;

      const bytes = CryptoJS.AES.decrypt(entry.value, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      console.error("Dexie getItem failed:", e);
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const encrypted = CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
      await dexieDB.store.put({ key: name, value: encrypted });
    } catch (e) {
      console.error("Dexie setItem failed:", e);
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      await dexieDB.store.delete(name);
    } catch (e) {
      console.error("Dexie removeItem failed:", e);
    }
  },
};
