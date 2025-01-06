const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryControllers');

router.get("/", inventoryController.getAllInventories);

module.exports = router;