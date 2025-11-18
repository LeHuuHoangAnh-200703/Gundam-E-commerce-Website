const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationControllers');

router.get("/", notificationController.getAllNotifications);
router.get("/:maTB", notificationController.getNotification);
router.post("/", notificationController.createNotification);

module.exports = router;