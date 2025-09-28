import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "scouts.db");
const db = new Database(dbPath);

// Enable WAL mode
db.pragma("journal_mode = WAL");

try {
  console.log("🛠 Dropping existing 'scouts' table if it exists...");
  db.prepare(`DROP TABLE IF EXISTS scouts`).run();

  console.log("✅ Creating new 'scouts' table...");
  db.prepare(
    `
    CREATE TABLE scouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT, -- nullable
      password TEXT NOT NULL,
      bsID TEXT NOT NULL,
      unitName TEXT NOT NULL,
      name TEXT NOT NULL,
      name_bangla TEXT NOT NULL,
      age TEXT,
      fatherName TEXT NOT NULL,
      motherName TEXT NOT NULL,
      address TEXT NOT NULL,
      bloodGroup TEXT,
      phone TEXT,
      emergency_contact TEXT,
      image_url TEXT,
      payment_amount TEXT NOT NULL,
      scout_type TEXT DEFAULT 'scout',
      registered_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (registered_by) REFERENCES admins (id)
    )
  `
  ).run();

  console.log("🎉 Migration completed successfully! 'scouts' table is ready.");
} catch (err) {
  console.error("❌ Migration failed:", err.message);
} finally {
  db.close();
}
