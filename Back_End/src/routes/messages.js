const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageControllers');

router.get("/:MaCuocTroChuyen", messageController.getMessagesByChatId);
router.post("/", messageController.addMessage);

module.exports = router;