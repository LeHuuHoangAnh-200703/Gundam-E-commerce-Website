const mongoose = require("mongoose");

const WardSchema = new mongoose.Schema({
  Id: String,
  Name: String,
  Level: String // "Phường" hoặc "Xã"
});

const DistrictSchema = new mongoose.Schema({
  Id: String,
  Name: String,
  Wards: [WardSchema]
});

const ProvinceSchema = new mongoose.Schema({
  Id: String,
  Name: String,
  Districts: [DistrictSchema]
});

module.exports = mongoose.model("Province", ProvinceSchema);