const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderControllers');

router.get("/", orderController.getAllOrders);
router.get("/:maDonHang", orderController.getOrder);
router.post("/", orderController.createOrder);
router.post("/luutamdon", orderController.createTempOrder);
router.put("/:maDonHang", orderController.updatedOrder);
router.delete("/:maDonHang",orderController.deleteOrder);
router.get("/khachhang/:maKhachHang", orderController.getOrderById);
router.patch("/trangthai/:maDonHang", orderController.updatedStatus);
router.get("/thongke/revenue-by-month", orderController.getRevenueByMonth);
router.get("/thongke/get-order-status", orderController.getOrderStatus);
router.get("/thongke/revenue-by-day", orderController.getRevenueByDay);
router.get("/kiemtradanhgia/:maDonHang", orderController.checkOrderReviewed);
router.get("/locdonhang/ngaythangnam", orderController.getOrderByDayMonth);
router.post("/guiemail", orderController.sendEmailOrder);

module.exports = router;