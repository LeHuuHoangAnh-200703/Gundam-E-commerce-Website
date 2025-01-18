const Message = require("../models/messageModels");

function generateMaTinNhan() {
    return "MTN" + Math.floor(Math.random() * 1000000);
}

exports.addMessage = async (req, res) => {
    const { idNguoiGui, idNguoiNhan, NoiDung, NguoiGui, role } = req.body;

    try {
        const existingChat = await Message.findOne({
            idNguoiGui,
            idNguoiNhan,
        });

        if (existingChat) {
            // Thêm tin nhắn mới vào mảng nếu đã có bản ghi
            existingChat.NoiDung.push({
                NguoiGui,
                TinNhan: NoiDung,
                role,
                ThoiGian: new Date(),
            });

            await existingChat.save();
            return res.status(200).json({ success: true, message: "Tin nhắn đã được thêm vào cuộc trò chuyện.", chat: existingChat });
        } else {
            // Tạo bản ghi mới nếu chưa có
            const newMessage = new Message({
                MaTinNhan: generateMaTinNhan(),
                idNguoiGui,
                idNguoiNhan,
                NoiDung: [
                    {
                        NguoiGui,
                        TinNhan: NoiDung,
                        role,
                        ThoiGian: new Date(),
                    },
                ],
            });
            await newMessage.save();
            return res.status(201).json({ success: true, message: "Cuộc trò chuyện mới đã được tạo.", chat: newMessage });
        }
    } catch (error) {
        console.error("Error saving message:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};


exports.getMessages = async (req, res) => {
    const { idNguoiGui, idNguoiNhan } = req.query;

    if (!idNguoiGui || !idNguoiNhan) {
        return res.status(400).json({ success: false, message: "Thiếu thông tin idNguoiGui hoặc idNguoiNhan." });
    }

    try {
        // Tìm bản ghi chat giữa hai người dùng
        const chat = await Message.findOne({
            $or: [
                { idNguoiGui, idNguoiNhan },
                { idNguoiGui: idNguoiNhan, idNguoiNhan: idNguoiGui },
            ],
        });

        if (!chat) {
            return res.status(404).json({ success: false, message: "Không tìm thấy cuộc trò chuyện." });
        }

        // Sắp xếp mảng tin nhắn theo thời gian
        const sortedMessages = chat.NoiDung.sort((a, b) => new Date(a.ThoiGian) - new Date(b.ThoiGian));

        res.status(200).json({ success: true, messages: sortedMessages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};