const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: { type: String },
  senderId: { type: String, required: true },
  senderN: { type: String, required: true },
  images: [{ type: String }],
  time: { type: Date, default: Date.now }
});

const chatRoomSchema = new mongoose.Schema({
    roomCode: { type: String, required: true },
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    receiverName: { type: String, required: true },
    messages: [messageSchema],
    senderMessagesNotRead: [messageSchema], 
    receiverMessagesNotRead: [messageSchema],
});

module.exports = mongoose.model('Message', chatRoomSchema);