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

exports.getOrderById = async (req, res) => {
    const { maKhachHang } = req.params;
    try {
        const orders = await Order.find({ MaKhachHang: maKhachHang });
        if (orders.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng nào cho mã khách hàng này!" });
        }
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.createOrder = async (req, res) => {
    const { MaGiamGia, TongDon } = req.body;
    let finalPrice = TongDon;
    try {
        if (MaGiamGia) {
            const discount = await DiscountCode.findOne({ MaGiamGia: MaGiamGia });
            if (!discount) {
                return res.status(400).json({ message: "Mã giảm giá không tồn tại." });
            }

            const currentDay = new Date();
            if (currentDay > discount.NgayHetHan) {
                return res.status(400).json({ message: "Mã giảm giá đã hết hạn." });
            }

            if (discount.SoLanSuDung <= 0) {
                return res.status(400).json({ message: "Mã giảm giá đã hết lượt sử dụng." });
            }

            const giaApDung = Number(discount.GiaApDung);
            const giamTien = Number(discount.GiamTien || 0);
            const giamPhanTram = discount.GiamPhanTram || 0;

            if (TongDon >= giaApDung) {
                if (giamTien > 0) {
                    finalPrice -= giamTien;
                } else if (giamPhanTram > 0) {
                    finalPrice -= (finalPrice * (giamPhanTram / 100));
                }

                if (finalPrice < 0) {
                    finalPrice = 0;
                }

                discount.SoLanSuDung -= 1;
                await discount.save();
            } else {
                return res.status(400).json({ message: "Giá trị đơn hàng không đủ để áp dụng mã giảm giá." });
            }
        }

        const order = new Order({ ...req.body, TongDon: finalPrice });
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

        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);
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
        if (!order) {
            return res.status(404).json({ message: "Đơn hàng không tồn tại." });
        }
        res.status(200).json({ message: "Đơn hàng đã được xóa." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updatedStatus = async (req, res) => {
    const { maDonHang} = req.params;
    const { newStatus } = req.body;
    try {  
        const updatedOrder = await Order.findOneAndUpdate(  
            { MaDonHang: maDonHang },  
            { TrangThaiDon: newStatus },  
            { new: true } 
        );  

        if (!updatedOrder) {  
            return res.status(404).json({ message: 'Đơn hàng không tìm thấy.' });  
        }  

        res.status(200).json(updatedOrder);  
    } catch (error) {  
        console.error("Error updating order status: ", error);  
        res.status(500).json({ message: 'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.' });  
    }
}