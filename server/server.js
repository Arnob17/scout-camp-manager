import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import { dbOps } from "./database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "scouts_camp_secret_key_2025";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../dist")));

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Admin routes
app.post("/api/admin/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ error: "Email, password, and name are required" });
    }

    // Check if admin already exists
    const existingAdmin = dbOps.findAdminByEmail(email);
    if (existingAdmin) {
      return res
        .status(409)
        .json({ error: "Admin with this email already exists" });
    }

    const result = dbOps.createAdmin(email, password, name);
    const token = jwt.sign(
      { id: result.lastInsertRowid, email, role: "admin" },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "Admin registered successfully",
      token,
      admin: { id: result.lastInsertRowid, email, name },
    });
  } catch (error) {
    console.error("Admin registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = dbOps.findAdminByEmail(email);
    if (!admin || !dbOps.verifyPassword(password, admin.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: "admin" },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Scout routes
app.post("/api/scout/register", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can register scouts" });
    }

    const scoutData = req.body;

    if (!scoutData.password || !scoutData.name) {
      return res
        .status(400)
        .json({ error: "Email, password, and name are required" });
    }

    // Check if scout already exists
    const existingScout = dbOps.findScoutByEmail(scoutData.email);
    if (existingScout) {
      return res
        .status(409)
        .json({ error: "Scout with this email already exists" });
    }

    const result = dbOps.createScout(scoutData, req.user.id);

    res.status(201).json({
      message: "Scout registered successfully",
      scout: {
        id: result.lastInsertRowid,
        email: scoutData.email,
        name: scoutData.name,
      },
    });

    console.log(result);
  } catch (error) {
    console.error("Scout registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/scout/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const scout = dbOps.findScoutByEmail(email);
    if (!scout || !dbOps.verifyPassword(password, scout.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: scout.id, email: scout.email, role: "scout" },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      scout: {
        id: `SFC-${scout.id}`,
        email: scout.email,
        name: scout.name,
        age: scout.age,
        phone: scout.phone,
        emergency_contact: scout.emergency_contact,
        image_url: scout.image_url,
      },
    });
  } catch (error) {
    console.error("Scout login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/scouts/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can delete scouts" });
    }

    const scoutId = parseInt(req.params.id);

    if (isNaN(scoutId) || scoutId <= 0) {
      return res.status(400).json({ error: "Invalid scout ID" });
    }

    // Optional: Check if scout exists before deletion
    // const scoutExists = dbOps
    //   .prepare("SELECT id FROM scouts WHERE id = ?")
    //   .get(scoutId);
    // if (!scoutExists) {
    //   return res.status(404).json({ error: "Scout not found" });
    // }

    const result = dbOps.deleteScoutById(scoutId);

    if (result.changes === 0) {
      return res
        .status(404)
        .json({ error: "Scout not found or already deleted" });
    }

    res.json({
      message: "Scout deleted successfully",
      deletedId: scoutId,
      changes: result.changes,
    });
  } catch (error) {
    console.error("Delete scout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/scouts", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can view all scouts" });
    }

    const scouts = dbOps.getAllScouts();
    res.json(scouts);
  } catch (error) {
    console.error("Get scouts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/scouts/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can update scouts" });
    }

    const scoutId = parseInt(req.params.id);

    if (isNaN(scoutId) || scoutId <= 0) {
      return res.status(400).json({ error: "Invalid scout ID" });
    }

    // Check if scout exists
    const existingScout = dbOps.getScoutById(scoutId);
    if (!existingScout) {
      return res.status(404).json({ error: "Scout not found" });
    }

    const updateData = req.body;

    // Basic validation
    if (!updateData.email || !updateData.name) {
      return res.status(400).json({ error: "Email and name are required" });
    }

    // Check if email is already taken by another scout
    if (updateData.email !== existingScout.email) {
      const scoutWithEmail = dbOps.findScoutByEmail(updateData.email);
      if (scoutWithEmail && scoutWithEmail.id !== scoutId) {
        return res
          .status(409)
          .json({ error: "Email already taken by another scout" });
      }
    }

    const result = dbOps.updateScout(scoutId, updateData);

    if (result.changes === 0) {
      return res
        .status(404)
        .json({ error: "Scout not found or no changes made" });
    }

    // Get updated scout data
    const updatedScout = dbOps.getScoutById(scoutId);

    res.json({
      message: "Scout updated successfully",
      scout: updatedScout,
      changes: result.changes,
    });
  } catch (error) {
    console.error("Update scout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Partial update (for specific fields)
app.patch("/api/scouts/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can update scouts" });
    }

    const scoutId = parseInt(req.params.id);

    if (isNaN(scoutId) || scoutId <= 0) {
      return res.status(400).json({ error: "Invalid scout ID" });
    }

    // Check if scout exists
    const existingScout = dbOps.getScoutById(scoutId);
    if (!existingScout) {
      return res.status(404).json({ error: "Scout not found" });
    }

    const updateData = req.body;

    // If email is being updated, check if it's available
    if (updateData.email && updateData.email !== existingScout.email) {
      const scoutWithEmail = dbOps.findScoutByEmail(updateData.email);
      if (scoutWithEmail && scoutWithEmail.id !== scoutId) {
        return res
          .status(409)
          .json({ error: "Email already taken by another scout" });
      }
    }

    // Merge existing data with update data
    const mergedData = { ...existingScout, ...updateData };

    const result = dbOps.updateScout(scoutId, mergedData);

    if (result.changes === 0) {
      return res
        .status(404)
        .json({ error: "Scout not found or no changes made" });
    }

    const updatedScout = dbOps.getScoutById(scoutId);

    res.json({
      message: "Scout updated successfully",
      scout: updatedScout,
      changes: result.changes,
    });
  } catch (error) {
    console.error("Partial update scout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Camp info routes
app.get("/api/camp-info", async (req, res) => {
  try {
    const campInfo = dbOps.getCampInfo();
    res.json(campInfo);
  } catch (error) {
    console.error("Get camp info error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/camp-info", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins can update camp info" });
    }

    dbOps.updateCampInfo(req.body);
    const updatedCampInfo = dbOps.getCampInfo();

    res.json({
      message: "Camp info updated successfully",
      campInfo: updatedCampInfo,
    });
  } catch (error) {
    console.error("Update camp info error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/food", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins can add food entries" });
    }

    const { scoutId, food_name, food_time, food_date, received } = req.body;

    if (!scoutId || !food_name || !food_time || !food_date) {
      return res.status(400).json({
        error: "scoutId, food_name, food_time, and food_date are required",
      });
    }

    const result = dbOps.addFoodEntry(scoutId, {
      food_name,
      food_time,
      food_date,
      received,
    });

    res.status(201).json({
      message: "Food entry added successfully",
      foodId: result.lastInsertRowid,
    });
  } catch (error) {
    console.error("Add food entry error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/food/date/:date", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins can view food entries" });
    }

    const { date } = req.params;
    const foodEntries = dbOps.getFoodEntriesByDate(date);

    res.json(foodEntries);
  } catch (error) {
    console.error("Get food entries by date error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/food/:id/status", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins can update food status" });
    }

    const { id } = req.params;
    const { received } = req.body;

    dbOps.updateFoodStatus(id, received);

    res.json({ message: "Food status updated successfully" });
  } catch (error) {
    console.error("Update food status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/food/scout/:scoutId", authenticateToken, async (req, res) => {
  try {
    // Both admin and the scout himself can view food history
    if (
      req.user.role !== "admin" &&
      req.user.id !== parseInt(req.params.scoutId)
    ) {
      return res
        .status(403)
        .json({ error: "Unauthorized to view this scout food history" });
    }

    const { scoutId } = req.params;
    const foodHistory = dbOps.getScoutFoodHistory(scoutId);

    res.json(foodHistory);
  } catch (error) {
    console.error("Get scout food history error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Serve React app for all other routes (must be last)
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) return next(); // skip API
  res.send("hello world");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
