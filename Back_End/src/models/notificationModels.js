const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    MaThongBao: String,
    ThongBao: String,
    NguoiChinhSua: String,
    ThoiGian: {
        type: Date,
        default: Date.now,
        expires: 2592000,
    },
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