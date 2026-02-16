const db = require("../config/db");

/**
 * PUBLIC: Get all public documents
 */
exports.getPublicDocuments = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM documents WHERE is_public = TRUE ORDER BY uploaded_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch documents" });
  }
};

/**
 * ADMIN: Get all documents
 */
exports.getAllDocuments = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM documents ORDER BY uploaded_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch documents" });
  }
};

/**
 * ADMIN: Upload document
 */
exports.createDocument = async (req, res) => {
  try {
    const { title, category, description, is_public } = req.body;

    if (!req.file || !title || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await db.query(
      `INSERT INTO documents
        (title, category, description, file, is_public)
       VALUES (?, ?, ?, ?, ?)`,
      [
        title,
        category,
        description || null,
        req.file.filename,
        is_public ? 1 : 0
      ]
    );

    res.json({ message: "Document uploaded" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload document" });
  }
};

/**
 * ADMIN: Delete document
 */
exports.deleteDocument = async (req, res) => {
  try {
    await db.query(
      "DELETE FROM documents WHERE id = ?",
      [req.params.id]
    );

    res.json({ message: "Document deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete document" });
  }
};