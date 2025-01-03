const FeedBack = require("../models/feedbackModels");
const path = require("path");
const multer = require("multer");

const storagePath = path.join(
  __dirname,
  "../../../C3 Gundam Website/src/assets/img_feedback"
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storagePath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

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

exports.createFeedBack = async (req, res) => {
    const feedBack = new FeedBack({
        ...req.body,
        SanPhamDaDanhGia: JSON.parse(req.body.SanPhamDaDanhGia),
        HinhAnhSanPham: req.files ? req.files.map(file => file.filename) : []
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

exports.upload = upload.array('HinhAnhSanPham', 10);