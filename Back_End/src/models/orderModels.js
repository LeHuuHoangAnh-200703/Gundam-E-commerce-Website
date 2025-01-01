const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    MaDonHang: String,
    TenKhachHang: String,
    Email: String,
    DienThoai: String,
    DiaChiNhanHang: String,
    SanPhamDaMua: [String],
    MaGiamGia: String,
    HinhThucThanhToan: String,
    TongDon: String,
    GhiChu: String,
    TrangThaiDon: { type: String, enum: ['Đang chờ xác nhận', 'Đang chờ lấy hàng', 'Đã được chuyển đi', 'Giao hàng thành công'], default: 'Đang chờ xác nhận' },
});

function generateMaDonHang() {  
  return 'DH' + Math.floor(10000 + Math.random() * 90000); 
}

orderSchema.pre("save", async function (next) {
  try {
    if (!this.MaDonHang) {  
      this.MaDonHang = generateMaDonHang();  
    } 
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Order", orderSchema);