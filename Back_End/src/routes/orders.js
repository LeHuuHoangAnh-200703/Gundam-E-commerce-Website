const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderControllers');

router.get("/", orderController.getAllOrders);
router.get("/:maDonHang", orderController.getOrder);
router.post("/", orderController.createOrder);
router.put("/:maDonHang", orderController.updatedOrder);
router.delete("/:maDonHang",orderController.deleteOrder);
router.get("/khachhang/:maKhachHang", orderController.getOrderById);

module.exports = router;