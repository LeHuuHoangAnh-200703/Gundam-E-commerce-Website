const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    MaGioHang: String,
    MaSanPham: String,
    TenSanPham: String,
    LoaiSanPham: String,
    SoLuong: Number,
    DonGia: String,
    HinhAnh: String,
});

function generateMaGioHang() {  
  return 'GH' + Math.floor(10000 + Math.random() * 90000); 
}

cartSchema.pre("save", async function (next) {
  try {
    if (!this.MaGioHang) {  
      this.MaGioHang = generateMaGioHang();  
    } 
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Cart", cartSchema);