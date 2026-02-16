require("dotenv").config();
const express = require("express");
const cors = require("cors");

const adminAuthRoutes = require("./src/routes/adminAuth");
const yearRoutes = require("./src/routes/years");
const deaneryRoutes = require("./src/routes/deaneries");
const parishRoutes = require("./src/routes/parishes");
const registrationRoutes = require("./src/routes/registrations");
const publicRoutes = require("./src/routes/public");
const documentRoutes = require("./src/routes/documents");
const path = require("path");
const contactsRoutes = require("./src/routes/contacts");
const app = express();


app.use(cors({
  origin: [
    "http://localhost:3000",
    "https//accracyo.netlify.app"
  ],
  credentials: true
}));
app.use(express.json());

app.use("/api/admin", adminAuthRoutes);
app.use("/api/years", yearRoutes);
app.use("/api/deaneries", deaneryRoutes);
app.use("/api/parishes", parishRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/posts", require("./src/routes/posts"));
app.use("/uploads", express.static("uploads"));
app.use("/api/documents", documentRoutes);
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);
app.use("/api/contacts", contactsRoutes);
app.use("/uploads/executives", express.static("uploads/executives"));
app.use("/uploads/media", express.static("uploads/media"));
app.use("/api/media", require("./src/routes/media"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
