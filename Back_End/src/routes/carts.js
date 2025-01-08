const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartControllers');

router.get("/", cartController.getAllCarts);
router.get("/:maGioHang", cartController.getCart);
router.get("/khachhang/:maKhachHang", cartController.getCartByID);
router.post("/:maSanPham", cartController.createCart);
router.delete("/:maGioHang", cartController.deleteCart);

module.exports = router;