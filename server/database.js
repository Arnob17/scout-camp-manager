import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database
const dbPath = path.join(__dirname, "scouts.db");
const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma("journal_mode = WAL");

// Create tables
const createTables = () => {
  // Admins table
  const createAdminsTable = db.prepare(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Scouts table
  const createScoutsTable = db.prepare(`
    CREATE TABLE IF NOT EXISTS scouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    age INTEGER,
    phone TEXT,
    emergency_contact TEXT,
    image_url TEXT,
    scout_type TEXT DEFAULT 'scout',
    registered_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registered_by) REFERENCES admins (id)
    )
  `);

  // Camp info table
  const createCampInfoTable = db.prepare(`
    CREATE TABLE IF NOT EXISTS camp_info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      camp_name TEXT NOT NULL,
      camp_date TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT,
      max_participants INTEGER DEFAULT 50,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const createFoodTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS food (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scout_id INTEGER NOT NULL,
    food_name TEXT NOT NULL,
    food_time TEXT NOT NULL, -- e.g., "Breakfast", "Lunch", "Dinner"
    food_date TEXT NOT NULL, -- YYYY-MM-DD
    received INTEGER DEFAULT 0, -- 0 = not received, 1 = received
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (scout_id) REFERENCES scouts (id)
  )
`);

  createFoodTable.run();
  createAdminsTable.run();
  createScoutsTable.run();
  createCampInfoTable.run();

  // Insert default camp info if none exists
  const campExists = db
    .prepare("SELECT COUNT(*) as count FROM camp_info")
    .get();
  if (campExists.count === 0) {
    const insertDefaultCamp = db.prepare(`
      INSERT INTO camp_info (camp_name, camp_date, location, description)
      VALUES (?, ?, ?, ?)
    `);

    insertDefaultCamp.run(
      "Summer Adventure Camp 2025",
      "2025-07-15 to 2025-07-22",
      "Pine Valley Scout Reserve",
      "Join us for an unforgettable week of outdoor adventures, skill building, and friendship!"
    );
  }
};
// Database operations
const dbOps = {
  // Admin operations
  createAdmin: (email, password, name) => {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const stmt = db.prepare(
      "INSERT INTO admins (email, password, name) VALUES (?, ?, ?)"
    );
    return stmt.run(email, hashedPassword, name);
  },

  findAdminByEmail: (email) => {
    const stmt = db.prepare("SELECT * FROM admins WHERE email = ?");
    return stmt.get(email);
  },

  // Scout operations
  createScout: (scoutData, adminId) => {
    const stmt = db.prepare(`
    INSERT INTO scouts (email, password, name, age, phone, emergency_contact, image_url, scout_type, registered_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    return stmt.run(
      scoutData.email,
      scoutData.password, // Make sure to hash this password
      scoutData.name,
      scoutData.age || null,
      scoutData.phone || null,
      scoutData.emergency_contact || null,
      scoutData.image_url || null,
      scoutData.scout_type || "scout", // Default to 'scout' if not provided
      adminId
    );
  },

  // And update the scout retrieval to include scout_type
  getAllScouts: () => {
    const stmt = db.prepare(`
    SELECT id, email, name, age, phone, emergency_contact, image_url, scout_type, created_at 
    FROM scouts 
    ORDER BY created_at DESC
  `);
    return stmt.all();
  },

  findScoutByEmail: (email) => {
    const stmt = db.prepare("SELECT * FROM scouts WHERE email = ?");
    return stmt.get(email);
  },

  // Camp operations
  getCampInfo: () => {
    const stmt = db.prepare("SELECT * FROM camp_info LIMIT 1");
    return stmt.get();
  },

  updateCampInfo: (campData) => {
    const stmt = db.prepare(`
      UPDATE camp_info 
      SET camp_name = ?, camp_date = ?, location = ?, description = ?, max_participants = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `);
    return stmt.run(
      campData.camp_name,
      campData.camp_date,
      campData.location,
      campData.description,
      campData.max_participants
    );
  },

  // Food operations
  addFoodEntry: (scoutId, foodData) => {
    const stmt = db.prepare(`
      INSERT INTO food (scout_id, food_name, food_time, food_date, received)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(
      scoutId,
      foodData.food_name,
      foodData.food_time,
      foodData.food_date,
      foodData.received ? 1 : 0
    );
  },

  getFoodEntriesByDate: (date) => {
    const stmt = db.prepare(`
      SELECT f.id, s.name as scout_name, f.food_name, f.food_time, f.food_date, f.received
      FROM food f
      JOIN scouts s ON f.scout_id = s.id
      WHERE f.food_date = ?
    `);
    return stmt.all(date);
  },

  updateFoodStatus: (foodId, received) => {
    const stmt = db.prepare(`
      UPDATE food SET received = ? WHERE id = ?
    `);
    return stmt.run(received ? 1 : 0, foodId);
  },

  getScoutFoodHistory: (scoutId) => {
    const stmt = db.prepare(`
      SELECT food_name, food_time, food_date, received, created_at
      FROM food
      WHERE scout_id = ?
      ORDER BY food_date DESC, food_time
    `);
    return stmt.all(scoutId);
  },

  // Utility
  verifyPassword: (plainPassword, hashedPassword) => {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  },
};

// Initialize database
createTables();

export { db, dbOps };
