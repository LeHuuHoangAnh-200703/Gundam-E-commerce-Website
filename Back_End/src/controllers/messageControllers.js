const Message = require("../models/messageModels");

exports.addMessage = async (req, res) => {
    const { idNguoiGui, idNguoiNhan, NoiDung, NguoiGui, role, MaTinNhan } = req.body;

    try {
        const existingChat = await Message.findOne({
            MaTinNhan: MaTinNhan
        });

        if (existingChat) {
            existingChat.NoiDung.push({
                NguoiGui,
                TinNhan: NoiDung,
                role,
                ThoiGian: new Date(),
            });
            await existingChat.save();
            return res.status(200).json(existingChat);
        } else {
            const newMessage = new Message({
                MaTinNhan,
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
            // return res.status(201).json(newMessage);
        }
    } catch (error) {
        console.error("Error saving message:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// exports.getMessages = async (req, res) => {
//     try {
//         const message = await Message.findOne({
//             MaTinNhan: req.params.maTinNhan,
//         });
//         if (!feeBack) {
//             res.status(400).json({ message: "Mã tin nhắn không tồn tại!" });
//         }
//         res.status(200).json(message);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

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

        return res.status(200).json({ success: true, messages: sortedMessages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};