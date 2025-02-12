const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    MaDonHang: String,
    MaKhachHang: String,
    TenKhachHang: String,
    Email: String,
    DiaChiNhanHang: [{
      TenNguoiNhan: String,
      DiaChi: String,
      DienThoai: String
    }],
    SanPhamDaMua: [{  
        TenSanPham: String,  
        MaSanPham: String,  
        Gia: Number,  
        SoLuong: Number,
        LoaiSanPham: String,  
        HinhAnh: String  
    }],
    IdMaGiamGia: String,
    HinhThucThanhToan: String,
    TongDon: Number,
    GhiChu: String,
    NgayDatHang: Date,
    TrangThaiThanhToan: String,
    TrangThaiDon: { type: String, enum: ['Đang chờ xác nhận', 'Đang chờ lấy hàng', 'Đã được chuyển đi', 'Đã nhận được hàng', 'Đã giao thành công'], default: 'Đang chờ xác nhận' },
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