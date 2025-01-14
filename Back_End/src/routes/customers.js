const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customersController');

router.get("/", customersController.getAllCustomers);
router.get("/:maKhachHang", customersController.getCustomer);
router.post("/", customersController.createCustomer);
router.put("/:maKhachHang", customersController.upload, customersController.updateCustomer);
router.delete("/:maKhachHang", customersController.deleteCustomer);
router.post("/login", customersController.login);
router.post("/thongtin/:maKhachHang", customersController.createInfoCustomer);
router.post("/logout", customersController.logout);

module.exports = router;