const express = require("express");
const db = require("../config/db");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * GET all parishes (with deanery name)
 */
router.get("/", auth, async (req, res) => {
  try {
    const sql = `
      SELECT p.*, d.name AS deanery_name
      FROM parishes p
      JOIN deaneries d ON p.deanery_id = d.id
      ORDER BY d.name ASC, p.name ASC
    `;

    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch parishes" });
  }
});

/**
 * CREATE parish
 */
router.post("/", auth, async (req, res) => {
  try {
    const { name, deanery_id } = req.body;

    if (!name || !deanery_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await db.query(
      "INSERT INTO parishes (name, deanery_id) VALUES (?, ?)",
      [name, deanery_id]
    );

    res.json({ message: "Parish created successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to create parish" });
  }
});

/**
 * UPDATE parish
 */
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, deanery_id } = req.body;

    if (!name || !deanery_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [result] = await db.query(
      "UPDATE parishes SET name = ?, deanery_id = ? WHERE id = ?",
      [name, deanery_id, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Parish not found" });
    }

    res.json({ message: "Parish updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update parish" });
  }
});

/**
 * DEACTIVATE parish
 */
router.put("/deactivate/:id", auth, async (req, res) => {
  try {
    const [result] = await db.query(
      "UPDATE parishes SET is_active = FALSE WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Parish not found" });
    }

    res.json({ message: "Parish deactivated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to deactivate parish" });
  }
});

/**
 * REACTIVATE parish
 */
router.put("/activate/:id", auth, async (req, res) => {
  try {
    const [result] = await db.query(
      "UPDATE parishes SET is_active = TRUE WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Parish not found" });
    }

    res.json({ message: "Parish reactivated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reactivate parish" });
  }
});

module.exports = router;