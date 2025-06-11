const express = require('express');
const router = express.Router();
const chatBotController = require('../controllers/chatBotController');

router.get("/:maKhachHang", chatBotController.getMessageWithChatBotById);
router.post("/", chatBotController.createMessageWithChatBot);

module.exports = router;