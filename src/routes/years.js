const express = require("express");
const db = require("../config/db");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * GET all years (admin)
 */
router.get("/", auth, async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT * FROM registration_years ORDER BY year_label DESC"
    );
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch years" });
  }
});

/**
 * CREATE a year
 */
router.post("/", auth, async (req, res) => {
  try {
    const { year_label } = req.body;

    await db.query(
      "INSERT INTO registration_years (year_label) VALUES (?)",
      [year_label]
    );

    res.json({ message: "Year created successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to create year" });
  }
});

/**
 * UPDATE year (only if NOT locked)
 */
router.put("/:id", auth, async (req, res) => {
  try {
    const { year_label } = req.body;

    const [result] = await db.query(
      "UPDATE registration_years SET year_label = ? WHERE id = ? AND is_locked = FALSE",
      [year_label, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Year is locked" });
    }

    res.json({ message: "Year updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update year" });
  }
});

/**
 * LOCK year
 */
router.put("/lock/:id", auth, async (req, res) => {
  try {
    await db.query(
      "UPDATE registration_years SET is_locked = TRUE WHERE id = ?",
      [req.params.id]
    );

    res.json({ message: "Year locked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to lock year" });
  }
});

/**
 * DELETE year (only if NOT locked)
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM registration_years WHERE id = ? AND is_locked = FALSE",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Year is locked" });
    }

    res.json({ message: "Year deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete year" });
  }
});

module.exports = router;