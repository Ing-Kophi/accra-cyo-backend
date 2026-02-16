const express = require("express");
const db = require("../config/db");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * GET all deaneries
 */
router.get("/", auth, async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT * FROM deaneries ORDER BY name ASC"
    );

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch deaneries" });
  }
});

/**
 * CREATE deanery
 */
router.post("/", auth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Deanery name is required" });
    }

    await db.query(
      "INSERT INTO deaneries (name) VALUES (?)",
      [name]
    );

    res.json({ message: "Deanery created successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to create deanery" });
  }
});

/**
 * UPDATE deanery
 */
router.put("/:id", auth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Deanery name is required" });
    }

    const [result] = await db.query(
      "UPDATE deaneries SET name = ? WHERE id = ?",
      [name, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Deanery not found" });
    }

    res.json({ message: "Deanery updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update deanery" });
  }
});

/**
 * DEACTIVATE deanery
 */
router.put("/deactivate/:id", auth, async (req, res) => {
  try {
    const [result] = await db.query(
      "UPDATE deaneries SET is_active = FALSE WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Deanery not found" });
    }

    res.json({ message: "Deanery deactivated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to deactivate deanery" });
  }
});

/**
 * REACTIVATE deanery (OPTIONAL but recommended)
 */
router.put("/activate/:id", auth, async (req, res) => {
  try {
    const [result] = await db.query(
      "UPDATE deaneries SET is_active = TRUE WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Deanery not found" });
    }

    res.json({ message: "Deanery reactivated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reactivate deanery" });
  }
});

module.exports = router;