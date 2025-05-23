const mongoose = require("mongoose");

const communityPostSchema = new mongoose.Schema({
  MaBaiDang: String,
  MaKhachHang: String,
  NoiDung: String,
  HinhAnh: [String],
  LoaiBaiDang: String,
  LuotThich: { type: Number, default: 0},
  BinhLuan: [
    {
      MaBinhLuan: String,
      MaKhachHang: String,
      NoiDungBinhLuan: String,
      TraLoiCho: { type: String, default: null },
      ThoiGian: { type: Date, default: Date.now },
    },
  ],
  MaKhachHangDaThich: [String],
  TrangThaiDang:
    {
      type: String,
      enum: ["Đang chờ duyệt", "Đã duyệt"],
      default: "Đang chờ duyệt",
    },
  ThoiGianDang: { type: Date, default: Date.now },
});

function generateMaBaiDang() {
  return "BD" + Math.floor(10000 + Math.random() * 90000);
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
