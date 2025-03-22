const Customer = require("../models/customersModels");
const DiscountCode = require("../models/discountCodeModels");
const Order = require("../models/orderModels");
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
  const { SoDienThoai } = req.body;
  const customer = new Customer(req.body);
  try {
    const checkPhone = await Customer.findOne({ SoDienThoai });
    if (checkPhone) {
      return res.status(400).json({ message: "Số điện thoại này đã được đăng ký!" });
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
      customer.MatKhau = await bcrypt.hash(req.body.password, 10);
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
  const { phone, password } = req.body;
  try {
    const customer = await Customer.findOne({ SoDienThoai: phone });
    if (!customer) {
      return res.status(400).json({ message: "Số điện thoại không tồn tại." });
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
        SoDienThoai: customer.SoDienThoai,
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
            TenMaGiamGia: discountCode.TenMaGiamGia,
            GiaApDung: discountCode.GiaApDung,
            GiamTien: discountCode.GiamTien,
            GiamPhanTram: discountCode.GiamPhanTram,
            SoLanSuDung: discountCode.SoLanSuDung,
            NgayHetHan: discountCode.NgayHetHan,
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

exports.upload = upload.single("Image");