const mongoose = require("mongoose");

const entryFormSchema = new mongoose.Schema({
    MaPhieuNhap: String,
    MaNhaCungCap: String,
    TenNhaCungCap: String,
    MaNhanVien: String,
    TenNhanVien: String,
    NgayNhap: { type: Date, required: true },
});

function generateMaPhieuNhap() {  
  return 'PN' + Math.floor(10000 + Math.random() * 90000); 
}

entryFormSchema.pre("save", async function (next) {
  try {
    if (!this.MaPhieuNhap) {  
      this.MaPhieuNhap = generateMaPhieuNhap();  
    } 
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("EntryForm", entryFormSchema);