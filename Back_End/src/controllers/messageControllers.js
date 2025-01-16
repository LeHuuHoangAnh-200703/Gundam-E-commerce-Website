const Message = require('../models/messageModels');

function generateChatId() {
    return 'CID' + Math.floor(10000 + Math.random() * 90000);
}
exports.addMessage = async (req, res) => {
    const { NguoiGui, NoiDung } = req.body;
    try {
        let chatId;
        const existingChat = await Chat.findOne({ NguoiGui });

        if (existingChat) {
            // Nếu cuộc trò chuyện đã tồn tại, sử dụng ChatId hiện tại
            chatId = existingChat.ChatId;
        } else {
            // Nếu chưa tồn tại, tạo ChatId mới
            chatId = generateChatId();
        }
        const newMessage = new Message({
            ChatId: chatId,
            NguoiGui,
            NoiDung,
        });

        await newMessage.save();
        res.status(201).json({ success: true, newMessage });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getMessagesByChatId = async (req, res) => {
    const { chatId } = req.params;

    if (!chatId) {
        return res.status(400).json({ success: false, message: "ChatId là bắt buộc." });
    }

    try {
        const messages = await Message.find({ ChatId: chatId }).sort({ ThoiGian: 1 });
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
