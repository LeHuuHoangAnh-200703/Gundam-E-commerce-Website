const express = require("express");
const router = express.Router();
const {
  getProvinces,
  getDistrict,
  getWard,
} = require("../controllers/locationController.js");

router.get("/provinces", getProvinces);
router.get("/districts", getDistrict);
router.get("/wards", getWard);

module.exports = router;
