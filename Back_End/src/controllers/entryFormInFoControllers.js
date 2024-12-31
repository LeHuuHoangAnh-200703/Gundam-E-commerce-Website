const EntryFormInfo = require("../models/entryFormInfoModels");

exports.getAllntryFormInfos = async (req, res) => {
  try {
    const entryFormInfos = await EntryFormInfo.find();
    res.status(200).json(entryFormInfos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEntryFormInfo = async (req, res) => {
  try {
    const entryFormInfo = await EntryFormInfo.findOne({
      MaChiTietPhieuNhap: req.params.maCTPN,
    });
    if (!entryFormInfo) {
      res.status(400).json({ message: "Chi tiết phiếu nhập không tồn tại!" });
    }
    res.status(200).json(entryFormInfo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createEntryFormInfo = async (req, res) => {
  const entryFormInfo = new EntryFormInfo(req.body);
  try {
    await entryFormInfo.save();
    res.status(200).json(entryFormInfo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatedEntryFormInfo = async (req, res) => {
  try {
    const entryFormInfo = await EntryFormInfo.findOne({
      MaChiTietPhieuNhap: req.params.maCTPN,
    });
    if (!entryFormInfo) {
      return res.status(404).json({ message: "Chi tiết phiếu nhập không tồn tại" });
    }

    entryFormInfo.MaSanPham = req.body.MaSanPham || entryFormInfo.MaSanPham;
    entryFormInfo.TenSanPham = req.body.TenSanPham || entryFormInfo.TenSanPham;
    entryFormInfo.GiaNhap = req.body.GiaNhap || entryFormInfo.GiaNhap;
    entryFormInfo.SoLuong = req.body.SoLuong || entryFormInfo.SoLuong;
    entryFormInfo.TongTien = req.body.TongTien || entryFormInfo.TongTien;

    const updatedEntryFormInfo = await entryFormInfo.save();
    res.status(200).json(updatedEntryFormInfo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteEntryFormInfo = async (req, res) => {
  const { maCTPN } = req.params;
  try {
    const entryFormInfo = await EntryFormInfo.findOneAndDelete({
      MaChiTietPhieuNhap: maCTPN,
    });
    if (!entryFormInfo) {
      return res.status(404).json({ message: "Chi tiết phiếu nhập không tồn tại." });
    }
    res.status(200).json({ message: "Chi tiết phiếu nhập đã được xóa." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};