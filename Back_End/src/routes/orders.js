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
router.patch("/trangthai/:maDonHang", orderController.updatedStatus);;
// router.get("/kiemtradanhgia/:maDonHang", orderController.checkOrderReviewed);
router.get("/locdonhang/ngaythangnam", orderController.getOrderByDayMonth);
router.post("/guiemail", orderController.sendEmailOrder);
router.post("/tinhphiship", orderController.calculateShippingFee);
router.post("/capnhatmagiamgia", orderController.calculateDiscount);

module.exports = router;