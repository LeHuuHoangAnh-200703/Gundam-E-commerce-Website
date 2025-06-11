const ChatBot = require("../models/chatBotModels");
const Customer = require("../models/customersModels");
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI("AIzaSyD0Z8_BuXqV59QYFEoT2u2ST6QfN0PS7Rc");
const systemPrompt = `
Bạn là một chatbot chuyên về mô hình Gundam (Gunpla) và robot lập trình. Chỉ trả lời các câu hỏi liên quan đến các chủ đề này, bao gồm thông tin về sản phẩm Gundam (như RG, MG, PG, SD), series Gundam (như SEED, Wing, The Witch from Mercury), cách lắp ráp, tùy chỉnh, giá cả, tính sẵn có, hướng dẫn người mới bắt đầu, dụng cụ, bảo quản, cách custom và các loại robot lập trình (như Arduino, Raspberry Pi, hoặc các bộ kit robot). Nếu câu hỏi không thuộc các chủ đề này, hãy trả lời: "Xin lỗi, tôi chỉ hỗ trợ thông tin về mô hình Gundam và robot lập trình. Bạn muốn hỏi gì về các chủ đề này?" Đảm bảo trả lời bằng tiếng Việt, ngắn gọn, chính xác, và thân thiện.
`;

exports.getMessageWithChatBotById = async (req, res) => {
    const { maKhachHang } = req.params;

    try {
        const message = await ChatBot.find({ MaKhachHang: maKhachHang }).sort({ time: 1 });
        const customerIds = [...new Set(message.map(mes => mes.MaKhachHang))];

        const customers = await Customer.find({ MaKhachHang: { $in: customerIds } });
        const customerMap = {};
        customers.forEach(customer => {
            customerMap[customer.MaKhachHang] = {
                TenKhachHang: customer.TenKhachHang
            };
        });

        const messageWithChatBot= message.map(mes => ({
            ...mes.toObject(),
            TenKhachHang: customerMap[mes.MaKhachHang]?.TenKhachHang || "Không xác định"
        }));

        res.status(200).json(messageWithChatBot);
    } catch (error) {
        return res.status(400).json({ message: error });
    }
}

exports.createMessageWithChatBot = async (req, res) => {
    const { maKhachHang, NoiDung } = req.body;

    try {
        const userMessage = new ChatBot({
            MaKhachHang: maKhachHang,
            NoiDung: NoiDung,
            NguoiGui: 'user'
        });

        await userMessage.save();

        // Gọi Gemini API
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `${systemPrompt}\n\nNgười dùng: ${NoiDung}`;
        const result = await model.generateContent(prompt);
        const botResponse = await result.response.text();

        const botMessage = new ChatBot({
            MaKhachHang: maKhachHang,
            NoiDung: botResponse,
            NguoiGui: 'bot'
        });

        await botMessage.save();
        res.status(200).json(botResponse);
    } catch (error) {
        return res.status(400).json({ message: error });
    }
}