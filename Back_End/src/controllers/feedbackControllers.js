const FeedBack = require("../models/feedbackModels");
const Customer = require("../models/customersModels");
const Order = require("../models/orderModels");
const path = require("path");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const axios = require('axios');

cloudinary.config({
    cloud_name: 'dwcajbc6f',
    api_key: '365476741985665',
    api_secret: '6gAWhCMdI8DfBAs-1ZDwwx1xM0Y'
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
exports.getAllFeedBacks = async (req, res) => {
    try {
        const feedBacks = await FeedBack.find();
        const customerIds = [...new Set(feedBacks.map(feedBack => feedBack.MaKhachHang))];

        const customers = await Customer.find({ MaKhachHang: { $in: customerIds } });
        const customerMap = {};
        customers.forEach(customer => {
            customerMap[customer.MaKhachHang] = {
                TenKhachHang: customer.TenKhachHang,
                HinhAnhKhachHang: customer.Image
            };
        });

        const feedbacksWithCustomer = feedBacks.map(feedBack => ({
            ...feedBack.toObject(),
            TenKhachHang: customerMap[feedBack.MaKhachHang]?.TenKhachHang || "Không xác định",
            HinhAnhKhachHang: customerMap[feedBack.MaKhachHang]?.HinhAnhKhachHang || null
        }));

        res.status(200).json(feedbacksWithCustomer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getFeedBack = async (req, res) => {
    try {
        const feeBack = await FeedBack.findOne({
            MaDanhGia: req.params.maDanhGia,
        });
        if (!feeBack) {
            res.status(400).json({ message: "Mã đánh giá không tồn tại!" });
        }
        res.status(200).json(feeBack);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const bannedWords = [
    "ngu", "đần", "ngu dốt", "khốn nạn", "vô học", "đồ rác rưởi",
    "thằng", "con", "mày", "đồ dốt", "đồ điên", "chết tiệt", "vô dụng",
    "vứt đi", "tởm", "thảm họa", "đồ rác", "tệ hại",
    "địt", "đéo", "cái đéo gì", "đm", "dm", "vkl", "vcl", "cc",
    "đm nó", "con cat", "con cac", "con cặc", "con cặt", "m nó", "đồ cút", "thằng chó",
    "con mẹ nó", "chết mẹ", "bố mày", "cmm", "vl", "thằng chó",
    "đồ chó", "đồ con chó", "đồ mạt hạng", "đồ vô học", "đồ khốn",
    "đồ tồi tệ", "đồ bẩn thỉu", "óc chó", "thằng lừa đảo", "đồ thất đức",
    "lìn", "ln", "đụ", "đm mày", "đệch", "vãi cả chưởng", "đồ như ct",
    "đ mày", "dmtt", "cmnr", "súc vật", "đồ súc vật", "con súc vật", "đồ thú vật", "đồ không người",
    "thằng súc vật", "con thú", "đồ con thú", "đồ ngu si", "đồ đần độn",
    "đồ khờ", "đồ ngốc", "đồ si", "đồ đại ngu", "đồ bị điên",
    "đồ phá hoại", "đồ tàn phá", "đồ hủy hoại", "đồ tệ nạn",
    "đồ quỷ", "đồ ma", "đồ ác quỷ", "đồ quỷ dữ", "đồ tà ma",
    "đồ chết", "đồ chết tiệt", "đồ chết dở", "đồ chết đói",
    "đồ nghiệp", "đồ tội lỗi", "đồ phạm tội", "đồ tội phạm",
    "hạ đẳng", "đồ hạ đẳng", "đồ kém cỏi", "đồ thua kém", "đồ dở hơi",
    "đồ mất dạy", "đồ vô giáo dục", "đồ thô lỗ", "đồ bất lịch sự",
    "đồ vô văn hóa", "đồ man rợ", "đồ dã man", "đồ vô ý thức",
    "đồ bệnh hoạn", "đồ tâm thần", "đồ điên loạn", "đồ rồ dại",
    "đồ khùng", "đồ loạn trí", "đồ mất trí", "đồ rối loạn",
    "đánh chết", "giết chết", "xử chết", "đập chết", "phá chết",
    "bỏ chết", "hành hạ", "tra tấn", "hủy diệt", "tiêu diệt",
    "mẹ mày", "bố mày", "cha mày", "tổ tiên mày", "dòng họ mày",
    "nhà mày", "gia đình mày", "cả nhà mày", "cả dòng họ mày",
    "wtf", "stfu", "kys", "gtfo", "pos", "sob", "mf", "bs",
    "smh", "ffs", "omfg", "jfc", "damn", "hell", "crap", "shit",
    "bitch", "asshole", "moron", "idiot", "stupid", "dumb",
    "thằng ranh", "con ranh", "đồ ranh con", "thằng nhãi", "con nhãi",
    "đồ nhãi", "thằng tồi", "con tồi", "đồ tồi", "thằng xấu",
    "con xấu", "đồ xấu", "thằng ác", "con ác", "đồ ác",
    "đồ vô tích sự", "đồ vô tác dụng", "đồ thừa thãi", "đồ vô nghĩa",
    "đồ phí phạm", "đồ lãng phí", "đồ hại người", "đồ phá đám",
    "đồ quấy rầy", "đồ làm phiền", "đồ gây rối", "đồ làm loạn",
    "xấu xí", "ghê tởm", "kinh tởm", "thảm hại", "dị hợm",
    "biến thái", "quái vật", "đồ quái vật", "thằng quái vật",
    "con quái vật", "đồ dị dạng", "thằng dị dạng", "con dị dạng",
    "loz", "wtf", "omg", "fck", "fcking", "damn it",
    "go to hell", "shut up", "get lost", "piss off", "buzz off",
    "rác", "rác rưởi", "đồ rác", "cực rác", "rác nhất", "rác thối",
    "bãi rác", "như rác", "rác vãi", "rác vl", "rác vcl", "rác cc",
    "shit product", "garbage", "trash", "waste of money", "piece of shit",
    "crap quality", "fucking terrible", "damn awful", "bullshit",
    "tồi tệ", "tồi tàn", "tồi bét", "tồi nhất", "cực tồi", "tồi vãi",
    "tồi vl", "tồi vcl", "tồi cc", "tồi như", "tồi thế", "tồi quá",
    "tệ hại", "tệ nhất", "cực tệ", "tệ vãi", "tệ vl", "tệ vcl",
    "tệ cc", "tệ như", "tệ thế", "tệ quá", "tệ bạc", "tệ khủng",
    "kém chất lượng", "chất lượng tệ", "chất lượng rác", "chất lượng thảm",
    "chất lượng như", "chất lượng đéo", "chất lượng vl", "chất lượng cc",
    "lừa đảo", "lừa khách", "lừa tiền", "lừa gạt", "lừa bịp",
    "gian lận", "gian thương", "gian dối", "gian khổ", "gian manh",
    "lừa đảo khách hàng", "lừa đảo tiền", "lừa đảo người mua",
    "scam", "fraud", "fake", "counterfeit", "ripoff", "con",
    "cheat", "cheater", "cheating", "dishonest", "deceptive",
    "shop rác", "shop lừa đảo", "shop tệ", "shop đểu", "shop khốn",
    "shop như", "shop vl", "shop cc", "shop vcl", "shop đm",
    "seller rác", "seller lừa đảo", "seller tệ", "seller đểu",
    "bán hàng rác", "bán hàng lừa đảo", "bán hàng tệ", "bán hàng như",
    "chủ shop rác", "chủ shop lừa đảo", "chủ shop tệ", "chủ shop như",
    "admin rác", "admin lừa đảo", "admin tệ", "admin như",
    "đừng mua", "đừng tin", "đừng đặt", "đừng order", "đừng chọn",
    "không nên mua", "không nên tin", "không nên đặt", "không nên order",
    "tránh xa", "tránh mua", "tránh đặt", "tránh tin", "tránh shop",
    "don't buy", "don't trust", "don't order", "avoid", "stay away",
    "thua xa", "thua kém", "thua hết", "thua hoàn toàn", "thua đau",
    "kém xa", "kém hơn", "kém nhiều", "kém hoàn toàn", "kém thảm",
    "không bằng", "không đáng", "không xứng", "không tốt bằng",
    "worse than", "inferior", "substandard", "below average", "pathetic",
    "dịch vụ rác", "dịch vụ đéo",
    "dịch vụ vl", "dịch vụ cc", "dịch vụ vcl", "dịch vụ đm",
    "service rác", "service tệ", "service như", "service đéo",
    "terrible service", "awful service", "shit service", "crap service",
    "không xứng 1 sao", "thậm chí không có sao",
    "zero stars", "negative stars", "doesn't deserve any stars",
    "tẩy chay", "boycott", "blacklist", "đưa vào danh sách đen",
    "không nên ủng hộ", "không nên tin tưởng", "không nên giao dịch",
    "địt mẹ", "đm", "cc", "óc chó", "khốn nạn", "chó má", "cứt", "lồn",
    "đĩ", "đéo", "vl", "vcl", "đù má", "ngu", "đần", "đít",
    "cặc", "con mẹ", "thằng chó", "con đĩ", "mẹ kiếp", "đồ đểu", "súc vật",
    "bố mày", "mẹ mày", "con khốn", "thằng khốn", "đồ điên", "mặt lồn",
    "đụ má", "đụ mẹ", "con chó", "thằng điên", "mẹ nó", "đồ ngu", "mày chết",
    "cút đi", "đồ dơ", "mặt chó", "láo toét", "đồ hãm", "con mặt lồn",
    "thằng mặt cặc", "mẹ mày chết", "đồ rẻ rách", "thằng lồn", "con lồn",
    "đồ thối", "mày tiêu", "câm mồm", "đồ mất dạy", "thằng mất dạy",
    "con điên", "đồ khốn kiếp", "mặt đít", "đồ bẩn", "thằng hãm lồn",
    "con cave", "đồ rác rưởi", "mày cút", "đồ bã đậu", "thằng đĩ đực",
    "con đĩ mẹ", "mày ngu vl", "đồ con hoang", "thằng đéo ra gì",
    "mặt mẹ mày", "đồ tởm", "cút mẹ mày đi", "đồ đần độn", "mày đéo xứng",
    "thằng óc lợn", "con óc lợn", "đồ đê tiện", "mày chết đi", "đồ thất đức",
    "thằng mặt thớt", "con mẹ nó", "đồ lừa đảo", "mày điên à", "đồ bần tiện",
    "giả", "đểu", "dỏm", "cũ", "chẳng đẹp", "như rác", "như đồ chơi trẻ con", "vô dụng",
    "như nhựa tái chế", "tệ hại", "lừa đảo", "như đồ nhái", "phế phẩm",
    "hỏng", "chẳng ra gì", "quá tệ", "như đồ Trung Quốc", "như kẹo", "gây thất vọng"
];

const containsBannedWords = (text) => {
    return bannedWords.some(word => new RegExp(`\\b${word}\\b`, 'i').test(text));
};

// const checkToxicContent = async (text) => {
//     try {
//         const response = await axios.post('http://localhost:5000/predict', { sentence: text });
//         return response.data.prediction === 1;
//     } catch (error) {
//         console.error('Error calling Flask API:', error.message);
//     }
// };

exports.createFeedBack = async (req, res) => {
    const {
        maDonHang,
        maSanPham,
        maKhachHang,
        chatLuong,
        moTa,
        tenSanPham,
        loaiSanPham,
        hinhAnhSanPham,
    } = req.body;

    try {
        // Kiểm tra xem sản phẩm đã được đánh giá chưa
        const existingReview = await FeedBack.findOne({
            MaDonHang: maDonHang,
            'SanPhamDaDanhGia.MaSanPham': maSanPham
        });

        if (existingReview) {
            return res.status(400).json({
                message: "Sản phẩm này đã được đánh giá rồi!"
            });
        }

        // Kiểm tra toxic content
        let isToxic = false;
        if (moTa && moTa.trim()) {
            isToxic = containsBannedWords(moTa);
            // if (!isToxic) {
            //     isToxic = containsBannedWords(moTa);
            // }
        }

        // Xử lý upload hình ảnh
        let uploadedImages = [];
        if (req.files && req.files.length > 0) {
            const imageUploadPromises = req.files.map(file => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream({
                        folder: 'feedbacks',
                    }, (error, result) => {
                        if (error) {
                            return reject(error);
                        }
                        resolve(result);
                    });
                    stream.end(file.buffer);
                });
            });

            const imageUploadResults = await Promise.all(imageUploadPromises);
            uploadedImages = imageUploadResults.map(result => result.secure_url);
        }

        const newReview = new FeedBack({
            MaKhachHang: maKhachHang,
            MaDonHang: maDonHang,
            ChatLuong: parseInt(chatLuong),
            MoTa: moTa || '',
            HinhAnhSanPham: uploadedImages,
            SanPhamDaDanhGia: [{
                TenSanPham: tenSanPham,
                MaSanPham: maSanPham,
                LoaiSanPham: loaiSanPham,
                HinhAnh: hinhAnhSanPham
            }],
            isToxic: isToxic
        });

        await newReview.save();

        if (isToxic) {
            return res.status(200).json({
                message: "Đánh giá chứa từ ngữ không phù hợp, hệ thống sẽ tạm ẩn!"
            });
        } else {
            return res.status(200).json({
                message: "Cảm ơn bạn đã góp ý về sản phẩm!",
                review: newReview
            });
        }

    } catch (err) {
        return res.status(500).json({
            message: "Có lỗi xảy ra khi đánh giá sản phẩm."
        });
    }
};

exports.deleteFeedBack = async (req, res) => {
    const { maDanhGia } = req.params;
    try {
        const feedBack = await FeedBack.findOneAndDelete({
            MaDanhGia: maDanhGia,
        });
        if (!feedBack) {
            return res.status(404).json({ message: "Mã đánh giá không tồn tại." });
        }

        if (feedBack.HinhAnhSanPham && feedBack.HinhAnhSanPham.length > 0) {
            const deletePromises = feedBack.HinhAnhSanPham.map(async (imageUrl) => {
                try {
                    // Lấy public_id từ URL của ảnh trên Cloudinary
                    const publicId = imageUrl.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`feedbacks/${publicId}`);
                } catch (error) {
                    console.error("Lỗi khi xóa ảnh trên Cloudinary:", error);
                }
            });

            await Promise.all(deletePromises);
        }

        await FeedBack.findOneAndDelete({ MaDanhGia: maDanhGia });

        res.status(200).json({ message: "Mã đánh giá đã được xóa." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Kiểm tra trạng thái đánh giá của đơn hàng
exports.getOrderReviewStatus = async (req, res) => {
    const { maDonHang } = req.params;
    try {
        const donHang = await Order.findOne({ MaDonHang: maDonHang });
        if (!donHang) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
        }

        // Lấy tất cả đánh giá của đơn hàng
        const reviews = await FeedBack.find({ MaDonHang: maDonHang });
        const reviewedProductIds = reviews.map(review => review.SanPhamDaDanhGia[0]?.MaSanPham).filter(Boolean);

        // Phân loại sản phẩm
        const productsWithReviewStatus = donHang.SanPhamDaMua.map(product => {
            const isReviewed = reviewedProductIds.includes(product.MaSanPham);
            const review = isReviewed ? reviews.find(r => r.SanPhamDaDanhGia[0]?.MaSanPham === product.MaSanPham) : null;

            return {
                maSanPham: product.MaSanPham,
                tenSanPham: product.TenSanPham,
                hinhAnh: product.HinhAnh,
                loaiSanPham: product.LoaiSanPham,
                isReviewed: isReviewed,
                review: review ? {
                    chatLuong: review.ChatLuong,
                    moTa: review.MoTa,
                    ngayDang: review.NgayDang
                } : null
            };
        });

        const reviewedCount = reviewedProductIds.length;
        const totalProducts = donHang.SanPhamDaMua.length;
        const isFullyReviewed = reviewedCount === totalProducts;

        return res.status(200).json({
            maDonHang: maDonHang,
            totalProducts: totalProducts,
            reviewedCount: reviewedCount,
            isFullyReviewed: isFullyReviewed,
            products: productsWithReviewStatus,
            reviewProgress: `${reviewedCount}/${totalProducts}`
        });

    } catch (err) {
        console.error("Lỗi lấy trạng thái đánh giá:", err);
        return res.status(500).json({ message: "Có lỗi xảy ra." });
    }
};

exports.upload = upload.array('HinhAnhSanPham', 10);