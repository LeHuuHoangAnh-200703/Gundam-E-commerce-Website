const express = require('express');
const router = express.Router();
const vnpayController = require('../controllers/vnpayController');

router.get("/vnpay-ipn", vnpayController.handleIpn);
router.get("/vnpay-return", vnpayController.handleReturnUrl);
router.post("/", vnpayController.createPaymentUrl);

module.exports = router;