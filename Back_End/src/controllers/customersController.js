const Customer = require('../models/customersModels');
const bcrypt = require("bcrypt");

exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find();
        res.status(200).json(customers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.getCustomer = async (req, res) => {
    try {
        const customer = await Customer.findOne({MaKhachHang: req.params.maKhachHang});
        if (!customer) {
            res.status(400).json({ message: "Khách hàng không tồn tại!"});
        }
        res.status(200).json(customer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.createCustomer = async (req, res) => {
    const { email } = req.body;
    const customer = new customersModels(req.body);
    try {
        const checkEmail = await customer.findOne({ email });
        if (checkEmail) {
            res.status(400).json({ message: "Email này đã được đăng ký!" });
        }
        await customer.save();
        res.status(200).json(customer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

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
    return res.status(200).json({ message: "Đăng nhập thành công!",
      customer: {
        MaKhachHang: customer.MaKhachHang,
        TenKhachHang: customer.TenKhachHang,
        Email: customer.Email,
      }, });
  } catch (error) {
    res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại." });
  }
};