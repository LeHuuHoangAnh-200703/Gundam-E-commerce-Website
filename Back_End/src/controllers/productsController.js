const Product = require("../models/productModels");
const EntryFormInfo = require("../models/entryFormInfoModels");
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
    // Bước 1: Lấy tất cả sản phẩm  
    const products = await Product.find();  

    // Bước 2: Lấy số lượng từ chi tiết phiếu nhập  
    const quantities = await EntryFormInfo.aggregate([  
      { $group: { _id: "$MaSanPham", totalQuantity: { $sum: "$SoLuong" } } }  
    ]);  

    // Bước 3: Tạo map số lượng
    const quantityMap = {};  
    quantities.forEach(item => {  
      quantityMap[item._id.toString()] = item.totalQuantity;  
    });  

    // Bước 4: Kết hợp số lượng vào sản phẩm  
    const result = products.map(product => {
      const productId = product.MaSanPham?.toString(); // Chuyển mã sản phẩm thành chuỗi để so sánh
      return {
        ...product._doc,
        SoLuong: quantityMap[productId] || 0 // Nếu không có số lượng, gán mặc định là 0
      };
    });  

    res.status(200).json(result);  
  } catch (err) {  
    res.status(500).json({ message: err.message });  
  }  
};
  

exports.getProduct = async (req, res) => {  
  try {  
    const product = await Product.findOne({ MaSanPham: req.params.maSanPham });  
    
    if (!product) {  
      return res.status(404).json({ message: "Sản phẩm không tồn tại!" });  
    }  

    // Lấy vé đã nhập vào database  
    const quantities = await EntryFormInfo.aggregate([  
      { $match: { MaSanPham: req.params.maSanPham } }, // Lọc theo sản phẩm  
      { $group: { _id: "$MaSanPham", totalQuantity: { $sum: "$SoLuong" } } }  
    ]);  

    // Tạo map số lượng  
    const quantityMap = {};  
    quantities.forEach(item => {  
      quantityMap[item._id] = item.totalQuantity;  
    });  

    // Kết hợp số lượng vào sản phẩm  
    const result = {  
      ...product._doc,  
      SoLuong: quantityMap[product.MaSanPham] || 0
    };  

    return res.status(200).json(result);  
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
    const { maSanPham } = req.params;
    try {
        const updatedProduct = await Product.findOneAndUpdate(
            { MaSanPham: maSanPham },
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