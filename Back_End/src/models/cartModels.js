const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    MaGioHang: String,
    MaKhachHang: String,
    MaSanPham: String,
    SoLuong: Number,
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