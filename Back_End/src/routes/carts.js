const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartControllers');

router.get("/", cartController.getAllCarts);
router.get("/:maGioHang", cartController.getCart);
router.get("/khachhang/:maKhachHang", cartController.getCartByID);
router.post("/:maSanPham", cartController.createCart);
router.delete("/:maGioHang", cartController.deleteCart);
router.post("/kiemtra/:maKhachHang", cartController.checkQuantity);
router.put("/", cartController.updateCartItem);

module.exports = router;