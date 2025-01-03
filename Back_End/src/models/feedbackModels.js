const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    MaDanhGia: String,
    ChatLuong: Number,
    TenKhachHang: String,
    MoTa: String,
    HinhAnhKhachHang: String,
    HinhAnhSanPham: [String],
    NgayDang: Date,
    SanPhamDaDanhGia: [{  
        TenSanPham: String,  
        MaSanPham: String,  
        Gia: Number,  
        SoLuong: Number,  
        HinhAnh: String  
    }],
});

function generateMaDanhGia() {  
  return 'FB' + Math.floor(10000 + Math.random() * 90000); 
}

feedbackSchema.pre("save", async function (next) {
  try {
    if (!this.MaDanhGia) {  
      this.MaDanhGia = generateMaDanhGia();  
    } 
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("FeedBack", feedbackSchema);