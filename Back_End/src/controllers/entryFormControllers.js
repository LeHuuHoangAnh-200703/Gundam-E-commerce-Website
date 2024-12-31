const EntryForm = require("../models/entryFormModels");

exports.getAllEntryForms = async (req, res) => {
  try {
    const entryForms = await EntryForm.find();
    res.status(200).json(entryForms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEntryForm = async (req, res) => {
  try {
    const entryForm = await EntryForm.findOne({
      MaPhieuNhap: req.params.maPhieuNhap,
    });
    if (!MaPhieuNhap) {
      res.status(400).json({ message: "Phiếu nhập không tồn tại!" });
    }
    res.status(200).json(entryForm);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createEntryForm = async (req, res) => {
  const entryForm = new EntryForm(req.body);
  try {
    await entryForm.save();
    res.status(200).json(entryForm);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatedEntryForm = async (req, res) => {
  try {
    const entryForm = await EntryForm.findOne({
      MaPhieuNhap: req.params.maPN,
    });
    if (!entryForm) {
      return res.status(404).json({ message: "Phiếu nhập không tồn tại" });
    }

    entryForm.MaNhaCungCap = req.body.MaNhaCungCap || entryForm.MaNhaCungCap;

    const updatedEntryForm = await entryForm.save();
    res.status(200).json(updatedEntryForm);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteEntryForm = async (req, res) => {
  const { maPN } = req.params;
  try {
    // const existingOrder = await TheoDoiMuonSach.findOne({ MaDocGia: maDocGia });
    // if (existingOrder) {
    //   return res.status(400).json({ message: "Không thể xóa đọc giả vì họ đang có đơn mượn sách." });
    // }

    const entryForm = await EntryForm.findOneAndDelete({
      MaPhieuNhap: maPN,
    });
    if (!entryForm) {
      return res.status(404).json({ message: "Phiếu nhập không tồn tại." });
    }
    res.status(200).json({ message: "Phiếu nhập đã được xóa." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};