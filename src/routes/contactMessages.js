const express = require("express");
const { sendContactMessage } = require("../controllers/contactMessagesController");

const router = express.Router();

/* PUBLIC */
router.post("/", sendContactMessage);

module.exports = router;