const express = require('express');
const router = express.Router();
const productController = require('../controllers/productsController');

router.get("/", productController.getAllProducts);
router.get("/:maSanPham", productController.getProduct);
router.post("/", productController.upload ,productController.createProduct);
router.put("/:maSanPham", productController.upload, productController.updatedProduct);
router.patch("/:maSanPham", productController.updateProductStatus);

module.exports = router;