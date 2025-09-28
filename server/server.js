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
    // const existingScout = dbOps.findScoutByEmail(scoutData.email);
    // if (existingScout) {
    //   return res
    //     .status(409)
    //     .json({ error: "Scout with this email already exists" });
    // }

    const result = dbOps.createScout(scoutData, req.user.id);

    res.status(201).json({
      message: "Scout registered successfully",
      scout: {
        id: result.lastInsertRowid,
        email: scoutData.email,
        name: scoutData.name,
      },
    });

    // console.log(result);
  } catch (error) {
    console.error("Scout registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/scout/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    const scout = dbOps.findScoutByEmail(phone);
    if (!scout || !(password === scout.password)) {
      //:)) I know that's not a good approach but time naai
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: scout.id, phone: scout.phone, role: "scout" },
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
    // if (!updateData.email || !updateData.name) {
    //   return res.status(400).json({ error: "Email and name are required" });
    // }

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

app.get("/api/kits/scout/:scoutId", authenticateToken, async (req, res) => {
  try {
    const { scoutId } = req.params;

    const kit = dbOps.getKitByScoutId(parseInt(scoutId));

    if (!kit) {
      return res.status(404).json({
        error: "Kit not found for this scout",
        kit: null,
      });
    }

    res.json({ kit });
  } catch (error) {
    console.error("Get kit error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all kits (admin only)
app.get("/api/kits", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can view all kits" });
    }

    const kits = dbOps.getAllKits();
    const summary = dbOps.getKitsSummary();

    res.json({
      kits,
      summary,
    });
  } catch (error) {
    console.error("Get all kits error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create or update kit for a scout
app.post("/api/kits/scout/:scoutId", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can manage kits" });
    }

    const { scoutId } = req.params;
    const kitData = req.body;

    // Validate required fields
    if (!kitData || typeof kitData !== "object") {
      return res.status(400).json({ error: "Kit data is required" });
    }

    const result = dbOps.createOrUpdateKit(
      parseInt(scoutId),
      kitData,
      req.user.id
    );

    const updatedKit = dbOps.getKitByScoutId(parseInt(scoutId));

    res.json({
      message: "Kit updated successfully",
      kit: updatedKit,
      changes: result.changes,
    });
  } catch (error) {
    console.error("Update kit error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update specific kit item
app.patch(
  "/api/kits/scout/:scoutId/item/:item",
  authenticateToken,
  async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ error: "Only admins can update kit items" });
      }

      const { scoutId, item } = req.params;
      const { received } = req.body;

      if (typeof received !== "boolean") {
        return res
          .status(400)
          .json({ error: "Received status is required and must be boolean" });
      }

      const result = dbOps.updateKitItem(
        parseInt(scoutId),
        item,
        received,
        req.user.id
      );

      const updatedKit = dbOps.getKitByScoutId(parseInt(scoutId));

      res.json({
        message: `${item} status updated successfully`,
        kit: updatedKit,
        changes: result.changes,
      });
    } catch (error) {
      console.error("Update kit item error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Delete kit for a scout
app.delete("/api/kits/scout/:scoutId", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can delete kits" });
    }

    const { scoutId } = req.params;

    const result = dbOps.deleteKit(parseInt(scoutId));

    if (result.changes === 0) {
      return res.status(404).json({ error: "Kit not found" });
    }

    res.json({
      message: "Kit deleted successfully",
      deletedScoutId: parseInt(scoutId),
    });
  } catch (error) {
    console.error("Delete kit error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get kit summary (admin only)
app.get("/api/kits/summary", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins can view kit summary" });
    }

    const summary = dbOps.getKitsSummary();
    const totalScouts = db
      .prepare("SELECT COUNT(*) as count FROM scouts")
      .get();

    res.json({
      summary,
      totalScouts: totalScouts.count,
      distributionRate: {
        tshirt: Math.round((summary.tshirt_count / totalScouts.count) * 100),
        scarf: Math.round((summary.scarf_count / totalScouts.count) * 100),
        waggle: Math.round((summary.waggle_count / totalScouts.count) * 100),
        keychain: Math.round(
          (summary.keychain_count / totalScouts.count) * 100
        ),
        pen: Math.round((summary.pen_count / totalScouts.count) * 100),
      },
    });
  } catch (error) {
    console.error("Get kit summary error:", error);
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
