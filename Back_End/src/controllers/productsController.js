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
    return res.status(200).json(product);
  } catch (err) {
    return res.status(500).json({ message: err.message });
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

    // Kiểm tra xem có hình ảnh mới không
    if (req.files && req.files.length > 0) {
      // Nếu có hình ảnh mới, xóa hết hình ảnh cũ
      product.Images = req.files.map(file => file.filename);
    } else {
      // Nếu không có hình ảnh mới, giữ lại hình ảnh cũ
      product.Images = product.Images;
    }

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateProductStatus = async (req, res) => {
    const { maSanPham } = req.body;
    try {
        const updatedProduct = await Product.findOneAndUpdate(
            maSanPham,
            { TrangThai: 'Ngừng kinh doanh' },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
        }

        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.upload = upload.array('Images', 10);