const mongoose = require('mongoose');

const chatbotSchema = new mongoose.Schema({
    MaChat: String,
    NoiDung: String,
    MaKhachHang: String,
    NguoiGui: { type: String, enum: ['user', 'bot'], required: true }, // Phân biệt người dùng và chatbot
    ThoiGianGui: { type: Date, default: Date.now }
});

function generateMaChat() {  
  return 'CHAT' + Math.floor(10000 + Math.random() * 90000); 
}

chatbotSchema.pre("save", async function (next) {
  try {
    if (!this.MaChat) {  
      this.MaChat = generateMaChat() 
    } 
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('ChatBot', chatbotSchema);