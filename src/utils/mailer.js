const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.CONTACT_EMAIL,
    pass: process.env.CONTACT_EMAIL_PASSWORD
  }
});

exports.sendContactEmail = async ({ name, email, message }) => {
  const mailOptions = {
    from: `"CYO Website Contact" <${process.env.CONTACT_EMAIL}>`,
    to: process.env.CONTACT_EMAIL,
    replyTo: email,
    subject: "New Contact Message - Accra Archdiocesan CYO",
    html: `
      <h3>New Contact Message</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <hr />
      <p>${message.replace(/\n/g, "<br />")}</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

/* =========================
   AUTO-REPLY EMAIL
========================= */
exports.sendAutoReply = async ({ name, email }) => {
  await transporter.sendMail({
    from: `"Accra Archdiocesan CYO" <${process.env.CONTACT_EMAIL}>`,
    to: email,
    subject: "We have received your message",
    html: `
      <p>Dear ${name},</p>

      <p>
        Thank you for contacting the <strong>Accra Archdiocesan Catholic Youth Organization (CYO)</strong>.
        We have received your message and a member of our team will respond as soon as possible.
      </p>

      <p>
        May God bless you abundantly.
      </p>

      <p>
        <strong>For God and Ghana</strong><br/>
        Accra Archdiocesan CYO
      </p>
    `
  });
};