const express = require('express');
const router = express.Router();
const suppliersController = require('../controllers/suppliersControllers');

router.get("/", suppliersController.getAllSuppliers);
router.get("/:maNCC", suppliersController.getSupplier);
router.post("/", suppliersController.createSupplier);
router.put("/:maNCC", suppliersController.updatedSupplier);
router.delete("/:maNCC", suppliersController.deleteSupplier);

module.exports = router;