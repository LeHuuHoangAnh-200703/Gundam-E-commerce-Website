const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  MaSanPham: { type: String, required: true },
  SoLuongTon: { type: Number, required: true, default: 0 },
  GiaNhapGanNhat: { type: Number, default: 0 },
  NgayCapNhat: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Inventory", inventorySchema);