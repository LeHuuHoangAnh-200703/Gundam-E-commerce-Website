const express = require('express');
const router = express.Router();
const productTypeController = require('../controllers/productTypeController');

router.get("/", productTypeController.getAllProductType);
router.get("/:maLoaiSanPham", productTypeController.getProductTye);
router.post("/", productTypeController.createProductType);
router.put("/:maLoaiSanPham", productTypeController.updateProductType);
router.delete("/:maLoaiSanPham", productTypeController.deleteProductType);

module.exports = router;