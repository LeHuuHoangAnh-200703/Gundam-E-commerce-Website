const mongoose = require("mongoose");

const discountCodeSchema = new mongoose.Schema({
    IdMaGiamGia: String,
    TenMaGiamGia: String,
    GiaApDung: String,
    GiamTien: String,
    GiamPhanTram: Number,
    SoLanSuDung: Number,
    NgayHetHan: Date,
    SoLanLuuMa: Number,
    IdKhachHangSuDung: [String],
    NgayTao: Date,
});

function generateIdMaGiamGia() {  
  return 'IDMGG' + Math.floor(10000 + Math.random() * 90000); 
}

discountCodeSchema.pre("save", async function (next) {
  try {
    if (!this.IdMaGiamGia) {  
      this.IdMaGiamGia = generateIdMaGiamGia();  
    } 
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("DiscountCode", discountCodeSchema);