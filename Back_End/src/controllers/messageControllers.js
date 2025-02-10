const Message = require("../models/messageModels");

exports.addMessage = async (req, res) => {
    const { idNguoiGui, idNguoiNhan, TinNhan, role, MaTinNhan } = req.body;
    try {
        let chat = await Message.findOne({ MaTinNhan });

        if (chat) {
            // Thêm tin nhắn mới vào danh sách
            chat.NoiDung.push({
                NguoiGui: idNguoiGui,
                TinNhan,
                role,
                ThoiGian: new Date(),
            });
        } else {
            // Tạo cuộc trò chuyện mới nếu chưa tồn tại
            chat = new Message({
                MaTinNhan,
                idNguoiGui,
                idNguoiNhan,
                NoiDung: [
                    {
                        NguoiGui: idNguoiGui,
                        TinNhan,
                        role,
                        ThoiGian: new Date(),
                    },
                ],
            });
        }

        await chat.save();
        return res.status(200).json({ success: true, chat });
    } catch (error) {
        console.error("Error saving message:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getMessages = async (req, res) => {
    const { idNguoiGui, idNguoiNhan } = req.query;

    if (!idNguoiGui || !idNguoiNhan) {
        return res
            .status(400)
            .json({
                success: false,
                message: "Thiếu thông tin idNguoiGui hoặc idNguoiNhan.",
            });
    }

    try {
        // Tìm cuộc trò chuyện giữa hai người
        const chat = await Message.findOne({
            $or: [
                { idNguoiGui, idNguoiNhan },
                { idNguoiGui: idNguoiNhan, idNguoiNhan: idNguoiGui },
            ],
        })
            .populate("idNguoiGui idNguoiNhan", "name avatar") // Lấy thông tin người gửi/nhận
            .lean(); // Giúp tối ưu hiệu suất

        if (!chat) {
            return res.status(200).json({ success: true, messages: [] });
        }

        return res.status(200).json({ success: true, messages: chat.NoiDung });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};
