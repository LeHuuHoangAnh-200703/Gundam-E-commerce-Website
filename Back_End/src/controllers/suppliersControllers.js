const Supplier = require("../models/suppliersModels");

exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.status(200).json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({
      MaNhaCungCap: req.params.maNCC,
    });
    if (!supplier) {
      res.status(400).json({ message: "Nhà cung cấp không tồn tại!" });
    }
    res.status(200).json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    // Kiểm tra xem tên nhà cung cấp đã tồn tại (không phân biệt hoa thường)
    const existingSupplier = await Supplier.findOne({
      TenNhaCungCap: { $regex: new RegExp(`^${req.body.TenNhaCungCap}$`, "i") },
    });
    if (existingSupplier) {
      return res
        .status(400)
        .json({ message: "Tên nhà cung cấp đã tồn tại trong cơ sở dữ liệu" });
    }
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(200).json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.updatedSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({
      MaNhaCungCap: req.params.maNCC,
    });
    if (!supplier) {
      return res.status(404).json({ message: "Nhà cung cấp không tồn tại" });
    }

    // Nếu có cập nhật tên nhà cung cấp, kiểm tra tên trùng (không phân biệt hoa thường)
    if (req.body.TenNhaCungCap) {
      const existingSupplier = await Supplier.findOne({
        TenNhaCungCap: { $regex: new RegExp(`^${req.body.TenNhaCungCap}$`, "i") },
        MaNhaCungCap: { $ne: req.params.maNCC }, // Loại trừ nhà cung cấp hiện tại
      });
      if (existingSupplier) {
        return res
          .status(400)
          .json({ message: "Tên nhà cung cấp đã tồn tại trong cơ sở dữ liệu" });
      }
    }
    supplier.TenNhaCungCap = req.body.TenNhaCungCap || supplier.TenNhaCungCap;
    supplier.DienThoai = req.body.DienThoai || supplier.DienThoai;
    supplier.DiaChi = req.body.DiaChi || supplier.DiaChi;

    const updatedSupplier = await supplier.save();
    res.status(200).json(updatedSupplier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.deleteSupplier = async (req, res) => {
  const { maNCC } = req.params;
  try {
    // const existingOrder = await TheoDoiMuonSach.findOne({ MaDocGia: maDocGia });
    // if (existingOrder) {
    //   return res.status(400).json({ message: "Không thể xóa đọc giả vì họ đang có đơn mượn sách." });
    // }

    const supplier = await Supplier.findOneAndDelete({
      MaNhaCungCap: maNCC,
    });
    if (!supplier) {
      return res.status(404).json({ message: "Nhà cung cấp không tồn tại." });
    }
    res.status(200).json({ message: "Nhà cung cấp đã được xóa." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};