const mongoose = require("mongoose");

const communityPostSchema = new mongoose.Schema({
    MaBaiDang: String,
    MaKhachHang: String,
    NoiDung: String,
    HinhAnh: [String],
    LoaiBaiDang: String,
    LuotThich: Number,
    BinhLuan: [{
        MaBinhLuan: String,
        MaKhachHang: String,
        NoiDungBinhLuan: String,
        TraLoiCho: { type: String, default: null },
        ThoiGian: Date
    }],
    SoLanLuuMa: Number,
    MaKhachHangDaThich: [String],
    ThoiGianDang: Date,
});

function generateMaBaiDang() {  
  return 'BD' + Math.floor(10000 + Math.random() * 90000); 
}

communityPostSchema.pre("save", async function (next) {
  try {
    if (!this.MaBaiDang) {  
      this.MaBaiDang = generateMaBaiDang();  
    } 
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("CommunityPost", communityPostSchema);