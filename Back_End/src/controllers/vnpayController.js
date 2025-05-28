const vnpay = require('vnpay');
const Order = require('../models/orderModels');
const DiscountCode = require('../models/discountCodeModels');
const Inventory = require('../models/inventoryModels');
const Product = require('../models/productModels');
const moment = require('moment');
const crypto = require('crypto');
const qs = require('qs');
const axios = require('axios');

const VNP_TMN_CODE = "B57MNZBD";
const VNP_HASH_SECRET = "9AXN2O7KVV9MJS5BB4I4087IQSSJ7YQN";
const VNP_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const VNP_RETURN_URL = "http://localhost:5173/orders_history";

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
}

// Tạo URL thanh toán
exports.createPaymentUrl = async (req, res) => {
    try {
        const { amount, orderId, orderInfo, ipAddr } = req.body;

        // Kiểm tra đầu vào
        if (!amount || !orderId || !orderInfo || !ipAddr) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc: amount, orderId, orderInfo, ipAddr' });
        }

        // Tạo ngày giờ theo định dạng YYYYMMDDHHmmss
        const date = new Date();
        const createDate = date.toISOString().replace(/[-:T.]/g, '').slice(0, 14);

        // Tạo tham số VNPAY
        let vnpParams = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: VNP_TMN_CODE,
            vnp_Amount: amount * 100, // VNPAY yêu cầu nhân 100
            vnp_CurrCode: 'VND',
            vnp_TxnRef: orderId,
            vnp_OrderInfo: orderInfo,
            vnp_OrderType: 'other',
            vnp_Locale: 'vn',
            vnp_ReturnUrl: VNP_RETURN_URL,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: createDate,
        };

        // Sắp xếp tham số
        vnpParams = sortObject(vnpParams);

        // Tạo chữ ký (secureHash)
        const signData = qs.stringify(vnpParams, { encode: false });
        const hmac = crypto.createHmac('sha512', VNP_HASH_SECRET);
        const secureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        vnpParams['vnp_SecureHash'] = secureHash;

        // Tạo URL thanh toán
        const paymentUrl = `${VNP_URL}?${qs.stringify(vnpParams, { encode: false })}`;
        return res.json({ paymentUrl });
    } catch (error) {
        console.error('Error creating payment URL:', error);
        return res.status(500).json({ message: 'Không thể tạo URL thanh toán' });
    }
};

// Xử lý Return URL
exports.handleReturnUrl = async (req, res) => {
    try {
        let vnpParams = req.query;
        const secureHash = vnpParams.vnp_SecureHash;

        // Xóa các trường không cần thiết để kiểm tra chữ ký
        delete vnpParams.vnp_SecureHash;
        delete vnpParams.vnp_SecureHashType;

        // Sắp xếp tham số
        vnpParams = sortObject(vnpParams);

        // Kiểm tra chữ ký
        const signData = qs.stringify(vnpParams, { encode: false });
        const hmac = crypto.createHmac('sha512', VNP_HASH_SECRET);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        if (secureHash === signed && vnpParams.vnp_ResponseCode === '00') {
            // Giao dịch thành công
            const order = await Order.findOne({ MaDonHang: vnpParams.vnp_TxnRef });
            if (!order) {
                return res.redirect('/payment-fail');
            }

            // Cập nhật mã giảm giá
            if (order.IdMaGiamGia) {
                const discount = await DiscountCode.findOne({ IdMaGiamGia: order.IdMaGiamGia });
                if (discount) {
                    discount.SoLanSuDung -= 1;
                    discount.IdKhachHangSuDung = [...(discount.IdKhachHangSuDung || []), order.MaKhachHang];
                    await discount.save();
                }
            }

            // Cập nhật tồn kho và lượt bán
            for (const sp of order.SanPhamDaMua) {
                const inventory = await Inventory.findOne({ MaSanPham: sp.MaSanPham });
                if (inventory) {
                    inventory.SoLuongTon -= sp.SoLuong;
                    await inventory.save();
                }
                const product = await Product.findOne({ MaSanPham: sp.MaSanPham });
                if (product) {
                    product.LuotBan = (product.LuotBan || 0) + sp.SoLuong;
                    await product.save();
                }
            }

            // Cập nhật trạng thái đơn hàng
            order.TrangThaiThanhToan = 'Đã thanh toán qua VNPay';
            order.TransactionId = vnpParams.vnp_TransactionNo;
            await order.save();

            // Gửi email xác nhận
            await axios.get(`http://localhost:3000/api/donhang/guiemail?email=${encodeURIComponent(vnpParams.vnp_OrderInfo.split('###')[1])}`);

            // Redirect đến trang thành công
            return res.redirect(
                `/payment-success?transactionId=${vnpParams.vnp_TransactionNo}&amount=${vnpParams.vnp_Amount / 100}&orderInfo=${encodeURIComponent(
                    vnpParams.vnp_OrderInfo.split('###')[0]
                )}`
            );
        } else {
            // Giao dịch thất bại
            return res.redirect('/payment-fail');
        }
    } catch (error) {
        console.error('Error processing return URL:', error);
        return res.redirect('/payment-fail');
    }
};

