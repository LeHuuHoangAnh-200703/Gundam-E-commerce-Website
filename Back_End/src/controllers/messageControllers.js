const Message = require('../models/messageModels');

function generateChatId() {
    return 'CID' + Math.floor(10000 + Math.random() * 90000);
}

function generateMaTinNhan() {
    return 'MTN' + Math.floor(Math.random() * 1000000);
}

exports.addMessage = async (req, res) => {
    const { idNguoiGui, NoiDung, idNguoiNhan, NguoiGui, role } = req.body;
    console.log(req.body);
    try {
        // Kiểm tra xem có tin nhắn nào giữa idNguoiGui và idNguoiNhan không
        const existingMessages = await Message.find({ idNguoiGui, idNguoiNhan });
        let chatId;
        if (existingMessages.length > 0) {
            // Nếu đã có tin nhắn giữa hai người này, sử dụng ChatId từ tin nhắn đầu tiên
            chatId = existingMessages[0].ChatId;
        } else {
            // Nếu chưa có, tạo ChatId mới
            chatId = generateChatId();
        }

        // Tạo tin nhắn mới
        const newMessage = new Message({
            ChatId: chatId,
            idNguoiGui,
            idNguoiNhan,
            NoiDung,
            NguoiGui,
            MaTinNhan: generateMaTinNhan(),
            role,
        });

        // Lưu tin nhắn
        console.log("Saving Message:", newMessage);
        await newMessage.save();
        res.status(201).json({ success: true, newMessage }); // Trả về tin nhắn vừa tạo
    } catch (error) {
        console.error("Error saving message:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getMessagesByChatId = async (req, res) => {
    const { chatId } = req.params;

    if (!chatId) {
        return res.status(400).json({ success: false, message: "ChatId là bắt buộc." });
    }

    try {
        // Tìm tất cả tin nhắn theo ChatId
        const messages = await Message.find({ ChatId: chatId }).sort({ ThoiGian: 1 });
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
