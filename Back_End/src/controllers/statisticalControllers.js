const Product = require("../models/productModels");
const Order = require("../models/orderModels");
const Feedback = require("../models/feedbackModels");
const Customer = require("../models/customersModels");

exports.getAll = async (req, res) => {
  try {
    const product = await Product.find();
    const order = await Order.find();
    const customer = await Customer.find();
    const feedback = await Feedback.find();
    res.status(200).json({product, order, customer, feedback});
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