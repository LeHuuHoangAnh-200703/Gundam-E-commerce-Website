const Order = require("../models/orderModels");
const DiscountCode = require("../models/discountCodeModels");

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            MaDonHang: req.params.maDonHang,
        });
        if (!order) {
            res.status(400).json({ message: "Đơn hàng không tồn tại!" });
        }
        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createOrder = async (req, res) => {
    const { discountCode, totalPrice } = req.body;
    let finalPrice = totalPrice;  
    try {
        if (discountCode) {
            const discount = await DiscountCode.find({ MaGiamGia: discountCode });

            if (!discount) {
                return res.status(400).json({ message: "Mã giảm giá không tồn tại." });
            }

            const currentDay = new Date();
            if (currentDay > discount.NgayHetHan) {
                return res.status(400).json({ message: "Mã giảm giá đã hết hạn." });
            }

            if (discount.SoLanSuDung <= 0 ) {
                return res.status(400).json({ message: "Mã giảm giá đã hết lượt sử dụng." });
            }

            const giaApDung = Number(discount.GiaApDung);  
            const giamTien = Number(discount.GiamTien || 0);
            const giamPhanTram = discount.GiamPhanTram || 0;
            if (totalPrice >= giaApDung) {
                if (discount.GiamTien) {
                    finalPrice -= giamTien;
                }

                if (discount.GiamPhanTram) {
                    finalPrice -= (finalPrice * (giamPhanTram / 100));
                }

                if (finalPrice < 0) {  
                    finalPrice = 0;  
                }  

                discount.SoLanSuDung--;
                await discount.save();
            } else {  
                return res.status(400).json({ message: "Giá trị đơn hàng không đủ để áp dụng mã giảm giá." });  
            }  
        }
        const order = new Order({ ...req.body, totalPrice: finalPrice });
        await order.save();
        res.status(200).json(order); 
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updatedOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            MaDonHang: req.params.maDonHang,
        });
        if (!order) {
            return res.status(404).json({ message: "Đơn hàng không tồn tại" });
        }

        const updatedDiscountCode = await discountCode.save();
        res.status(200).json(updatedDiscountCode);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteOrder = async (req, res) => {
    const { maDonHang } = req.params;
    try {
        const order = await Order.findOneAndDelete({
            MaDonHang: maDonHang,
        });
        if (!Order) {
            return res.status(404).json({ message: "Đơn hàng không tồn tại." });
        }
        res.status(200).json({ message: "Đơn hàng đã được xóa." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};