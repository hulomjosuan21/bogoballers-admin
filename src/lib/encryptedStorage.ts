import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY ?? "YOUR_SECRET_KEY_HERE";

export const encryptedStorage = {
  getItem: (name: string): string | null => {
    const data = localStorage.getItem(name);
    if (!data) return null;

    try {
      const bytes = CryptoJS.AES.decrypt(data, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      console.error("Decryption failed:", e);
      return null;
    }
  },

  setItem: (name: string, value: string): void => {
    try {
      const encrypted = CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
      localStorage.setItem(name, encrypted);
    } catch (e) {
      console.error("Encryption failed:", e);
    }
  },

  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
};
