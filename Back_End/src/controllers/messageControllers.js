const Message = require('../models/messageModels');

exports.addMessage = async (req, res) => {
    const { MaCuocTroChuyen, NguoiGui, NoiDung } = req.body;

    try {
        const newMessage = new Message({
            MaCuocTroChuyen,
            NguoiGui,
            NoiDung,
        });

        await newMessage.save();
        res.status(201).json({ newMessage });
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.getMessagesByChatId = async (req, res) => {
    const { MaCuocTroChuyen } = req.params;

    try {
        const messages = await Message.find({ MaCuocTroChuyen }).sort({ ThoiGian: 1 });
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ error });
    }
};