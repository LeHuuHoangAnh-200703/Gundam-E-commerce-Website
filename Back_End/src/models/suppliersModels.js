const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
    MaNhaCungCap: String,
    TenNhaCungCap: String,
    DienThoai: String,
    DiaChi: String,
});

function generateMaNhaCungCap() {  
  return 'NCC' + Math.floor(10000 + Math.random() * 90000); 
}

supplierSchema.pre("save", async function (next) {
  try {
    if (!this.MaNhaCungCap) {  
      this.MaNhaCungCap = generateMaNhaCungCap();  
    } 
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Supplier", supplierSchema);