const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
    MaKhachHang: String,
    TenKhachHang: String,
    Email: String,
    MatKhau: String,
});

module.exports = mongoose.model("Customer", customerSchema);