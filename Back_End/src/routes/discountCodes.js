const express = require('express');
const router = express.Router();
const discountCodeController = require('../controllers/discountCodeControllers');

router.get("/", discountCodeController.getAllDiscountCodes);
router.get("/:idMaGG", discountCodeController.getDiscountCode);
router.post("/", discountCodeController.createDiscountCode);
router.put("/:idMaGG", discountCodeController.updatedDiscountCode);
router.delete("/:idMaGG", discountCodeController.deleteDiscountCode);

module.exports = router;