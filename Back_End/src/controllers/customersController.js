const Customer = require("../models/customersModels");
const DiscountCode = require("../models/discountCodeModels");
const Order = require("../models/orderModels");
const OTP = require("../models/otpModels");
const bcrypt = require("bcrypt");
const path = require("path");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

cloudinary.config({
  cloud_name: 'dwcajbc6f',
  api_key: '365476741985665',
  api_secret: '6gAWhCMdI8DfBAs-1ZDwwx1xM0Y'
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "c3gundamstore@gmail.com",
    pass: "varzwbjducnkzmaj",
  },
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();

    const orders = await Order.aggregate([
      {
        $group: {
          _id: "$MaKhachHang",
          TongDonHang: { $sum: 1 },
        },
      },
    ]);

    // Ánh xạ lại orders thành object để truy vấn nhanh hơn
    const orderMap = {};
    orders.forEach(order => {
      orderMap[order._id] = order.TongDonHang;
    });

    const customersWithOrders = customers.map(customer => {
      return {
        ...customer.toObject(),
        TongDonHang: orderMap[customer.MaKhachHang] || 0,
      };
    });

    res.status(200).json(customersWithOrders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      MaKhachHang: req.params.maKhachHang,
    });
    if (!customer) {
      return res.status(400).json({ message: "Khách hàng không tồn tại!" });
    }
    return res.status(200).json(customer);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.createCustomer = async (req, res) => {
  const { Email } = req.body;
  const customer = new Customer(req.body);
  try {
    const checkEmail = await Customer.findOne({ Email });
    if (checkEmail) {
      return res.status(400).json({ message: "Email này đã được đăng ký!" });
    }
    await customer.save();
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createInfoCustomer = async (req, res) => {
  const { maKhachHang } = req.params;
  const { DiaChi, DienThoai, TenNguoiNhan } = req.body;

  try {
    const customer = await Customer.findOneAndUpdate(
      { MaKhachHang: maKhachHang },
      {
        $push: { DanhSachDiaChi: { TenNguoiNhan, DienThoai, DiaChi } },
      },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: "Khách hàng không tồn tại." });
    }
    await customer.save();
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      MaKhachHang: req.params.maKhachHang,
    });

    if (!customer) {
      return res.status(404).json({ message: "Khách hàng không tồn tại" });
    }

    customer.TenKhachHang = req.body.TenKhachHang || customer.TenKhachHang;

    if (req.body.password) {
      customer.MatKhau = req.body.password;
    }

    if (req.file) {
      if (customer.Image) {
        const urlParts = customer.Image.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0]; // Bỏ phần mở rộng file

        const deleteResult = await cloudinary.uploader.destroy(`avatars/${publicId}`);
        if (deleteResult.result !== "ok") {
          console.log("⚠️ Không thể xóa ảnh cũ trên Cloudinary:", deleteResult);
        }
      }
      const imageUploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
          folder: 'avatars',
        },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          });
        stream.end(req.file.buffer); // Kết thúc stream với buffer
      });

      customer.Image = imageUploadResult.secure_url; // Lưu URL hình ảnh
    }

    const updatedCustomer = await customer.save();
    res.status(200).json(updatedCustomer);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  const { maKhachHang } = req.params;
  try {
    const customer = await Customer.findOneAndDelete({
      MaKhachHang: maKhachHang,
    });
    if (!customer) {
      return res.status(404).json({ message: "Khách hàng không tồn tại." });
    }
    res.status(200).json({ message: "Khách hàng đã được xóa" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const customer = await Customer.findOne({ Email: email });
    if (!customer) {
      return res.status(400).json({ message: "Email không tồn tại." });
    }
    const isMatch = await bcrypt.compare(password, customer.MatKhau);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không đúng." });
    }
    customer.TrangThai = 1;
    await customer.save();
    return res.status(200).json({
      message: "Đăng nhập thành công!",
      customer: {
        MaKhachHang: customer.MaKhachHang,
        TenKhachHang: customer.TenKhachHang,
        Email: customer.Email,
        TrangThai: customer.TrangThai,
        HinhAnh: customer.Image
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại." });
  }
};

exports.loginGoogle = async (req, res) => {
  const { maKhachHang } = req.query;
  try {
    const customer = await Customer.findOne({ MaKhachHang: maKhachHang });

    customer.TrangThai = 1;
    await customer.save();
    return res.status(200).json({
      message: "Đăng nhập với google thành công!",
      customer: {
        MaKhachHang: customer.MaKhachHang,
        TenKhachHang: customer.TenKhachHang,
        Email: customer.Email,
        TrangThai: customer.TrangThai,
        HinhAnh: customer.Image
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại." });
  }
};
exports.logout = async (req, res) => {
  const { maKhachHang } = req.body;

  try {
    const customer = await Customer.findOne({ MaKhachHang: maKhachHang });

    if (!customer) {
      return res.status(404).json({ message: "Khách hàng không tồn tại." });
    }

    customer.TrangThai = 0;
    await customer.save();

    return res.status(200).json({
      message: "Đăng xuất thành công!",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Có lỗi xảy ra, vui lòng thử lại.",
      error: error.message,
    });
  }
};

exports.deleteLocation = async (req, res) => {
  const { id } = req.params;
  const { maKhachHang } = req.params;
  try {
    const customer = await Customer.findOne({ MaKhachHang: maKhachHang });
    customer.DanhSachDiaChi = customer.DanhSachDiaChi.filter(
      (address) => address._id.toString() !== id
    );

    await customer.save();
    res.status(200).json({ message: "Địa chỉ đã được xóa" });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: "Có lỗi xảy ra, vui lòng thử lại.",
      error: error.message,
    });
  }
};

exports.saveDiscountCode = async (req, res) => {
  const { IdMaGiamGia, maKhachHang } = req.params;
  try {
    const discountCode = await DiscountCode.findOne({ IdMaGiamGia: IdMaGiamGia });

    const customerCheck = await Customer.findOne({ MaKhachHang: maKhachHang });
    const discountExists = customerCheck.DanhSachMaGiamGia.some(item => item.IdMaGiamGia === IdMaGiamGia);

    if (discountExists) {
      return res.status(400).json({ message: 'Mã giảm giá đã được lưu.' });
    }

    if (discountCode.SoLanLuuMa <= 0) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết lượt lưu.' });
    }

    const customer = await Customer.findOneAndUpdate(
      { MaKhachHang: maKhachHang },
      {
        $push: {
          DanhSachMaGiamGia: {
            IdMaGiamGia: discountCode.IdMaGiamGia,
          }
        },
      },
      { new: true }
    );
    discountCode.SoLanLuuMa--;
    await discountCode.save();
    await customer.save();
    res.status(200).json(customer);
  } catch (err) {
    console.log(err);
  }
}

exports.deleteDiscountCode = async (req, res) => {
  const { IdMaGiamGia, maKhachHang } = req.params;
  try {
    const customer = await Customer.findOne({ MaKhachHang: maKhachHang });
    customer.DanhSachMaGiamGia = customer.DanhSachMaGiamGia.filter(
      (discountCode) => discountCode.IdMaGiamGia !== IdMaGiamGia
    );

    await customer.save();
    res.status(200).json({ message: "Mã giảm giá đã được xóa" });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: "Có lỗi xảy ra, vui lòng thử lại.",
      error: error.message,
    });
  }
};

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Vui lòng cung cấp email" });

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Hết hạn sau 5 phút

  try {
    // Lưu OTP vào MongoDB
    await OTP.findOneAndUpdate(
      { email }, // Tìm document theo email
      { email, otp, createdAt: new Date(), expiresAt }, // Cập nhật hoặc tạo mới
      { upsert: true, new: true } // upsert: tạo mới nếu không tồn tại
    );

    // Gửi email chứa OTP
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Mã OTP của bạn",
      html: `
        <h3>Xác thực OTP</h3>
        <p>Mã OTP của bạn là: <strong>${otp}</strong></p>
        <p>Mã này có hiệu lực trong 5 phút.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "OTP đã được gửi tới email của bạn!" });
  } catch (error) {
    console.error("Lỗi khi gửi OTP:", error);
    res.status(500).json({ error: "Lỗi khi gửi OTP" });
  }
}

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ error: "Vui lòng cung cấp email và OTP" });

  try {
    const otpDoc = await OTP.findOne({ email });
    if (!otpDoc)
      return res.status(400).json({ error: "OTP không tồn tại hoặc đã hết hạn" });

    const currentTime = new Date();
    if (otpDoc.otp !== otp)
      return res.status(400).json({ error: "Mã OTP không đúng" });
    if (currentTime > otpDoc.expiresAt)
      return res.status(400).json({ error: "Mã OTP đã hết hạn" });

    // Xóa OTP sau khi xác thực thành công
    await OTP.deleteOne({ email });
    res.status(200).json({ message: "Xác thực OTP thành công!" });
  } catch (error) {
    console.error("Lỗi khi xác thực OTP:", error);
    res.status(500).json({ error: "Lỗi khi xác thực OTP" });
  }
}

exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const otp = await OTP.findOne({ email: email });
    const customer = await Customer.findOne({ Email: email });
    if (otp) {
      return res.status(400).json({ message: "Vui lòng xác thực OTP trước khi cập nhật." });
    }

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Vui lòng cung cấp email và mật khẩu mới." });
    }

    if (!customer) {
      return res.status(400).json({ message: "Email không tồn tại." });
    }

    customer.MatKhau = newPassword;
    await customer.save();

    res.status(200).json({ message: "Mật khẩu đã được cập nhật thành công!" });
  } catch (error) {
    return res.status(500).json(error.message);
  }
}

exports.upload = upload.single("Image");