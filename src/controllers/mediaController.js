const db = require("../config/db");

const ALLOWED_MEDIA_CATEGORIES = [
  "Camp",
  "Competitions",
  "Leadership",
  "Mass",
  "Recollection",
  "Meetings",
  "General"
];

/* -------- PUBLIC -------- */
exports.getPublicMedia = async (req, res) => {
  try {
    const { category } = req.query;

    let sql = `
      SELECT id, title, caption, file_name, category
      FROM media
      WHERE is_public = TRUE
    `;
    const params = [];

    if (category && category !== "All") {
      sql += " AND category = ?";
      params.push(category);
    }

    sql += " ORDER BY uploaded_at DESC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch media" });
  }
};

/* -------- ADMIN -------- */
exports.getAllMedia = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM media ORDER BY uploaded_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch media" });
  }
};

exports.createMedia = async (req, res) => {
  try {
    const { title, caption, category, is_public } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Category validation
    if (!category || !ALLOWED_MEDIA_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Invalid media category"
      });
    }

    await db.query(
      `INSERT INTO media
       (title, caption, category, file_name, is_public)
       VALUES (?, ?, ?, ?, ?)`,
      [
        title || null,
        caption || null,
        category || null,
        req.file.filename,
        is_public ? 1 : 0
      ]
    );

    res.json({ message: "Media uploaded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload media" });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM media WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Media not found" });
    }

    res.json({ message: "Media deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete media" });
  }
};

