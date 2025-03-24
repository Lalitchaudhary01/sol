const express = require("express");
const { submitSupportTicket } = require("../controllers/supportController");

const router = express.Router();

// POST route for submitting a support ticket
router.post("/support", submitSupportTicket);

module.exports = router;
