const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    MaThongBao: String,
    ThongBao: String,
    NguoiChinhSua: String,
    ChucVu: String,
    ThoiGian: Date,
});

function generateMaThongBao() {  
  return 'TB' + Math.floor(10000 + Math.random() * 90000); 
}

notificationSchema.pre("save", async function (next) {
  try {
    if (!this.MaThongBao) {  
      this.MaThongBao = generateMaThongBao();  
    } 
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Notification", notificationSchema);