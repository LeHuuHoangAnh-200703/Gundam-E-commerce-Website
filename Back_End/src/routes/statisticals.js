const express = require('express');
const router = express.Router();
const statisticalController = require('../controllers/statisticalControllers');

router.get("/", statisticalController.getAll);
// router.get("/:maDonHang", orderController.getOrder);

module.exports = router;