const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    MaSanPham: String,
    TenSanPham: String,
    GiaBan: String,
    LoaiSanPham: String,
    MaNhaCungCap: String,
    LuotBan: { type: Number, default: 0},
    MoTa: String,
    Images: [String],
    YoutubeUrl: String,
    TinhNang: String,
    NgayBan: { type: Date, default: Date.now },
    TrangThai: { type: String, enum: ['Đang bán', 'Ngừng kinh doanh'], default: 'Đang bán' },
});

function generateMaSanPham() {  
  return 'GunDam' + Math.floor(10000 + Math.random() * 90000); 
}

productSchema.pre("save", async function (next) {
  try {
    if (!this.MaSanPham) {  
      this.MaSanPham = generateMaSanPham();  
    } 
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Product", productSchema);