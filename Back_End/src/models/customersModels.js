const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const customerSchema = new mongoose.Schema({
    MaKhachHang: String,
    TenKhachHang: String,
    Email: String,
    MatKhau: String,
    NgayTao: { type: Date, required: true },
});

function generateMaKhachHang() {  
  return 'KH' + Math.floor(10000 + Math.random() * 90000); 
}

customerSchema.pre("save", async function (next) {
  if (!this.isModified("MatKhau")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.MatKhau = await bcrypt.hash(this.MatKhau, salt);
    if (!this.MaKhachHang) {  
      this.MaKhachHang = generateMaKhachHang();  
    } 
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Customer", customerSchema);