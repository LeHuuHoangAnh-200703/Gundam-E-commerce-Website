const mongoose = require("mongoose");

const productTypeSchema = new mongoose.Schema({
    MaLoaiSanPham: String,
    TenLoaiSanPham: String,
    LoaiSanPham: String,
    NgayTao: { type: Date, default: Date.now },
});

function generateMaLoaiSanPham() {  
  return 'LSP' + Math.floor(10000 + Math.random() * 90000); 
}

productTypeSchema.pre("save", async function (next) {
  try {
    if (!this.MaLoaiSanPham) {  
      this.MaLoaiSanPham = generateMaLoaiSanPham();  
    } 
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("ProductType", productTypeSchema);