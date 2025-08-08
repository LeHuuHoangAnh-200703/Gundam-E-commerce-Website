const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const customerSchema = new mongoose.Schema({
  MaKhachHang: String,
  TenKhachHang: String,
  Email: String,
  MatKhau: String,
  Image: String,
  NgayTao: { type: Date, required: true },
  DanhSachDiaChi: [
    {
      TenNguoiNhan: String,
      DienThoai: String,
      DiaChi: String,
    },
  ],
  DanhSachMaGiamGia: [
    {
      IdMaGiamGia: String,
      TenMaGiamGia: String,
      GiaApDung: String,
      GiamTien: String,
      GiamPhanTram: Number,
      SoLanSuDung: Number,
      NgayHetHan: Date,
      MaGiamGia: String,
    },
  ],
  TinhTrangTaiKhoan: { type: String, enum: ['Đang sử dụng' ,'Vô hiệu hóa'], default: 'Đang sử dụng' },
  TrangThai: { type: Number, default: 0 },
  LyDoKhoa: String,
  provider: String, // Thêm: 'google' hoặc null cho đăng nhập thường
  providerId: String, // Thêm: ID từ Google
});

function generateMaKhachHang() {
  return "KH" + Math.floor(10000 + Math.random() * 90000);
}

customerSchema.pre("save", async function (next) {
  if (this.isModified("MatKhau") && this.MatKhau) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.MatKhau = await bcrypt.hash(this.MatKhau, salt);
    } catch (error) {
      return next(error);
    }
  }
  if (!this.MaKhachHang) {
    this.MaKhachHang = generateMaKhachHang();
  }
  if (!this.NgayTao) {
    this.NgayTao = new Date();
  }
  next();
});

module.exports = mongoose.model("Customer", customerSchema);
