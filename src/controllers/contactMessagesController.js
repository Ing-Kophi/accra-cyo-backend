const db = require("../config/db");
const nodemailer = require("nodemailer");

exports.sendContactMessage = async (req, res) => {
  const { name, email, message } = req.body;

  // Save message
  await db.query(
    "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
    [name, email, message]
  );

  // Send email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.CONTACT_EMAIL,
      pass: process.env.CONTACT_EMAIL_PASSWORD
    }
  });

  await transporter.sendMail({
    from: email,
    to: "accraarchcyo@gmail.com",
    subject: "New Contact Message – CYO Website",
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p>${message}</p>
    `
  });

  res.json({ message: "Message sent successfully" });
};