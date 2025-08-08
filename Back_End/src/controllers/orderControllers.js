const Order = require("../models/orderModels");
const Feedback = require("../models/feedbackModels");
const DiscountCode = require("../models/discountCodeModels");
const Inventory = require("../models/inventoryModels");
const Product = require("../models/productModels");
const nodemailer = require("nodemailer");
const axios = require('axios');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "c3gundamstore@gmail.com",
        pass: "varzwbjducnkzmaj",
    },
});

const GHTK_TOKEN = "26SbcXtz1hJHrwFTDBNY6PZ5OEQGA0duX2lPAPg";
const GHTK_API_URL = 'https://services.giaohangtietkiem.vn/services/shipment/fee';

// Hàm trích xuất tỉnh/quận từ địa chỉ
function extractProvinceDistrict(address) {
    // Giả định: Địa chỉ dạng "123 Nguyễn Trãi, Thanh Xuân, Hà Nội"
    const parts = address.DiaChi.split(',').map(part => part.trim());
    const province = parts[parts.length - 1]; // Tỉnh: phần cuối
    const district = parts[parts.length - 2]; // Quận: phần áp cuối
    return { province, district };
}

async function calculateGHTKShippingFee(province, district) {
    try {
        const response = await axios.post(
            GHTK_API_URL,
            {
                pick_province: 'Tỉnh Hậu Giang', // Thay bằng tỉnh kho
                pick_district: 'Thành phố Vị Thanh', // Thay bằng quận kho
                province,
                district,
                weight: 500, // Trọng lượng mặc định: 500g
                value: 1000000, // Giá trị mặc định: 1 triệu
                transport: 'road', // Giao thường
                deliver_option: 'none',
            },
            { headers: { Token: GHTK_TOKEN } }
        );
        return response.data.fee.options.shipMoney;
    } catch (error) {
        throw new Error('Lỗi GHTK API: ' + error.message);
    }
}

exports.calculateShippingFee = async (req, res) => {
    const { address, totalOrder } = req.body;

    try {
        // Trích xuất tỉnh/quận
        const { province, district } = extractProvinceDistrict(address);
        if (!province || !district) {
            throw new Error('Địa chỉ không hợp lệ, thiếu tỉnh hoặc quận');
        }

        // Lấy phí ship từ GHTK
        let shippingFee = await calculateGHTKShippingFee(province, district);

        // Miễn phí ship cho đơn từ 2 triệu
        if (totalOrder >= 2000000) {
            shippingFee = 0;
        }

        res.json({
            success: true,
            shippingFee,
            details: { baseFee: shippingFee },
            shippingMethod: shippingFee === 0 ? 'Miễn phí giao hàng' : `Giao hàng (${formatCurrency(shippingFee)} VNĐ)`,
        });
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success: false,
            shippingFee: 40000, // Phí mặc định nếu lỗi
            message: 'Lỗi tính phí ship, sử dụng phí mặc định 40.000 VNĐ',
            shippingMethod: 'Giao hàng (40.000 VNĐ)',
        });
    }
};

