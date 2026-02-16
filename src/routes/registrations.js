const express = require("express");
const db = require("../config/db");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * GET all registrations (with year & parish info)
 */
router.get("/years", async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT id, year_label FROM registration_years WHERE is_locked = TRUE ORDER BY year_label DESC"
    );
    res.json(results);
  } catch (err) {
    res.status(500).json(err);
  }
});

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
    res.status(500).json(err);
  }
});

/**
 * GET all registrations (ADMIN – for View Registrations page)
 */
router.get("/", auth, async (req, res) => {
  try {
    const sql = `
      SELECT
        r.id,
        r.infant_male, r.infant_female,
        r.apostle_male, r.apostle_female,
        r.soldier_male, r.soldier_female,
        r.officer_male, r.officer_female,
        y.year_label,
        y.is_locked,
        p.name AS parish_name,
        d.name AS deanery_name
      FROM registrations r
      JOIN registration_years y ON r.year_id = y.id
      JOIN parishes p ON r.parish_id = p.id
      JOIN deaneries d ON p.deanery_id = d.id
      ORDER BY y.year_label DESC, d.name, p.name
    `;

    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch registrations" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const {
      year_id,
      parish_id,
      infant_male, infant_female,
      apostle_male, apostle_female,
      soldier_male, soldier_female,
      officer_male, officer_female
    } = req.body;

    const [[year]] = await db.query(
      "SELECT is_locked FROM registration_years WHERE id = ?",
      [year_id]
    );
    if (!year) return res.status(400).json({ message: "Invalid year" });
    if (year.is_locked)
      return res.status(403).json({ message: "Year is locked" });

    const [[parish]] = await db.query(
      "SELECT is_active FROM parishes WHERE id = ?",
      [parish_id]
    );
    if (!parish) return res.status(400).json({ message: "Invalid parish" });
    if (!parish.is_active)
      return res.status(403).json({ message: "Parish is inactive" });

    await db.query(
      `INSERT INTO registrations (
        year_id, parish_id,
        infant_male, infant_female,
        apostle_male, apostle_female,
        soldier_male, soldier_female,
        officer_male, officer_female
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        year_id, parish_id,
        infant_male, infant_female,
        apostle_male, apostle_female,
        soldier_male, soldier_female,
        officer_male, officer_female
      ]
    );

    res.json({ message: "Registration saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save registration" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const data = req.body;

    const [[record]] = await db.query(
      `SELECT y.is_locked
       FROM registrations r
       JOIN registration_years y ON r.year_id = y.id
       WHERE r.id = ?`,
      [req.params.id]
    );

    if (!record)
      return res.status(400).json({ message: "Invalid record" });
    if (record.is_locked)
      return res.status(403).json({ message: "Year is locked" });

    await db.query(
      `UPDATE registrations SET
        infant_male = ?, infant_female = ?,
        apostle_male = ?, apostle_female = ?,
        soldier_male = ?, soldier_female = ?,
        officer_male = ?, officer_female = ?
       WHERE id = ?`,
      [
        data.infant_male, data.infant_female,
        data.apostle_male, data.apostle_female,
        data.soldier_male, data.soldier_female,
        data.officer_male, data.officer_female,
        req.params.id
      ]
    );

    res.json({ message: "Registration updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update registration" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const [result] = await db.query(
      `DELETE r FROM registrations r
       JOIN registration_years y ON r.year_id = y.id
       WHERE r.id = ? AND y.is_locked = FALSE`,
      [req.params.id]
    );

    if (result.affectedRows === 0)
      return res.status(403).json({ message: "Year is locked" });

    res.json({ message: "Registration deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete registration" });
  }
});
module.exports = router;