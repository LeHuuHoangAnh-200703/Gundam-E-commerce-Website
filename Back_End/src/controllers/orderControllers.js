const Order = require("../models/orderModels");
const Feedback = require("../models/feedbackModels");
const DiscountCode = require("../models/discountCodeModels");
const Inventory = require("../models/inventoryModels");
const Product = require("../models/productModels");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "c3gundamstore@gmail.com",
        pass: "varzwbjducnkzmaj",
    },
});
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
    let { IdMaGiamGia, TongDon, SanPhamDaMua, MaKhachHang } = req.body;
    let finalPrice = TongDon;
    try {
        // Xử lý nếu SanPhamDaMua là object
        if (SanPhamDaMua && !Array.isArray(SanPhamDaMua)) {
            SanPhamDaMua = [SanPhamDaMua];
        }

        if (IdMaGiamGia) {
            const discount = await DiscountCode.findOne({ IdMaGiamGia: IdMaGiamGia });
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

            // Kiểm tra khách hàng đã sử dụng mã này chưa
            if (discount.IdKhachHangSuDung?.includes(MaKhachHang)) {
                return res.status(400).json({ message: "Bạn đã sử dụng mã giảm giá này rồi." });
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
                discount.IdKhachHangSuDung = [...(discount.IdKhachHangSuDung || []), MaKhachHang];
                await discount.save();
            } else {
                return res.status(400).json({ message: "Giá trị đơn hàng không đủ để áp dụng mã giảm giá." });
            }
        }

        for (const sp of SanPhamDaMua) {
            const inventory = await Inventory.findOne({ MaSanPham: sp.MaSanPham });
            const product = await Product.findOne({ MaSanPham: sp.MaSanPham });

            if (!inventory) {
                return res.status(400).json({ message: `Sản phẩm không tồn tại trong kho.` });
            }

            if (inventory.SoLuongTon < sp.SoLuong) {
                return res.status(400).json({ message: `Số lượng sản phẩm không đủ.` });
            }

            inventory.SoLuongTon -= sp.SoLuong;
            await inventory.save();

            if (product) {
                product.LuotBan = (product.LuotBan || 0) + sp.SoLuong;
                await product.save();
            }

        }

        const order = new Order({ ...req.body, TongDon: finalPrice });
        await order.save();
        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createTempOrder = async (req, res) => {
    let { IdMaGiamGia, TongDon, SanPhamDaMua, MaKhachHang } = req.body;
    let finalPrice = TongDon;
    try {
        if (SanPhamDaMua && !Array.isArray(SanPhamDaMua)) {
            SanPhamDaMua = [SanPhamDaMua];
        }
        if (IdMaGiamGia) {
            const discount = await DiscountCode.findOne({ IdMaGiamGia: IdMaGiamGia });
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

            // Kiểm tra khách hàng đã sử dụng mã này chưa
            if (discount.IdKhachHangSuDung?.includes(MaKhachHang)) {
                return res.status(400).json({ message: "Bạn đã sử dụng mã giảm giá này rồi." });
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
                discount.IdKhachHangSuDung = [...(discount.IdKhachHangSuDung || []), MaKhachHang];
                await discount.save();
            } else {
                return res.status(400).json({ message: "Giá trị đơn hàng không đủ để áp dụng mã giảm giá." });
            }
        }
        for (const sp of SanPhamDaMua) {
            const inventory = await Inventory.findOne({ MaSanPham: sp.MaSanPham });
            if (!inventory || inventory.SoLuongTon < sp.SoLuong) return res.status(400).json({ message: `Sản phẩm ${sp.TenSanPham} không đủ số lượng.` });
        }
        const orderData = {
            MaKhachHang: req.body.MaKhachHang,
            DiaChiNhanHang: req.body.DiaChiNhanHang,
            SanPhamDaMua: req.body.SanPhamDaMua,
            IdMaGiamGia: req.body.IdMaGiamGia,
            HinhThucThanhToan: 'Thanh toán qua VNPAY',
            TongDon: finalPrice,
            GhiChu: req.body.GhiChu || 'Không có ghi chú',
            NgayDatHang: new Date(),
            HinhThucVanChuyen: req.body.HinhThucVanChuyen,
            TrangThaiThanhToan: 'Chờ thanh toán',
            TrangThaiDon: 'Đang chờ xác nhận',
        };
        const order = new Order(orderData);
        await order.save();
        res.json({ MaDonHang: order.MaDonHang });
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        const order = await Order.findOneAndUpdate(
            { MaDonHang: maDonHang },
            { TrangThaiDon: 'Đơn hàng đã hủy' },
            { new: true }
        );

        for (const sp of order.SanPhamDaMua) {
            const inventory = await Inventory.findOne({ MaSanPham: sp.MaSanPham });
            const product = await Product.findOne({ MaSanPham: sp.MaSanPham });
            if (inventory) {
                inventory.SoLuongTon += sp.SoLuong;
                await inventory.save();
            }

            if (product) {
                product.LuotBan = Math.max(0, product.LuotBan - sp.SoLuong); // Không để LuotBan < 0
                await product.save();
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
    const { maDonHang } = req.params;
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
    try {
        const revenueData = await Order.aggregate([
            {
                $match: {
                    $or: [
                        {
                            TrangThaiDon: "Đã nhận được hàng"
                        },
                        { TrangThaiDon: "Đã giao thành công" },
                        {
                            TrangThaiThanhToan: "Đã thanh toán qua PayPal",
                            TrangThaiDon: { $ne: "Đơn hàng đã hủy" },
                        },
                        {
                            TrangThaiThanhToan: "Đã thanh toán qua VNPay",
                            TrangThaiDon: { $ne: "Đơn hàng đã hủy" },
                        }
                    ],
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
                    backgroundColor: "rgba(255, 107, 107, 0.6)",
                    borderColor: "rgba(255, 107, 107, 1)",
                    borderWidth: 1
                }
            ]
        };
        return res.status(200).json(response);
    } catch (err) {
        return res.status(500).json({ message: "Có lỗi xảy ra khi lấy thống kê doanh thu." });
    }
};

//Thống kê trạng thái đơn hàng
exports.getOrderStatus = async (req, res) => {
    try {
        const statistics = await Order.aggregate([
            {
                $group: {
                    _id: "$TrangThaiDon",
                    count: { $sum: 1 }
                }
            }
        ]);
        return res.status(200).json(statistics);
    } catch (err) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

//Thống kê doanh thu theo tháng
exports.getRevenueByDay = async (req, res) => {
    const year = req.query.year || new Date().getFullYear();
    const month = req.query.month || new Date().getMonth() + 1;
    try {
        const revenueData = await Order.aggregate([
            {
                $match: {
                    $or: [
                        { TrangThaiDon: "Đã nhận được hàng" },
                        { TrangThaiDon: "Đã giao thành công" },
                        {
                            TrangThaiThanhToan: "Đã thanh toán qua PayPal",
                            TrangThaiDon: { $ne: "Đơn hàng đã hủy" },
                        },
                        {
                            TrangThaiThanhToan: "Đã thanh toán qua VNPay",
                            TrangThaiDon: { $ne: "Đơn hàng đã hủy" },
                        }
                    ],
                    NgayDatHang: {
                        $gte: new Date(`${year}-${month}-01`),
                        $lte: new Date(`${year}-${month}-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $dayOfMonth: "$NgayDatHang" },
                    totalRevenue: { $sum: "$TongDon" }
                }
            },
            {
                $sort: { _id: 1 } // Sắp xếp theo ngày
            }
        ]);

        // Tạo mảng doanh thu cho tất cả các ngày trong tháng (nếu không có dữ liệu cho ngày nào thì gán doanh thu là 0)
        const daysInMonth = new Date(year, month, 0).getDate(); // Số ngày trong tháng
        const revenueMap = new Array(daysInMonth).fill(0); // Mảng doanh thu mặc định cho tất cả các ngày trong tháng

        // Cập nhật doanh thu cho các ngày có dữ liệu
        revenueData.forEach(item => {
            revenueMap[item._id - 1] = item.totalRevenue; // Lưu doanh thu vào vị trí đúng của ngày (0-indexed)
        });
        const totalRevenueOfYear = revenueMap.reduce((sum, val) => sum + val, 0);

        const response = {
            labels: Array.from({ length: daysInMonth }, (_, i) => `Ngày ${i + 1}`),
            datasets: [
                {
                    label: `Doanh thu tháng ${month}/${year}`,
                    data: revenueMap,
                    backgroundColor: "rgba(75, 192, 192, 0.6)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1
                }
            ],
            tongDoanhThu: totalRevenueOfYear
        };
        return res.status(200).json(response);
    } catch (err) {
        return res.status(500).json({ message: "Có lỗi xảy ra khi lấy thống kê doanh thu." });
    }
};

//Kiểm tra xem đã đánh giá chưa
exports.checkOrderReviewed = async (req, res) => {
    const { maDonHang } = req.params;
    try {
        const idDonHang = await Feedback.findOne({ MaDonHang: maDonHang });
        if (idDonHang) {
            return res.status(200).json({ results: true });
        } else {
            return res.status(200).json({ results: false });
        }
    } catch (err) {
        return res.status(500).json({ message: "Có lỗi xảy ra." });
    }
}

//Kiểm tra đơn hàng theo ngày, tháng, năm
exports.getOrderByDayMonth = async (req, res) => {
    try {
        const year = req.query.year ? parseInt(req.query.year) : null;
        const month = req.query.month ? parseInt(req.query.month) : null;
        const day = req.query.day ? parseInt(req.query.day) : null;

        // Xây dựng pipeline aggregation
        let pipeline = [];

        if (month && !day && !year) {
            // Lọc chỉ theo tháng (bất kỳ ngày/năm nào)
            pipeline.push({
                $match: {
                    $expr: {
                        $eq: [{ $month: "$NgayDatHang" }, month]
                    }
                }
            });
        } else if (day && month && !year) {
            // Lọc chỉ theo tháng và ngày (bất kỳ năm nào)
            pipeline.push({
                $match: {
                    $expr: {
                        $and: [
                            { $eq: [{ $month: "$NgayDatHang" }, month] },
                            { $eq: [{ $dayOfMonth: "$NgayDatHang" }, day] }
                        ]
                    }
                }
            });
        } else if (day && !month && !year) {
            // Lọc chỉ theo ngày (bất kỳ tháng/năm nào)
            pipeline.push({
                $match: {
                    $expr: {
                        $eq: [{ $dayOfMonth: "$NgayDatHang" }, day]
                    }
                }
            });
        } else {
            // Xây dựng điều kiện lọc cho các trường hợp khác
            let matchCondition = {};

            if (day && month && year) {
                // Lọc theo ngày-tháng-năm
                matchCondition.NgayDatHang = {
                    $gte: new Date(year, month - 1, day),
                    $lte: new Date(year, month - 1, day, 23, 59, 59, 999)
                };
            } else if (month && year) {
                // Lọc theo tháng-năm
                matchCondition.NgayDatHang = {
                    $gte: new Date(year, month - 1, 1),
                    $lte: new Date(year, month, 0, 23, 59, 59, 999)
                };
            } else if (year) {
                // Lọc theo năm
                matchCondition.NgayDatHang = {
                    $gte: new Date(year, 0, 1),
                    $lte: new Date(year, 11, 31, 23, 59, 59, 999)
                };
            } else {
                return res.status(400).json({ message: "At least one of year, month, or day is required" });
            }

            pipeline.push({ $match: matchCondition });
        }

        // Thêm stage sắp xếp theo NgayDatHang giảm dần
        pipeline.push({ $sort: { NgayDatHang: -1 } });

        // Thực thi pipeline
        const results = await Order.aggregate(pipeline);

        return res.status(200).json(results);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.sendEmailOrder = async (req, res) => {
    const email = req.query.email;
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Đặt hàng thành công tại C3 GUNDAM STORE",
            text: "Cám ơn bạn đã đặt hàng. Đơn hàng sẽ được giao đến bạn trong vòng 3 - 5 ngày.",
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json(true)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Lỗi khi gửi email khi đặt hàng." });
    }
}