const EntryFormInfo = require("../models/entryFormInfoModels");
const Inventory = require("../models/inventoryModels");
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
  const { MaSanPham, TenSanPham, GiaNhap, SoLuong } = req.body;

  try {
    const entryFormInfo = new EntryFormInfo({
      ...req.body,
      TongTien: GiaNhap * SoLuong,
      NgayNhap: new Date(),
    });
    await entryFormInfo.save();

    const inventory = await Inventory.findOne({ MaSanPham });
    if (inventory) {
      inventory.SoLuongTon += SoLuong;
      inventory.NgayCapNhat = new Date();
      inventory.GiaNhapGanNhat = GiaNhap;
      await inventory.save();
    } else {
      const newInventory = new Inventory({
        MaSanPham,
        SoLuongTon: SoLuong,
        GiaNhapGanNhat: GiaNhap,
      });
      await newInventory.save();
    }

    res.status(200).json(entryFormInfo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatedEntryFormInfo = async (req, res) => {
  const { maCTPN } = req.params;
  const { MaSanPham, TenSanPham, GiaNhap, SoLuong } = req.body;

  try {
    // Lấy chi tiết phiếu nhập cũ
    const entryFormInfo = await EntryFormInfo.findOne({ MaChiTietPhieuNhap: maCTPN });
    if (!entryFormInfo) {
      return res.status(404).json({ message: "Chi tiết phiếu nhập không tồn tại" });
    }

    // Tính toán sự chênh lệch số lượng (nếu có)
    const oldQuantity = entryFormInfo.SoLuong;
    const quantityDifference = SoLuong - oldQuantity;

    // Cập nhật chi tiết phiếu nhập
    entryFormInfo.MaSanPham = MaSanPham || entryFormInfo.MaSanPham;
    entryFormInfo.TenSanPham = TenSanPham || entryFormInfo.TenSanPham;
    entryFormInfo.GiaNhap = GiaNhap || entryFormInfo.GiaNhap;
    entryFormInfo.SoLuong = SoLuong || entryFormInfo.SoLuong;
    entryFormInfo.TongTien = GiaNhap * SoLuong || entryFormInfo.TongTien;

    const updatedEntryFormInfo = await entryFormInfo.save();

    // Cập nhật tồn kho dựa trên sự chênh lệch số lượng
    const inventory = await Inventory.findOne({ MaSanPham });
    if (inventory) {
      inventory.SoLuongTon += quantityDifference; // Cộng hoặc trừ số lượng chênh lệch
      inventory.NgayCapNhat = new Date();
      await inventory.save();
    }

    res.status(200).json(updatedEntryFormInfo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteEntryFormInfo = async (req, res) => {
  const { maCTPN } = req.params;

  try {
    // Lấy chi tiết phiếu nhập để lấy thông tin số lượng
    const entryFormInfo = await EntryFormInfo.findOne({ MaChiTietPhieuNhap: maCTPN });
    if (!entryFormInfo) {
      return res.status(404).json({ message: "Chi tiết phiếu nhập không tồn tại." });
    }

    const { MaSanPham, SoLuong } = entryFormInfo;

    // Xóa chi tiết phiếu nhập
    await EntryFormInfo.findOneAndDelete({ MaChiTietPhieuNhap: maCTPN });

    // Giảm số lượng tồn kho
    const inventory = await Inventory.findOne({ MaSanPham });
    if (inventory) {
      inventory.SoLuongTon -= SoLuong; // Trừ số lượng đã nhập
      inventory.NgayCapNhat = new Date();
      await inventory.save();
    }

    res.status(200).json({ message: "Chi tiết phiếu nhập đã được xóa." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};