exports.calculateDiscount = async (req, res) => {
    const { IdMaGiamGia, MaKhachHang, totalProductPrice } = req.body;
    let finalPrice = totalProductPrice;
    try {
        if (!IdMaGiamGia) {
            return res.json({
                success: true,
                finalPrice,
                discountAmount: 0,
                message: 'Không áp dụng mã giảm giá',
            });
        }
        const discount = await DiscountCode.findOne({ IdMaGiamGia });
        if (!discount) {
            return res.status(400).json({ success: false, message: "Mã giảm giá không tồn tại." });
        }
        const currentDay = new Date();
        if (currentDay > discount.NgayHetHan) {
            return res.status(400).json({ success: false, message: "Mã giảm giá đã hết hạn." });
        }
        if (discount.SoLanSuDung <= 0) {
            return res.status(400).json({ success: false, message: "Mã giảm giá đã hết lượt sử dụng." });
        }
        if (discount.IdKhachHangSuDung?.includes(MaKhachHang)) {
            return res.status(400).json({ success: false, message: "Bạn đã sử dụng mã giảm giá này rồi." });
        }
        const giaApDung = Number(discount.GiaApDung);
        const giamTien = Number(discount.GiamTien || 0);
        const giamPhanTram = discount.GiamPhanTram || 0;
        if (totalProductPrice >= giaApDung) {
            let discountAmount = 0;
            if (giamTien > 0) {
                discountAmount = giamTien;
                finalPrice -= giamTien;
            } else if (giamPhanTram > 0) {
                discountAmount = finalPrice * (giamPhanTram / 100);
                finalPrice -= discountAmount;
            }
            if (finalPrice < 0) {
                finalPrice = 0;
            }
            return res.json({
                success: true,
                finalPrice,
                discountAmount
            });
        } else {
            return res.status(400).json({ success: false, message: "Giá trị đơn hàng không đủ để áp dụng mã giảm giá." });
        }
    } catch (error) {
        console.error('Calculate Discount Error:', error.message);
        res.status(500).json({
            success: false,
            finalPrice: totalProductPrice,
            discountAmount: 0,
            message: 'Lỗi tính giảm giá, không áp dụng mã',
        });
    }
};

// Hàm format tiền
function formatCurrency(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
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

exports.cancelOrder = async (req, res) => {
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
        // Lấy thông tin đơn hàng hiện tại
        const currentOrder = await Order.findOne({ MaDonHang: maDonHang });
        
        if (!currentOrder) {
            return res.status(404).json({ message: 'Đơn hàng không tìm thấy.' });
        }

        // Lưu trạng thái cũ
        const oldStatus = currentOrder.TrangThaiDon;

        // Cập nhật trạng thái đơn hàng
        const updatedOrder = await Order.findOneAndUpdate(
            { MaDonHang: maDonHang },
            { TrangThaiDon: newStatus },
            { new: true }
        );

        // Nếu trạng thái mới là "Đã trả hàng", cộng lại số lượng vào kho
        if (newStatus === 'Đã trả hàng' && oldStatus !== 'Đã trả hàng') {
            for (const sp of updatedOrder.SanPhamDaMua) {
                // Cộng lại số lượng vào kho
                const inventory = await Inventory.findOne({ MaSanPham: sp.MaSanPham });
                if (inventory) {
                    inventory.SoLuongTon += sp.SoLuong;
                    await inventory.save();
                }

                // Trừ số lượt bán của sản phẩm
                const product = await Product.findOne({ MaSanPham: sp.MaSanPham });
                if (product) {
                    product.LuotBan = Math.max(0, (product.LuotBan || 0) - sp.SoLuong);
                    await product.save();
                }
            }
            
            console.log(`Đã cộng lại số lượng vào kho cho đơn hàng ${maDonHang}`);
        }

        res.status(200).json({
            success: true,
            order: updatedOrder,
            message: `Cập nhật trạng thái đơn hàng thành công.`
        });

    } catch (error) {
        console.error("Error updating order status: ", error);
        res.status(500).json({ 
            success: false,
            message: 'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.',
            error: error.message 
        });
    }
};

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
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #4CAF50; text-align: center;">✅ Đặt hàng thành công!</h2>
                    
                    <p>Kính chào Quý khách,</p>
                    
                    <p>Cảm ơn bạn đã đặt hàng tại <strong>C3 GUNDAM STORE</strong>.</p>
                    
                    <p>Đơn hàng của bạn đã được xác nhận và sẽ được giao trong vòng <strong>3-5 ngày làm việc</strong>.</p>
                    
                    <p>Chúng tôi sẽ thông báo khi đơn hàng được vận chuyển.</p>
                    
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                    
                    <p style="color: #666; font-size: 14px;">
                        Liên hệ hỗ trợ: c3gundamstore@gmail.com | Hotline: 079-965-8592
                    </p>
                    
                    <p style="text-align: center; color: #999; font-size: 12px;">
                        Cảm ơn bạn đã tin tưởng C3 GUNDAM STORE!
                    </p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true, message: "Email đã được gửi thành công" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Lỗi khi gửi email xác nhận đặt hàng." });
    }
};