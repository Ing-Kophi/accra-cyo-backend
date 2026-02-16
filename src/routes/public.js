const express = require("express");
const db = require("../config/db");

const router = express.Router();

/**
 * GET published (locked) registration years
 */
router.get("/years", async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT id, year_label FROM registration_years WHERE is_locked = TRUE ORDER BY year_label DESC"
    );
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch years" });
  }
});

/**
 * GET published registrations for a given year
 */
router.get("/registrations/:yearLabel", async (req, res) => {
  try {
    const { yearLabel } = req.params;

    const sql = `
      SELECT r.*,
             y.year_label,
             p.name AS parish_name,
             d.name AS deanery_name
      FROM registrations r
      JOIN registration_years y ON r.year_id = y.id
      JOIN parishes p ON r.parish_id = p.id
      JOIN deaneries d ON p.deanery_id = d.id
      WHERE y.year_label = ? AND y.is_locked = TRUE
      ORDER BY d.name, p.name
    `;

    const [results] = await db.query(sql, [yearLabel]);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch registrations" });
  }
});

module.exports = router;