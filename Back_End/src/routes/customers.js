const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customersController');

router.get("/", customersController.getAllCustomers);
router.get("/:maKhachHang", customersController.getCustomer);
router.post("/", customersController.createCustomer);
router.put("/:maKhachHang", customersController.updateCustomer);
router.delete("/:maKhachHang", customersController.deleteCustomer);
router.post("/login", customersController.login);

module.exports = router;