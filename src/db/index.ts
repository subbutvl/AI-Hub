import { drizzle, SQLJsDatabase } from 'drizzle-orm/sql-js';
import initSqlJs from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import localforage from 'localforage';
import * as schema from './schema';

const DB_KEY = 'ai_hub_db_v1';

class DatabaseManager {
  private _db: SQLJsDatabase<typeof schema> | null = null;
  private _sqliteInstance: any = null;
  public isInitialized = false;
  private onReadyCallbacks: (() => void)[] = [];

  get db() {
    if (!this._db) throw new Error("Database not initialized");
    return this._db;
  }

  get sqliteInstance() {
     return this._sqliteInstance;
  }

  async init() {
    if (this.isInitialized) return;

    try {
      const SQL = await initSqlJs({
        locateFile: file => {
          if (file.endsWith('.wasm')) {
            return sqlWasmUrl;
          }
          return `https://sql.js.org/dist/${file}`;
        }
      });

      // Load existing database from localforage (IndexedDB)
      const savedDatabase = await localforage.getItem<Uint8Array>(DB_KEY);
      
      if (savedDatabase) {
        this._sqliteInstance = new SQL.Database(savedDatabase);
      } else {
        this._sqliteInstance = new SQL.Database();
      }

      this._db = drizzle(this._sqliteInstance, { schema });
      
      // Auto-save interceptor: 
      // sql.js is entirely in-memory. We must explicitly export the Uint8Array 
      // and save it to IndexedDB after mutations.
      // We will provide a specific save method that hooks should call after writes.

      this.isInitialized = true;
      this.onReadyCallbacks.forEach(cb => cb());
    } catch (error) {
      console.error("Failed to initialize database:", error);
      throw error;
    }
  }

  async save() {
    if (!this._sqliteInstance) return;
    const data = this._sqliteInstance.export();
    await localforage.setItem(DB_KEY, data);
  }

  onReady(cb: () => void) {
    if (this.isInitialized) {
      cb();
    } else {
      this.onReadyCallbacks.push(cb);
    }
  }
}

export const dbManager = new DatabaseManager();
