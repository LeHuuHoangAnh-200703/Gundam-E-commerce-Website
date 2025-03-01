const Cart = require("../models/cartModels");
const Product = require("../models/productModels");
const Inventory = require("../models/inventoryModels");

exports.getAllCarts = async (req, res) => {
    try {
        const carts = await Cart.find();
        res.status(200).json(carts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            MaGioHang: req.params.maGioHang,
        });
        if (!cart) {
            res.status(400).json({ message: "Mã giỏ hàng không tồn tại!" });
        }
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getCartByID = async (req, res) => {
    const { maKhachHang } = req.params;
    try {
        const carts = await Cart.find({
            MaKhachHang: maKhachHang,
        });
        const productIds = [...new Set(carts.map(cart => cart.MaSanPham))];

        const products = await Product.find({ MaSanPham: { $in: productIds } });
        const productMap = {};
        products.forEach(product => {
            productMap[product.MaSanPham] = {
                TenSanPham: product.TenSanPham,
                HinhAnh: product.Images[0],
                LoaiSanPham: product.LoaiSanPham,
                DonGia: product.GiaBan
            };
        });

        const productsWithCarts = carts.map(product => ({
            ...product.toObject(),
            TenSanPham: productMap[product.MaSanPham]?.TenSanPham,
            HinhAnh: productMap[product.MaSanPham]?.HinhAnh,
            LoaiSanPham: productMap[product.MaSanPham]?.LoaiSanPham,
            DonGia: productMap[product.MaSanPham]?.DonGia,
        }));

        return res.status(200).json(productsWithCarts);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

exports.createCart = async (req, res) => {
    const { maSanPham } = req.params;
    const { MaKhachHang } = req.body;
    try {
        const product = await Product.findOne({ MaSanPham: maSanPham });
        const cart = await Cart.findOne({ MaSanPham: maSanPham });
        if (cart) {
            cart.SoLuong++;
            await cart.save();
            res.status(200).json(cart);
        } else {
            const newCart = new Cart({
                MaSanPham: maSanPham,
                MaKhachHang: MaKhachHang,
                TenSanPham: product.TenSanPham,
                LoaiSanPham: product.LoaiSanPham,
                DonGia: product.GiaBan,
                HinhAnh: product.Images[0],
                SoLuong: 1,
            });
            await newCart.save();
            res.status(200).json(newCart);
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteCart = async (req, res) => {
    const { maGioHang } = req.params;
    try {
        const cart = await Cart.findOneAndDelete({
            MaGioHang: maGioHang,
        });
        if (!cart) {
            return res.status(404).json({ message: "Mã giỏ hàng không tồn tại." });
        }
        res.status(200).json({ message: "Giỏ hàng đã được xóa." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateCartItem = async (req, res) => {
    const { maKhachHang, maSanPham, soLuong } = req.body;
    try {
        const cartItem = await Cart.findOne({ MaKhachHang: maKhachHang, MaSanPham: maSanPham });
        if (!cartItem) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại trong giỏ hàng." });
        }

        cartItem.SoLuong = soLuong;
        await cartItem.save();

        res.status(200).json({ message: "Cập nhật giỏ hàng thành công!" });
    } catch (err) {
        res.status(500).json({ message: "Có lỗi xảy ra!", error: err.message });
    }
};

exports.checkQuantity = async (req, res) => {
    const { maKhachHang } = req.params;
    try {
        const cartItems = await Cart.find({ MaKhachHang: maKhachHang });
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "Giỏ hàng trống!" });
        }
        const productIds = cartItems.map(item => item.MaSanPham); // Lấy id sản phẩm trong giỏ
        const products = await Inventory.find({ MaSanPham: { $in: productIds } }); // Lấy sản phẩm trong kho
        // Kiểm tra số lượng tồn kho
        for (const cartItem of cartItems) {
            const product = products.find(p => p.MaSanPham === cartItem.MaSanPham);
            if (!product) {
                return res.status(400).json({
                    message: `Sản phẩm ${cartItem.TenSanPham} không tồn tại.`,
                });
            }
            if (cartItem.SoLuong > product.SoLuongTon) {
                return res.status(400).json({
                    message: `Sản phẩm ${cartItem.TenSanPham} chỉ còn ${product.SoLuongTon} trong kho.`,
                });
            }
        }
        return res.status(200).json(cartItems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}