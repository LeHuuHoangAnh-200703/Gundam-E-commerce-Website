const Cart = require("../models/cartModels");
const Product = require("../models/productModels");

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
    console.log(maKhachHang)
    try {
        const cart = await Cart.find({
            MaKhachHang: maKhachHang,
        });
        if (cart.length === 0) {
            return res.status(400).json({ message: "Giỏ hàng không tồn tại!" });
        }
        return res.status(200).json(cart);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

exports.createCart = async (req, res) => {
    const { maSanPham } = req.params;
    const { MaKhachHang } = req.body;
    console.log(MaKhachHang)
    try {
        const product = await Product.findOne({ MaSanPham: maSanPham });
        const cart = await Cart.findOne({ MaSanPham: maSanPham });
        if (cart) {
            cart.SoLuong ++;
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