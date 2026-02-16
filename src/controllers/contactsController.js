const db = require("../config/db");

/* PUBLIC EXECUTIVES */
exports.getPublicExecutives = async (req, res) => {
  const [rows] = await db.query(
    `SELECT id, full_name, position, phone, parish, photo
     FROM executive_contacts
     WHERE is_active = TRUE
     ORDER BY id`
  );
  res.json(rows);
};

/* ADMIN */
exports.getAllExecutives = async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM executive_contacts ORDER BY created_at DESC"
  );
  res.json(rows);
};

exports.createExecutive = async (req, res) => {
  const { full_name, position, phone, parish } = req.body;
  const photo = req.file ? req.file.filename : null;

  await db.query(
    `INSERT INTO executive_contacts
     (full_name, position, phone, parish, photo)
     VALUES (?, ?, ?, ?, ?)`,
    [full_name, position, phone, parish, photo]
  );

  res.json({ message: "Executive added" });
};

exports.updateExecutive = async (req, res) => {
  const { full_name, position, phone, parish } = req.body;
  const photo = req.file ? req.file.filename : null;

  await db.query(
    `UPDATE executive_contacts SET
     full_name=?, position=?, phone=?, parish=?,
     photo = COALESCE(?, photo)
     WHERE id=?`,
    [full_name, position, phone, parish, photo, req.params.id]
  );

  res.json({ message: "Executive updated" });
};

exports.deleteExecutive = async (req, res) => {
  await db.query(
    "UPDATE executive_contacts SET is_active = FALSE WHERE id=?",
    [req.params.id]
  );
  res.json({ message: "Executive removed" });
};

/* OFFICE CONTACT */
exports.getOfficeContact = async (req, res) => {
  const [[row]] = await db.query("SELECT * FROM office_contact WHERE id = 1");
  res.json(row);
};

exports.updateOfficeContact = async (req, res) => {
  const { email, location } = req.body;

  await db.query(
    `INSERT INTO office_contact (id, email, location)
     VALUES (1, ?, ?)
     ON DUPLICATE KEY UPDATE
     email=?, location=?`,
    [email, location, email, location]
  );

  res.json({ message: "Office contact updated" });
};

const {
  sendContactEmail,
  sendAutoReply
} = require("../utils/mailer");

exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 1. Send message to admin
    await sendContactEmail({ name, email, message });

    // 2. Send auto-reply to sender
    await sendAutoReply({ name, email });

    res.json({ message: "Message sent successfully" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};