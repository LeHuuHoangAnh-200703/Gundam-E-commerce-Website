const Customer = require("../models/customersModels");
const DiscountCode = require("../models/discountCodeModels");
const bcrypt = require("bcrypt");
const path = require("path");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dwcajbc6f',
  api_key: '365476741985665',
  api_secret: '6gAWhCMdI8DfBAs-1ZDwwx1xM0Y'
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
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

    // Cập nhật thông tin khách hàng
    customer.TenKhachHang = req.body.TenKhachHang || customer.TenKhachHang;
    customer.Email = req.body.Email || customer.Email;

    if (req.body.password) {
      customer.MatKhau = await bcrypt.hash(req.body.password, 10); // Mã hóa mật khẩu mới
    }

    // Upload hình ảnh nếu có
    if (req.file) {
      const imageUploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream((error, result) => {
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
  console.log("Email:", email);
  console.log("Password:", password);
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
            TenMaGiamGia: discountCode.TenMaGiamGia,
            GiaApDung: discountCode.GiaApDung,
            GiamTien: discountCode.GiamTien,
            GiamPhanTram: discountCode.GiamPhanTram,
            SoLanSuDung: discountCode.SoLanSuDung,
            NgayHetHan: discountCode.NgayHetHan,
            MaGiamGia: discountCode.MaGiamGia,
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
  console.log(IdMaGiamGia, maKhachHang)
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

exports.upload = upload.single("Image");