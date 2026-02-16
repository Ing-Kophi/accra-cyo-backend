const express = require("express");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/mediaUpload");
const {
  getPublicMedia,
  getAllMedia,
  createMedia,
  deleteMedia
} = require("../controllers/mediaController");

const router = express.Router();

/* PUBLIC */
router.get("/public", getPublicMedia);

/* ADMIN */
router.get("/", auth, getAllMedia);
router.post("/", auth, upload.single("image"), createMedia);
router.delete("/:id", auth, deleteMedia);

module.exports = router;