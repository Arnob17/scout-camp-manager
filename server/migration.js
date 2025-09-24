// run-migration.js
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, "scouts.db"));

try {
  console.log("Adding scout_type column to scouts table...");
  const stmt = db.prepare(
    'ALTER TABLE scouts ADD COLUMN scout_type TEXT DEFAULT "scout"'
  );
  stmt.run();
  console.log("Migration completed successfully!");
} catch (error) {
  console.log("Migration error (column might already exist):", error.message);
} finally {
  db.close();
}
