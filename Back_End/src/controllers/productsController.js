const Product = require("../models/productModels");
const Inventory = require("../models/inventoryModels");
const Supplier = require("../models/suppliersModels");
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
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    const inventories = await Inventory.find();

    // Tạo một Map để ánh xạ Mã Sản Phẩm -> Số lượng tồn kho
    const inventoryMap = {};
    inventories.forEach(inventory => {
      inventoryMap[inventory.MaSanPham.toString()] = inventory.SoLuongTon;
    });

    // Tạo một mảng chứa các mã nhà cung cấp để tìm kiếm
    const supplierIds = [...new Set(products.map(product => product.MaNhaCungCap))];

    // Tìm tất cả nhà cung cấp dựa trên mã nhà cung cấp
    const suppliers = await Supplier.find({ MaNhaCungCap: { $in: supplierIds } });
    const supplierMap = {};
    suppliers.forEach(supplier => {
      supplierMap[supplier.MaNhaCungCap] = supplier.TenNhaCungCap;
    });

    // Kết hợp dữ liệu tồn kho với danh sách sản phẩm
    const result = products.map(product => {
      const productId = product.MaSanPham?.toString(); // Lấy mã sản phẩm để ánh xạ
      return {
        ...product._doc, // Giữ nguyên dữ liệu sản phẩm
        SoLuong: inventoryMap[productId] || 0, // Thêm số lượng tồn kho hoặc gán 0 nếu không có dữ liệu
        TenNhaCungCap: supplierMap[product.MaNhaCungCap], // Lấy tên nhà cung cấp hoặc gán "Không xác định" nếu không có
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

    const inventory = await Inventory.findOne({ MaSanPham: req.params.maSanPham });
    const supplier = await Supplier.findOne({ MaNhaCungCap: product.MaNhaCungCap });

    const result = {
      ...product._doc, // Giữ nguyên thông tin sản phẩm
      SoLuong: inventory ? inventory.SoLuongTon : 0, // Lấy số lượng tồn kho hoặc gán 0 nếu không có dữ liệu
      TenNhaCungCap: supplier.TenNhaCungCap
    };

    res.status(200).json(result);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files were uploaded.' });
  }

  const imageUploadPromises = req.files.map(file => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'products',
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

  try {
    const imageUploadResults = await Promise.all(imageUploadPromises); // Chờ tất cả hình ảnh được upload
    const product = new Product({
      ...req.body,
      Images: imageUploadResults.map(result => result.secure_url) // Lưu URL hình ảnh
    });
    await product.save();
    res.status(200).json(product);
  } catch (err) {
    console.log(err);
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

    // Lưu trữ public_id của hình ảnh cũ để xóa sau này
    const oldImagePublicIds = product.Images.map(imageUrl => {
      // Tách public_id từ URL
      const urlParts = imageUrl.split('/');
      const publicIdWithExtension = urlParts[urlParts.length - 1]; // Lấy phần cuối cùng của URL
      const publicId = publicIdWithExtension.split('.')[0]; // Tách public_id từ tên file
      return publicId; // Trả về public_id
    });

    // Cập nhật thông tin sản phẩm
    product.TenSanPham = req.body.TenSanPham || product.TenSanPham;
    product.GiaBan = req.body.GiaBan || product.GiaBan;
    product.LoaiSanPham = req.body.LoaiSanPham || product.LoaiSanPham;
    product.MaNhaCungCap = req.body.MaNhaCungCap || product.MaNhaCungCap;
    product.MoTa = req.body.MoTa || product.MoTa;

    // Kiểm tra xem có hình ảnh mới không
    if (req.files && req.files.length > 0) {
      // Xóa hình ảnh cũ khỏi Cloudinary
      const deletePromises = oldImagePublicIds.map(publicId => {
        return cloudinary.uploader.destroy(`products/${publicId}`);
      });
      await Promise.all(deletePromises); // Chờ tất cả hình ảnh cũ được xóa

      // Tải hình ảnh mới lên Cloudinary
      const imageUploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'products',
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
      const imageUploadResults = await Promise.all(imageUploadPromises); // Chờ tất cả hình ảnh được upload
      product.Images = imageUploadResults.map(result => result.secure_url); // Cập nhật hình ảnh
    }

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateProductStatus = async (req, res) => {
  const { TrangThai } = req.body;
  try {
    const updatedProduct = await Product.findOne({ MaSanPham: req.params.maSanPham });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
    }
    updatedProduct.TrangThai = TrangThai;
    await updatedProduct.save();
    res.status(200).json({ message: "Cập nhật trạng thái thành công." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.findProductsWithName = async (req, res) => {
  const tenSanPham = req.query.tenSanPham;
  if (!tenSanPham) {
    return res.status(400).json({ message: 'Tên sản phẩm không được để trống.' })
  }
  try {
    const keywords = tenSanPham.trim().split(/\s+/);

    const query = {
      $and: keywords.map(keyword => ({
        TenSanPham: { $regex: keyword, $options: 'i' }
      }))
    };
    const products = await Product.find(query);
    return res.status(200).json(products);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

exports.productSuggestionsWithSearch = async (req, res) => {
  const { tenSanPham } = req.query;

  try {
    const keywords = tenSanPham.trim().split(/\s+/);

    const query = {
      $and: keywords.map(keyword => ({
        TenSanPham: { $regex: keyword, $options: 'i' }
      }))
    };
    const products = await Product.find(query).limit(4);
    return res.status(200).json(products);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

exports.getTopSellingProducts = async (req, res) => {
  try {
    const topProducts = await Product.find()
      .sort({ LuotBan: -1 }) // Sắp xếp giảm dần theo lượt bán
      .limit(3);

    return res.status(200).json(topProducts);
  } catch (err) {
    return res.status(500).json({ message: "Lỗi khi lấy sản phẩm bán chạy", error });
  }
}

exports.upload = upload.array('Images', 10);