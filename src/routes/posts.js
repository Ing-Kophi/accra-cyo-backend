const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadPostImage");
const {
  getPublicPosts,
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
} = require("../controllers/postsController");

// Public
router.get("/public", getPublicPosts);

// Admin
router.get("/", auth, getAllPosts);
router.get("/:id", auth, getPostById);
router.post("/", auth, upload.array("images", 3), createPost);
router.put("/:id", auth, upload.array("images", 3), updatePost);
router.delete("/:id", auth, deletePost);

module.exports = router;