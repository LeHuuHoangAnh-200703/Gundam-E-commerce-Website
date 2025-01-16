const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageControllers');

router.get("/:chatId", messageController.getMessagesByChatId);
router.post("/", messageController.addMessage);

module.exports = router;