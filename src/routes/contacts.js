const express = require("express");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/imageUpload"); // multer for photos
const {
  getPublicExecutives,
  getAllExecutives,
  createExecutive,
  updateExecutive,
  deleteExecutive,
  getOfficeContact,
  updateOfficeContact
} = require("../controllers/contactsController");
const { sendContactMessage } = require("../controllers/contactsController");
const router = express.Router();

/* ---------- PUBLIC ---------- */
router.get("/executives/public", getPublicExecutives);
router.get("/office", getOfficeContact);
router.post("/message", sendContactMessage);

/* ---------- ADMIN ---------- */
router.get("/executives", auth, getAllExecutives);
router.post(
  "/executives",
  auth,
  upload.single("photo"),
  createExecutive
);
router.put(
  "/executives/:id",
  auth,
  upload.single("photo"),
  updateExecutive
);
router.delete("/executives/:id", auth, deleteExecutive);

router.put("/office", auth, updateOfficeContact);

module.exports = router;