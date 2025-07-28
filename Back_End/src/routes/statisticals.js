const express = require('express');
const router = express.Router();
const statisticalController = require('../controllers/statisticalControllers');

router.get("/", statisticalController.getAll);
router.get("/donhangtheothang", statisticalController.getRevenueByDay);
router.get("/donhangtheonam", statisticalController.getRevenueByMonth);
router.get("/trangthaidonhang", statisticalController.getOrderStatus);
router.get("/topluotban", statisticalController.getTopSellingProducts);
router.get("/danhgiasanpham", statisticalController.getFeedBackProducts);
router.get("/nhapxuatton/:maSanPham", statisticalController.getEnterWarehouse);
router.get("/loinhuan", statisticalController.getMonthlyProfit);

module.exports = router;