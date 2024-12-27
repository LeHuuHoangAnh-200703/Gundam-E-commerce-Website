const DiscountCode = require("../models/discountCodeModels");

exports.getAllDiscountCodes = async (req, res) => {
    try {
        const discountCodes = await DiscountCode.find();
        res.status(200).json(discountCodes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getDiscountCode = async (req, res) => {
    try {
        const discountCode = await DiscountCode.findOne({
            IdMaGiamGia: req.params.idMaGG,
        });
        if (!discountCode) {
            res.status(400).json({ message: "Mã giảm giá không tồn tại!" });
        }
        res.status(200).json(discountCode);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createDiscountCode = async (req, res) => {
    const discountCode = new DiscountCode(req.body);
    try {
        if (discountCode.NgayHetHan < new Date()) {
            return res.status(400).json({ message: "Ngày hết hạn không hợp lệ!" });
        }
        await discountCode.save();
        res.status(200).json(discountCode);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updatedDiscountCode = async (req, res) => {
    try {
        const discountCode = await DiscountCode.findOne({
            IdMaGiamGia: req.params.idMaGG,
        });
        if (!discountCode) {
            return res.status(404).json({ message: "Mã giảm giá không tồn tại" });
        }

        discountCode.TenMaGiamGia = req.body.TenMaGiamGia || discountCode.TenMaGiamGia;
        discountCode.GiaApDung = req.body.GiaApDung || discountCode.GiaApDung;
        discountCode.GiamTien = req.body.GiamTien || discountCode.GiamTien;
        discountCode.GiamPhanTram = req.body.GiamPhanTram || discountCode.GiamPhanTram;
        discountCode.SoLanSuDung = req.body.SoLanSuDung || discountCode.SoLanSuDung;
        discountCode.NgayHetHan = req.body.NgayHetHan || discountCode.NgayHetHan;
        discountCode.MaGiamGia = req.body.MaGiamGia || discountCode.MaGiamGia;

        if (req.body.NgayHetHan && new Date(req.body.NgayHetHan) < new Date()) {
            return res.status(400).json({ message: "Ngày hết hạn không hợp lệ!" });
        }

        const updatedDiscountCode = await discountCode.save();
        res.status(200).json(updatedDiscountCode);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteDiscountCode = async (req, res) => {
    const { idMaGG } = req.params;
    try {
        const discountCode = await DiscountCode.findOneAndDelete({
            IdMaGiamGia: idMaGG,
        });
        if (!discountCode) {
            return res.status(404).json({ message: "Mã giảm giá không tồn tại." });
        }
        res.status(200).json({ message: "Mã giảm giá đã được xóa." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};