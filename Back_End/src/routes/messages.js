const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageControllers");

router.post("/", messageController.addMessage);
router.get("/", messageController.getMessages);

module.exports = router;