// Xử lý IPN
exports.handleIpn = async (req, res) => {
    try {
        let vnpParams = req.query;
        const secureHash = vnpParams.vnp_SecureHash;

        // Xóa các trường không cần thiết
        delete vnpParams.vnp_SecureHash;
        delete vnpParams.vnp_SecureHashType;

        // Sắp xếp tham số
        vnpParams = sortObject(vnpParams);

        // Kiểm tra chữ ký
        const signData = qs.stringify(vnpParams, { encode: false });
        const hmac = crypto.createHmac('sha512', VNP_HASH_SECRET);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        const order = await Order.findOne({ MaDonHang: vnpParams.vnp_TxnRef });
        if (!order) {
            return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
        }

        const checkAmount = order.TongDon * 100 === parseInt(vnpParams.vnp_Amount);
        const paymentStatus = order.TrangThaiThanhToan === 'Chờ thanh toán' ? '0' : '1';

        if (secureHash === signed) {
            if (checkAmount) {
                if (paymentStatus === '0') {
                    if (vnpParams.vnp_ResponseCode === '00') {
                        // Giao dịch thành công
                        if (order.IdMaGiamGia) {
                            const discount = await DiscountCode.findOne({ IdMaGiamGia: order.IdMaGiamGia });
                            if (discount) {
                                discount.SoLanSuDung -= 1;
                                discount.IdKhachHangSuDung = [...(discount.IdKhachHangSuDung || []), order.MaKhachHang];
                                await discount.save();
                            }
                        }
                        for (const sp of order.SanPhamDaMua) {
                            const inventory = await Inventory.findOne({ MaSanPham: sp.MaSanPham });
                            if (inventory) {
                                inventory.SoLuongTon -= sp.SoLuong;
                                await inventory.save();
                            }
                            const product = await Product.findOne({ MaSanPham: sp.MaSanPham });
                            if (product) {
                                product.LuotBan += sp.SoLuong;
                                await product.save();
                            }
                        }
                        order.TrangThaiThanhToan = 'Đã thanh toán qua VNPay';
                        order.TransactionId = vnpParams.vnp_TransactionNo;
                        await order.save();
                        return res.status(200).json({ RspCode: '00', Message: 'Success' });
                    } else {
                        // Giao dịch thất bại
                        return res.status(200).json({ RspCode: '00', Message: 'Success' }); // VNPAY yêu cầu trả RspCode '00' ngay cả khi giao dịch thất bại
                    }
                } else {
                    return res.status(200).json({ RspCode: '02', Message: 'This order has been updated to the payment status' });
                }
            } else {
                return res.status(200).json({ RspCode: '04', Message: 'Amount invalid' });
            }
        } else {
            return res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
        }
    } catch (error) {
        console.error('Error processing IPN:', error);
        return res.status(200).json({ RspCode: '99', Message: 'Error processing IPN' });
    }
};