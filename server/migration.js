// run-migration.js
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, "scouts.db"));

// Helper to add column safely
function addColumnIfNotExists(table, column, definition) {
  try {
    console.log(`Adding column '${column}' to '${table}'...`);
    const stmt = db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column}`);
    stmt.run();
    console.log(`✅ Column '${column}' added successfully.`);
  } catch (error) {
    if (error.message.includes("duplicate column name")) {
      console.log(`ℹ️ Column '${column}' already exists, skipping.`);
    } else {
      console.error(`❌ Error adding column '${column}':`, error.message);
    }
  }
}

try {
  // List of new columns to add
  // addColumnIfNotExists("scouts", "bsID", "TEXT NOT NULL");
  // addColumnIfNotExists("scouts", "unitName", "TEXT NOT NULL");
  // addColumnIfNotExists("scouts", "name_bangla", "TEXT NOT NULL");
  // addColumnIfNotExists("scouts", "age", "INTEGER");
  addColumnIfNotExists("scouts", "payment_amount", "TEXT NOT NULL");
  // addColumnIfNotExists("scouts", "motherName", "TEXT NOT NULL");
  // addColumnIfNotExists("scouts", "address", "TEXT NOT NULL");
  // addColumnIfNotExists("scouts", "bloodGroup", "TEXT NOT NULL");
  // addColumnIfNotExists("scouts", "phone", "TEXT NOT NULL");
  // addColumnIfNotExists("scouts", "emergency_contact", "TEXT");
  // addColumnIfNotExists("scouts", "image_url", "TEXT");
  // addColumnIfNotExists("scouts", "scout_type", "TEXT DEFAULT 'scout'");
  // addColumnIfNotExists("scouts", "registered_by", "INTEGER");
  // addColumnIfNotExists(
  //   "scouts",
  //   "created_at",
  //   "DATETIME DEFAULT CURRENT_TIMESTAMP"
  // );

  console.log("🎉 Migration completed successfully!");
} catch (err) {
  console.error("Migration failed:", err.message);
} finally {
  db.close();
}
