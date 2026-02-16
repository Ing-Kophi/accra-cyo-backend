const express = require("express");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/documentUpload");
const {
  getPublicDocuments,
  getAllDocuments,
  createDocument,
  deleteDocument
} = require("../controllers/documentsController");

const router = express.Router();

/* Public */
router.get("/public", getPublicDocuments);

/* Admin */
router.get("/", auth, getAllDocuments);
router.post("/", auth, upload.single("file"), createDocument);
router.delete("/:id", auth, deleteDocument);

module.exports = router;