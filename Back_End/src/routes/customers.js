const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customersController');

router.get("/", customersController.getAllCustomers);
router.get("/:maKhachHang", customersController.getCustomer);
router.post("/", customersController.createCustomer);
router.put("/:maKhachHang", customersController.upload, customersController.updateCustomer);
router.delete("/:maKhachHang", customersController.deleteCustomer);
router.post("/login", customersController.login);
router.get("/loginGoogle/google", customersController.loginGoogle);
router.post("/thongtin/:maKhachHang", customersController.createInfoCustomer);
router.post("/logout", customersController.logout);
router.delete("/diachi/:maKhachHang/:id", customersController.deleteLocation);
router.post("/luuma/:maKhachHang/:IdMaGiamGia", customersController.saveDiscountCode);
router.delete("/magiamgia/:maKhachHang/:IdMaGiamGia", customersController.deleteDiscountCode);
router.post("/send-otp", customersController.sendOTP);
router.post("/verify-otp", customersController.verifyOTP);
router.post("/quenmatkhau", customersController.resetPassword);
router.patch("/tinhtrangtaikhoan/:maKhachHang", customersController.hiddenAccount);
router.post("/guimail", customersController.sendEmail);

module.exports = router;