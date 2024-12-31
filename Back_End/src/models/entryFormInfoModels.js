const mongoose = require("mongoose");

const entryFormInfoSchema = new mongoose.Schema({
    MaChiTietPhieuNhap: String,
    MaPhieuNhap: String,
    MaSanPham: String,
    TenSanPham: String,
    GiaNhap: String,
    SoLuong: Number,
    TongTien: String,
    NgayNhap: { type: Date, required: true },
});

function generateMaChiTietPhieuNhap() {  
  return 'CTPN' + Math.floor(10000 + Math.random() * 90000); 
}

entryFormInfoSchema.pre("save", async function (next) {
  try {
    if (!this.MaChiTietPhieuNhap) {  
      this.MaChiTietPhieuNhap = generateMaChiTietPhieuNhap();  
    } 
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("EntryFormInfo", entryFormInfoSchema);