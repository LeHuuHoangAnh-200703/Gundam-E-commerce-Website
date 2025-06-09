const FeedBack = require("../models/feedbackModels");
const Customer = require("../models/customersModels");
const path = require("path");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const axios = require('axios');

cloudinary.config({
    cloud_name: 'dwcajbc6f',
    api_key: '365476741985665',
    api_secret: '6gAWhCMdI8DfBAs-1ZDwwx1xM0Y'
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
exports.getAllFeedBacks = async (req, res) => {
    try {
        const feedBacks = await FeedBack.find();
        const customerIds = [...new Set(feedBacks.map(feedBack => feedBack.MaKhachHang))];

        const customers = await Customer.find({ MaKhachHang: { $in: customerIds } });
        const customerMap = {};
        customers.forEach(customer => {
            customerMap[customer.MaKhachHang] = {
                TenKhachHang: customer.TenKhachHang,
                HinhAnhKhachHang: customer.Image
            };
        });

        const feedbacksWithCustomer = feedBacks.map(feedBack => ({
            ...feedBack.toObject(),
            TenKhachHang: customerMap[feedBack.MaKhachHang]?.TenKhachHang || "Không xác định",
            HinhAnhKhachHang: customerMap[feedBack.MaKhachHang]?.HinhAnhKhachHang || null
        }));

        res.status(200).json(feedbacksWithCustomer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getFeedBack = async (req, res) => {
    try {
        const feeBack = await FeedBack.findOne({
            MaDanhGia: req.params.maDanhGia,
        });
        if (!feeBack) {
            res.status(400).json({ message: "Mã đánh giá không tồn tại!" });
        }
        res.status(200).json(feeBack);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// const bannedWords = [
//     "ngu",
//     "đần",
//     "ngu dốt",
//     "khốn nạn",
//     "vô học",
//     "đồ rác rưởi",
//     "thằng", "con", "mày", "đồ dốt", "đồ điên",
//     "chết tiệt", "vô dụng", "vứt đi", "tởm", "thảm họa", "đồ rác", "tệ hại", "Địt", "đéo", "cái đéo gì", "đm", "dm", "vkl", "vcl", "cc", "đm nó", "con cat", "con cac",
//     "M nó", "đồ cút", "thằng chó", "Con mẹ nó", "chết mẹ", "bố mày", "cmm", "vl", "Thằng chó", "đồ chó", "đồ con chó", "Đồ mạt hạng", "đồ vô học", "đồ khốn", "đồ tồi tệ", "đồ bẩn thỉu", "óc chó", "Thằng lừa đảo", "đồ thất đức", "Lìn", "ln", "đụ", "đm mày", "đệch", "vãi cả chưởng", "đồ như ct", "Đ mày", "dmtt", "cmnr"
// ];

// const containsBannedWords = (text) => {
//     return bannedWords.some(word => new RegExp(`\\b${word}\\b`, 'i').test(text));
// };

const checkToxicContent = async (text) => {
    try {
        const response = await axios.post('http://localhost:5000/predict', { sentence: text });
        return response.data.prediction === 1;
    } catch (error) {
        console.error('Error calling Flask API:', error.message);
    }
};

exports.createFeedBack = async (req, res) => {
    const isToxic = await checkToxicContent(req.body.MoTa);

    const imageUploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({
                folder: 'feedbacks',
            },
                (error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(result);
                });
            stream.end(file.buffer); // Kết thúc stream với buffer
        });
    });
    const imageUploadResults = await Promise.all(imageUploadPromises);

    const feedBack = new FeedBack({
        ...req.body,
        SanPhamDaDanhGia: JSON.parse(req.body.SanPhamDaDanhGia),
        HinhAnhSanPham: imageUploadResults.map(result => result.secure_url),
        isToxic: isToxic
    });
    try {
        await feedBack.save();
        res.status(200).json(feedBack);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteFeedBack = async (req, res) => {
    const { maDanhGia } = req.params;
    try {
        const feedBack = await FeedBack.findOneAndDelete({
            MaDanhGia: maDanhGia,
        });
        if (!feedBack) {
            return res.status(404).json({ message: "Mã đánh giá không tồn tại." });
        }

        if (feedBack.HinhAnhSanPham && feedBack.HinhAnhSanPham.length > 0) {
            const deletePromises = feedBack.HinhAnhSanPham.map(async (imageUrl) => {
                try {
                    // Lấy public_id từ URL của ảnh trên Cloudinary
                    const publicId = imageUrl.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`feedbacks/${publicId}`);
                } catch (error) {
                    console.error("Lỗi khi xóa ảnh trên Cloudinary:", error);
                }
            });

            await Promise.all(deletePromises);
        }

        await FeedBack.findOneAndDelete({ MaDanhGia: maDanhGia });

        res.status(200).json({ message: "Mã đánh giá đã được xóa." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.upload = upload.array('HinhAnhSanPham', 10);