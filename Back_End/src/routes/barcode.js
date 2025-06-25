const express = require('express');
const router = express.Router();
const barcodeController = require('../controllers/barcodeController');

router.get("/:barcode", barcodeController.getProductByBarCode);
router.post("/", barcodeController.addStock);

module.exports = router;