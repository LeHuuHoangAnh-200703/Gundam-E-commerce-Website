const express = require('express');
const router = express.Router();
const productController = require('../controllers/productsController');

router.get("/", productController.getAllProducts);
router.get("/:maSanPham", productController.getProduct);
router.post("/", productController.upload ,productController.createProduct);
router.put("/:maSanPham", productController.updatedProduct);
router.delete("/:maSanPham", productController.deleteProduct);

module.exports = router;