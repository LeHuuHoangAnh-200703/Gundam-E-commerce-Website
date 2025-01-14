const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema({
    MaAdmin: String,
    TenAdmin: String,
    Email: String,
    ChucVu: String,
    MatKhau: String,
    NgayTao: { type: Date, required: true },
    TrangThaiHoatDong: { type: Number, default: 0 },
    TrangThai: { type: String, enum: ['Đang sử dụng', 'Đã vô hiệu hóa'], default: 'Đang sử dụng' },
});

function generateMaAdmin() {  
  return 'AM' + Math.floor(10000 + Math.random() * 90000); 
}

adminSchema.pre("save", async function (next) {
  if (!this.isModified("MatKhau")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.MatKhau = await bcrypt.hash(this.MatKhau, salt);
    if (!this.MaAdmin) {  
      this.MaAdmin = generateMaAdmin();  
    } 
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Admin", adminSchema);