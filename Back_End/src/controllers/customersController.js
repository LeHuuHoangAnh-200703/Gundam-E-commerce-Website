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
    const customer = new Customer(req.body);
    try {
        const checkEmail = await Customer.findOne({ email });
        if (checkEmail) {
            res.status(400).json({ message: "Email này đã được đăng ký!" });
        }
        await customer.save();
        res.status(200).json(customer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ MaKhachHang: req.params.maKhachHang });
    if (!customer) {
      return res.status(404).json({ message: "Khách hàng không tồn tại" });
    }

    customer.TenKhachHang = req.body.TenKhachHang || customer.TenKhachHang;
    customer.Email = req.body.Email || customer.Email;

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

    const customer = await Customer.findOneAndDelete({ MaKhachHang: maKhachHang });
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