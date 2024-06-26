import Database from "better-sqlite3";
import { type BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";

import { env } from "../env";

const sqlite = new Database(env.DB);
let _db: BetterSQLite3Database | null = null;

export const useDb = () => {
	if (!_db) {
		_db = drizzle(sqlite, { logger: env.DEV });
	}

	return _db;
};
