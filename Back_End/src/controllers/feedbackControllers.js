const FeedBack = require("../models/feedbackModels");
const path = require("path");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;

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
        res.status(200).json(feedBacks);
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

const bannedWords = [
    "ngu",
    "đần",
    "ngu dốt",
    "khốn nạn",
    "vô học",
    "đồ rác rưởi",
    "thằng", "con", "mày", "đồ dốt", "đồ điên",
    "chết tiệt", "vô dụng", "vứt đi", "tởm", "thảm họa", "đồ rác", "tệ hại", "Địt", "đéo", "cái đéo gì", "đm", "dm", "vkl", "vcl", "cc", "đm nó", "con cat", "con cac",
    "M nó", "đồ cút", "thằng chó", "Con mẹ nó", "chết mẹ", "bố mày", "cmm", "vl", "Thằng chó", "đồ chó", "đồ con chó", "Đồ mạt hạng", "đồ vô học", "đồ khốn", "đồ tồi tệ", "đồ bẩn thỉu", "óc chó", "Thằng lừa đảo", "đồ thất đức", "Lìn", "ln", "đụ", "đm mày", "đệch", "vãi cả chưởng", "đồ như ct", "Đ mày", "dmtt", "cmnr"
];

const containsBannedWords = (text) => {
    return bannedWords.some(word => new RegExp(`\\b${word}\\b`, 'i').test(text));
};

exports.createFeedBack = async (req, res) => {
    if (containsBannedWords(req.body.MoTa)) {
        return res.status(400).json({ message: "Mô tả chứa nội dung không phù hợp!" });
    }

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
        HinhAnhSanPham: imageUploadResults.map(result => result.secure_url)
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
        res.status(200).json({ message: "Mã đánh giá đã được xóa." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getFeedBackProducts = async (req, res) => {
    try {
        const statistics = await FeedBack.aggregate([
            {
                $group: {
                    _id: "$ChatLuong",
                    count: { $sum: 1 }
                }
            }
        ]);
        return res.status(200).json(statistics);
    } catch (err) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

exports.upload = upload.array('HinhAnhSanPham', 10);