const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  MaTinNhan: String,
  idNguoiGui: { type: String, required: true },
  idNguoiNhan: { type: String, required: true },
  NoiDung: [
    {
      NguoiGui: String,
      TinNhan: String,
      role: String,
      ThoiGian: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model('Message', messageSchema);