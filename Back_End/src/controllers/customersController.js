const Customer = require("../models/customersModels");
const bcrypt = require("bcrypt");
const path = require("path");
const multer = require("multer");

const storagePath = path.join(
  __dirname,
  "../../../C3 Gundam Website/src/assets/img"
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storagePath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

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
  const customer = new Customer(req.body);
  try {
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
    customer.Email = req.body.Email || customer.Email;

    if (req.body.password) {
      customer.MatKhau = req.body.password;
    }

    if (req.file) {
      customer.Image = req.file.filename;  
    } else {
      customer.Image = customer.Image; 
    }

    const updatedCustomer = await customer.save();
    res.status(200).json(updatedCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  const { maKhachHang } = req.params;
  try {
    // const existingOrder = await TheoDoiMuonSach.findOne({ MaDocGia: maDocGia });
    // if (existingOrder) {
    //   return res.status(400).json({ message: "Không thể xóa đọc giả vì họ đang có đơn mượn sách." });
    // }

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
    return res.status(200).json({
      message: "Đăng nhập thành công!",
      customer: {
        MaKhachHang: customer.MaKhachHang,
        TenKhachHang: customer.TenKhachHang,
        Email: customer.Email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại." });
  }
};

exports.upload = upload.single('Image');