const Order = require("../models/orderModels");
const DiscountCode = require("../models/discountCodeModels");
const Inventory = require("../models/inventoryModels");
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
            return res.status(400).json({ message: "Đơn hàng không tồn tại!" });
        }
        return res.status(200).json(order);
    } catch (err) {
        return res.status(500).json({ message: err.message });
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
    let { MaGiamGia, TongDon, SanPhamDaMua } = req.body;
    let finalPrice = TongDon;
    try {
        // Xử lý nếu SanPhamDaMua là object
        if (SanPhamDaMua && !Array.isArray(SanPhamDaMua)) {
            SanPhamDaMua = [SanPhamDaMua];
        }

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

        for (const sp of SanPhamDaMua) {
            const inventory = await Inventory.findOne({ MaSanPham: sp.MaSanPham});
            if (!inventory) {
                return res.status(400).json({ message: `Sản phẩm không tồn tại trong kho.` });
            }

            if (inventory.SoLuongTon < sp.SoLuong) {
                return res.status(400).json({ message: `Số lượng sản phẩm không đủ.` });
            }

            inventory.SoLuongTon -= sp.SoLuong;
            await inventory.save();
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

        for (const sp of order.SanPhamDaMua) {
            const inventory = await Inventory.findOne({ MaSanPham: sp.MaSanPham });
            if (inventory) {
                inventory.SoLuongTon += sp.SoLuong;
                await inventory.save();
            }
        }

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
};

exports.getRevenueByMonth = async (req, res) => {
    const year = req.query.year || new Date().getFullYear(); // Lấy năm từ query hoặc mặc định là năm hiện tại
    console.log(year);
    try {
        const revenueData = await Order.aggregate([
            {
                $match: {
                    TrangThaiDon: "Đã giao thành công", // Chỉ tính doanh thu cho đơn hàng hoàn thành
                    NgayDatHang: {
                        $gte: new Date(`${year}-01-01`), // Ngày đầu tiên của năm
                        $lte: new Date(`${year}-12-31`) // Ngày cuối cùng của năm
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$NgayDatHang" }, // Lấy tháng từ trường NgayDatHang
                    totalRevenue: { $sum: "$TongDon" } // Tính tổng doanh thu
                }
            },
            {
                $sort: { _id: 1 } // Sắp xếp theo tháng
            }
        ]);

        // Tạo mảng doanh thu cho tất cả 12 tháng, nếu không có dữ liệu cho tháng nào thì gán doanh thu là 0
        const revenueMap = new Array(12).fill(0); // Mảng doanh thu mặc định cho 12 tháng

        // Cập nhật doanh thu cho các tháng có dữ liệu
        revenueData.forEach(item => {
            revenueMap[item._id - 1] = item.totalRevenue; // Lưu doanh thu vào vị trí đúng của tháng (0-indexed)
        });

        const response = {
            labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
            datasets: [
                {
                    label: `Doanh thu năm ${year}`,
                    data: revenueMap,
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1
                }
            ]
        };

        console.log(response);
        return res.status(200).json(response);
    } catch (err) {
        console.error("Lỗi khi lấy doanh thu theo tháng:", err);
        return res.status(500).json({ message: "Có lỗi xảy ra khi lấy thống kê doanh thu." });
    }
};
