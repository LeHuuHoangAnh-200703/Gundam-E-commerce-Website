const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    MaDanhGia: String,
    ChatLuong: Number,
    MaKhachHang: String,
    MaDonHang: String,
    MoTa: String,
    HinhAnhSanPham: [String],
    NgayDang: { type: Date, default: Date.now },
    SanPhamDaDanhGia: [{  
        TenSanPham: String,  
        MaSanPham: String, 
        LoaiSanPham: String, 
        HinhAnh: String  
    }],
    isToxic: {
      type: Boolean,
      default: false
    }
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