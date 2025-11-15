import Dexie from "dexie";

export class DexieDB extends Dexie {
  store!: Dexie.Table<{ key: string; value: string }, string>;

  constructor() {
    super("zustandEncryptedDB");
    this.version(1).stores({
      store: "&key",
    });
  }
}

export const dexieDB = new DexieDB();
