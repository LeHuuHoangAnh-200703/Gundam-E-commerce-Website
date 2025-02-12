const Admin = require("../models/adminsModels");
const bcrypt = require("bcrypt");

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAdmin = async (req, res) => {
  try {
    const admin = await Admin.findOne({
      MaAdmin: req.params.maAdmin,
    });
    if (!admin) {
      res.status(400).json({ message: "Admin không tồn tại!" });
    }
    res.status(200).json(admin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAdmin = async (req, res) => {
  const { Email } = req.body;
  const admin = new Admin(req.body);
  try {
    const checkEmail = await Admin.findOne({ Email });
    if (checkEmail) {
      return res.status(400).json({ message: "Email này đã được đăng ký!" });
    }
    await admin.save();
    res.status(200).json(admin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findOne({
      MaAdmin: req.params.maAdmin,
    });
    if (!admin) {
      return res.status(404).json({ message: "Admin không tồn tại" });
    }

    admin.TenAdmin = req.body.TenAdmin || admin.TenAdmin;
    admin.Email = req.body.Email || admin.Email;
    if (req.body.MatKhau) {
      admin.MatKhau = req.body.MatKhau;
    }

    const updatedAdmin = await admin.save();
    res.status(200).json(updatedAdmin);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  const { maAdmin } = req.params;
  try {
    const admin = await Admin.findOneAndDelete({
      MaAdmin: maAdmin,
    });
    if (!admin) {
      return res.status(404).json({ message: "Admin không tồn tại." });
    }
    res.status(200).json({ message: "Admin đã được xóa" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ Email: email });
    if (!admin) {
      return res.status(400).json({ message: "Email không tồn tại." });
    }

    if (admin.TrangThai === "Đã vô hiệu hóa") {
      return res.status(400).json({ message: "Tài khoản này đã bị vô hiệu hóa."});
    }

    const isMatch = await bcrypt.compare(password, admin.MatKhau);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không đúng." });
    }
    admin.TrangThaiHoatDong = 1;
    await admin.save();
    return res.status(200).json({
      message: "Đăng nhập thành công!",
      admin: {
        MaAdmin: admin.MaAdmin,
        TenAdmin: admin.TenAdmin,
        Email: admin.Email,
        MatKhau: admin.MatKhau,
        TrangThaiHoatDong: admin.TrangThaiHoatDong
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại." });
  }
};

exports.logout = async (req, res) => {
  const { maAdmin } = req.body;

  try {
    const admin = await Admin.findOne({ MaAdmin: maAdmin });

    if (!admin) {
      return res.status(404).json({ message: "Admin không tồn tại." });
    }

    admin.TrangThaiHoatDong = 0;
    await admin.save();

    return res.status(200).json({
      message: "Đăng xuất thành công!",
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Có lỗi xảy ra, vui lòng thử lại.",
        error: error.message,
      });
  }
};

exports.updateStatus = async (req, res) => {
  const { TrangThai } = req.body;
  try {
    const admin = await Admin.findOne({ MaAdmin: req.params.maAdmin });
    if (!admin) {
      return res.status(404).json({ message: "Không tìm thấy admin với mã này." });
    }
    admin.TrangThai = TrangThai;
    await admin.save();
    res.status(200).json({message: "Cập nhật trạng thái thành công."});
  } catch (err) {
    res.status(500).json({ message: "Có lỗi xảy ra trong quá trình cập nhật trạng thái.", error: err.message });
  }
};
