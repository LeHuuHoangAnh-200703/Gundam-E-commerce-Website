const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    MaTinNhan: { type: String, unique: true, required: true },
    ChatId: { type: String, required: true },
    NguoiGui: { type: String, required: true },
    idNguoiGui: { type: String, required: true },
    idNguoiNhan: { type: String, required: true },
    NoiDung: { type: String, required: true },
    ThoiGian: { type: Date, default: Date.now },
    role: { type: String, required: true },
});

module.exports = mongoose.model('Message', messageSchema);