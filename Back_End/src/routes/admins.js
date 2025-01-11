const express = require('express');
const router = express.Router();
const adminsController = require('../controllers/adminsController');

router.get("/", adminsController.getAllAdmins);
router.get("/:maAdmin", adminsController.getAdmin);
router.post("/", adminsController.createAdmin);
router.put("/:maAdmin", adminsController.updateAdmin);
router.delete("/:maAdmin", adminsController.deleteAdmin);
router.post("/login", adminsController.login);
router.patch("/trangthai/:maAdmin", adminsController.updateStatus);

module.exports = router;