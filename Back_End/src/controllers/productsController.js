const Product = require("../models/productModels");
const path = require("path");
const multer = require("multer");

const storagePath = path.join(
  __dirname,
  "../../../C3 Gundam Website/src/assets/img"
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
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      MaSanPham: req.params.maSanPham,
    });
    if (!product) {
      res.status(400).json({ message: "Sản phẩm không tồn tại!" });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  const product = new Product({
    ...req.body,
    Images: req.files ? req.files.map(file => file.filename) : []
  });
  try {
    await product.save();
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatedProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      MaSanPham: req.params.maSanPham,
    });
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    product.TenSanPham = req.body.TenSanPham || product.TenSanPham;
    product.GiaBan = req.body.GiaBan || product.GiaBan;
    product.LoaiSanPham = req.body.LoaiSanPham || product.LoaiSanPham;
    product.NhaCungCap = req.body.NhaCungCap || product.NhaCungCap;
    product.MoTa = req.body.MoTa || product.MoTa;
    product.Images = req.body.Images || product.Images;

    if (req.file) {
      product.Images = req.files.map(file => file.filename)
    }

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const { maSanPham } = req.params;
  try {
    // const existingOrder = await TheoDoiMuonSach.findOne({ MaDocGia: maDocGia });
    // if (existingOrder) {
    //   return res.status(400).json({ message: "Không thể xóa đọc giả vì họ đang có đơn mượn sách." });
    // }

    const product = await Product.findOneAndDelete({
      MaSanPham: maSanPham,
    });
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại." });
    }
    res.status(200).json({ message: "Sản phẩm đã được xóa." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.upload = upload.array('Images', 10);