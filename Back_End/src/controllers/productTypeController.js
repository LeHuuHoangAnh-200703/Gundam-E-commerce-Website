const ProductType = require("../models/productTypeModels");
const Product = require("../models/productModels");

exports.getAllProductType = async (req, res) => {
    try {
        const productType = await ProductType.find();
        res.status(200).json(productType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getProductTye = async (req, res) => {
    try {
        const productType = await ProductType.findOne({ MaLoaiSanPham: req.params.maLoaiSanPham });
        res.status(200).json(productType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.createProductType = async (req, res) => {
    try {
        const existingNameProductType = await ProductType.findOne({
            TenLoaiSanPham: { $regex: new RegExp(`^${req.body.TenLoaiSanPham}$`, "i") }
        });

        const existingProductType = await ProductType.findOne({
            LoaiSanPham: { $regex: new RegExp(`^${req.body.LoaiSanPham}$`, "i") }
        });

        if (existingProductType || existingNameProductType) {
            return res.status(400).json({ message: "Loại sản phẩm đã tồn tại!" })
        }

        const productType = new ProductType(req.body);
        await productType.save();
        return res.status(200).json({ message: "Thêm loại sản phẩm thành công!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.updateProductType = async (req, res) => {
    try {
        const productType = await ProductType.findOne({ MaLoaiSanPham: req.params.maLoaiSanPham });
        if (!productType) {
            return res.status(400).json({ message: "Loại sản phẩm không tồn tại!" });
        }

        // Nếu có cập nhật loại sản phẩm, kiểm tra tên trùng (không phân biệt hoa thường)
        if (req.body.TenLoaiSanPham) {
            const existingNameProductType = await ProductType.findOne({
                TenLoaiSanPham: { $regex: new RegExp(`^${req.body.TenLoaiSanPham}$`, "i") },
                MaLoaiSanPham: { $ne: req.params.maLoaiSanPham }, // Loại trừ loại sản phẩm hiện tại
            });
            if (existingNameProductType) {
                return res.status(400).json({ message: "Tên loại sản phẩm đã tồn tại trong cơ sở dữ liệu." });
            }
        }

        if (req.body.LoaiSanPham) {
            const existingProductType = await ProductType.findOne({
                LoaiSanPham: { $regex: new RegExp(`^${req.body.LoaiSanPham}$`, "i") },
                MaLoaiSanPham: { $ne: req.params.maLoaiSanPham }, // Loại trừ loại sản phẩm hiện tại
            });
            if (existingProductType) {
                return res.status(400).json({ message: "Loại sản phẩm đã tồn tại trong cơ sở dữ liệu." });
            }
        }

        productType.TenLoaiSanPham = req.body.TenLoaiSanPham || productType.TenLoaiSanPham;
        productType.LoaiSanPham = req.body.LoaiSanPham || productType.LoaiSanPham;

        await productType.save();

        return res.status(200).json({ message: "Cập nhật loại sản phẩm thành công!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.deleteProductType = async (req, res) => {
    try {
        const product = await Product.findOne({ MaLoaiSanPham: req.params.maLoaiSanPham });

        if (product) {
            return res.status(400).json({ message: "Loại sản phẩm đã được thêm ở phần sản phẩm." });
        }
        const productType = await ProductType.findOneAndDelete({ MaLoaiSanPham: req.params.maLoaiSanPham });
        res.status(200).json({ message: "Loại sản phẩm đã xóa thành công!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}