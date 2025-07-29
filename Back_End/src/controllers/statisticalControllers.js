const Product = require("../models/productModels");
const Order = require("../models/orderModels");
const Feedback = require("../models/feedbackModels");
const Customer = require("../models/customersModels");
const Inventory = require("../models/inventoryModels");
const EntryFormInfo = require("../models/entryFormInfoModels");

exports.getAll = async (req, res) => {
  try {
    const product = await Product.find();
    const order = await Order.find();
    const customer = await Customer.find();
    const feedback = await Feedback.find();
    res.status(200).json({ product, order, customer, feedback });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRevenueByMonth = async (req, res) => {
  const year = req.query.year || new Date().getFullYear(); // Lấy năm từ query hoặc mặc định là năm hiện tại
  try {
    const revenueData = await Order.aggregate([
      {
        $match: {
          $or: [
            {
              TrangThaiDon: "Đã nhận được hàng"
            },
            { TrangThaiDon: "Đã giao thành công" },
            {
              TrangThaiThanhToan: "Đã thanh toán qua PayPal",
              TrangThaiDon: { $ne: "Đơn hàng đã hủy" },
            },
            {
              TrangThaiThanhToan: "Đã thanh toán qua VNPay",
              TrangThaiDon: { $ne: "Đơn hàng đã hủy" },
            }
          ],
          NgayDatHang: {
            $gte: new Date(`${year}-01-01`), // Ngày đầu tiên của năm
            $lte: new Date(`${year}-12-31`) // Ngày cuối cùng của năm
          }
        }
      },
      {
        $group: {
          _id: { $month: "$NgayDatHang" }, // Lấy tháng từ trường NgayDatHang
          totalRevenue: { $sum: "$TongDon" } // Tính tổng doanh thu
        }
      },
      {
        $sort: { _id: 1 } // Sắp xếp theo tháng
      }
    ]);

    // Tạo mảng doanh thu cho tất cả 12 tháng, nếu không có dữ liệu cho tháng nào thì gán doanh thu là 0
    const revenueMap = new Array(12).fill(0); // Mảng doanh thu mặc định cho 12 tháng

    // Cập nhật doanh thu cho các tháng có dữ liệu
    revenueData.forEach(item => {
      revenueMap[item._id - 1] = item.totalRevenue; // Lưu doanh thu vào vị trí đúng của tháng (0-indexed)
    });

    const response = {
      labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
      datasets: [
        {
          label: `Doanh thu năm ${year}`,
          data: revenueMap,
          backgroundColor: "rgba(255, 107, 107, 0.6)",
          borderColor: "rgba(255, 107, 107, 1)",
          borderWidth: 1
        }
      ]
    };
    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({ message: "Có lỗi xảy ra khi lấy thống kê doanh thu." });
  }
};

//Thống kê trạng thái đơn hàng
exports.getOrderStatus = async (req, res) => {
  try {
    const statistics = await Order.aggregate([
      {
        $group: {
          _id: "$TrangThaiDon",
          count: { $sum: 1 }
        }
      }
    ]);
    return res.status(200).json(statistics);
  } catch (err) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

//Thống kê doanh thu theo tháng
exports.getRevenueByDay = async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  const month = req.query.month || new Date().getMonth() + 1;
  try {
    const revenueData = await Order.aggregate([
      {
        $match: {
          $or: [
            { TrangThaiDon: "Đã nhận được hàng" },
            { TrangThaiDon: "Đã giao thành công" },
            {
              TrangThaiThanhToan: "Đã thanh toán qua PayPal",
              TrangThaiDon: { $ne: "Đơn hàng đã hủy" },
            },
            {
              TrangThaiThanhToan: "Đã thanh toán qua VNPay",
              TrangThaiDon: { $ne: "Đơn hàng đã hủy" },
            }
          ],
          NgayDatHang: {
            $gte: new Date(`${year}-${month}-01`),
            $lte: new Date(`${year}-${month}-31`)
          }
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: "$NgayDatHang" },
          totalRevenue: { $sum: "$TongDon" }
        }
      },
      {
        $sort: { _id: 1 } // Sắp xếp theo ngày
      }
    ]);

    // Tạo mảng doanh thu cho tất cả các ngày trong tháng (nếu không có dữ liệu cho ngày nào thì gán doanh thu là 0)
    const daysInMonth = new Date(year, month, 0).getDate(); // Số ngày trong tháng
    const revenueMap = new Array(daysInMonth).fill(0); // Mảng doanh thu mặc định cho tất cả các ngày trong tháng

    // Cập nhật doanh thu cho các ngày có dữ liệu
    revenueData.forEach(item => {
      revenueMap[item._id - 1] = item.totalRevenue; // Lưu doanh thu vào vị trí đúng của ngày (0-indexed)
    });
    const totalRevenueOfYear = revenueMap.reduce((sum, val) => sum + val, 0);

    const response = {
      labels: Array.from({ length: daysInMonth }, (_, i) => `Ngày ${i + 1}`),
      datasets: [
        {
          label: `Doanh thu tháng ${month}/${year}`,
          data: revenueMap,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1
        }
      ],
      tongDoanhThu: totalRevenueOfYear
    };
    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({ message: "Có lỗi xảy ra khi lấy thống kê doanh thu." });
  }
};

exports.getTopSellingProducts = async (req, res) => {
  try {
    const topProducts = await Product.find()
      .sort({ LuotBan: -1 }) // Sắp xếp giảm dần theo lượt bán
      .limit(3);

    return res.status(200).json(topProducts);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi khi lấy sản phẩm bán chạy", error });
  }
}

exports.getFeedBackProducts = async (req, res) => {
  try {
    const statistics = await Feedback.aggregate([
      {
        $facet: {
          byStar: [
            {
              $match: { isToxic: false }
            },
            {
              $group: {
                _id: "$ChatLuong",
                count: { $sum: 1 }
              }
            },
            {
              $sort: { _id: 1 }
            }
          ],
          byToxic: [
            {
              $match: { isToxic: true }
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 }
              }
            }
          ]
        }
      },
      {
        $project: {
          starCounts: {
            $arrayToObject: {
              $map: {
                input: "$byStar",
                as: "star",
                in: {
                  k: { $toString: "$$star._id" },
                  v: "$$star.count"
                }
              }
            }
          },
          toxicCount: { $arrayElemAt: ["$byToxic.count", 0] }
        }
      }
    ]);

    const result = {
      starCounts: {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
        ...statistics[0].starCounts
      },
      toxicCount: statistics[0].toxicCount || 0
    };

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getEnterWarehouse = async (req, res) => {
  const { maSanPham } = req.params;
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const month = parseInt(req.query.month) || new Date().getMonth() + 1;

  try {
    // Thống kê nhập hàng
    const importStats = await EntryFormInfo.aggregate([
      {
        $match: {
          MaSanPham: maSanPham,
          NgayNhap: {
            $gte: new Date(year, month - 1, 1),
            $lte: new Date(year, month, 0, 23, 59, 59, 999)
          },
        },
      },
      {
        $group: {
          _id: null,
          SoLuong: { $sum: '$SoLuong' },
        },
      },
    ]);

    // Thống kê xuất hàng (đơn hàng đã giao thành công)
    const exportStats = await Order.aggregate([
      {
        $match: {
          $or: [
            {
              TrangThaiDon: "Đã nhận được hàng"
            },
            { TrangThaiDon: "Đã giao thành công" },
            {
              TrangThaiThanhToan: "Đã thanh toán qua PayPal",
              TrangThaiDon: { $ne: "Đơn hàng đã hủy" },
            },
            {
              TrangThaiThanhToan: "Đã thanh toán qua VNPay",
              TrangThaiDon: { $ne: "Đơn hàng đã hủy" },
            }
          ],
          NgayDatHang: {
            $gte: new Date(year, month - 1, 1),
            $lte: new Date(year, month, 0, 23, 59, 59, 999)
          },
          'SanPhamDaMua.MaSanPham': maSanPham,
        },
      },
      {
        $unwind: '$SanPhamDaMua',
      },
      {
        $match: {
          'SanPhamDaMua.MaSanPham': maSanPham,
        },
      },
      {
        $group: {
          _id: null,
          SoLuong: { $sum: '$SanPhamDaMua.SoLuong' },
        },
      },
    ]);

    // Lấy tồn kho hiện tại từ Inventory
    const inventory = await Inventory.findOne({ MaSanPham: maSanPham });

    const result = {
      MaSanPham: maSanPham,
      SoLuongNhap: importStats[0]?.SoLuong || 0,
      SoLuongBan: exportStats[0]?.SoLuong || 0,
      SoLuongTon: inventory?.SoLuongTon || 0,
    };

    return res.status(200).json(result);
  } catch (err) {
    console.log(err.message)
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

//Tính lợi nhuận [Tổng doanh thu của đơn đó (tổng đơn) - (giá nhập gần nhất x số lượng sản phẩm đó bán ra trong đơn hàng đó)], sau khi tính tổng lợi nhuận của từng đơn xong cộng lại là ra lợi nhuận
exports.getMonthlyProfit = async (req, res) => {
  try {
    const { year, month } = req.query;

    // Xây dựng điều kiện lọc theo tháng/năm
    let matchCondition = {
      $and: [
        { TrangThaiDon: { $ne: 'Đơn hàng đã hủy' } },
        {
          $or: [
            { TrangThaiDon: "Đã nhận được hàng" },
            { TrangThaiDon: "Đã giao thành công" },
            {
              TrangThaiThanhToan: "Đã thanh toán qua PayPal",
              TrangThaiDon: { $ne: "Đơn hàng đã hủy" }
            },
            {
              TrangThaiThanhToan: "Đã thanh toán qua VNPay",
              TrangThaiDon: { $ne: "Đơn hàng đã hủy" }
            }
          ]
        }
      ]
    };

    if (year && month) {
      // Lọc theo tháng/năm cụ thể
      matchCondition.NgayDatHang = {
        $gte: new Date(year, month - 1, 1), // Ngày đầu tháng
        $lte: new Date(year, month, 0, 23, 59, 59, 999) // Ngày cuối tháng
      };
    } else if (year) {
      // Lọc theo năm
      matchCondition.NgayDatHang = {
        $gte: new Date(year, 0, 1),
        $lte: new Date(year, 11, 31, 23, 59, 59, 999)
      };
    } else {
      // Mặc định lấy tháng hiện tại
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();

      matchCondition.NgayDatHang = {
        $gte: new Date(currentYear, currentMonth, 1),
        $lte: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999)
      };
    }

    // Lấy tất cả đơn hàng trong khoảng thời gian
    const orders = await Order.find(matchCondition);

    let totalRevenue = 0; // Tổng doanh thu
    let totalCost = 0;    // Tổng giá vốn
    let totalProfit = 0;  // Tổng lợi nhuận
    let orderCount = 0;   // Số đơn hàng

    for (const order of orders) {
      let orderCost = 0;
      let orderRevenue = order.TongDon;

      // Tính giá vốn cho từng sản phẩm trong đơn hàng
      for (const sanPham of order.SanPhamDaMua) {
        const inventory = await Inventory.findOne({ MaSanPham: sanPham.MaSanPham });

        if (inventory && inventory.GiaNhapGanNhat) {
          orderCost += inventory.GiaNhapGanNhat * sanPham.SoLuong;
        }
      }

      totalRevenue += orderRevenue;
      totalCost += orderCost;
      orderCount++;
    }

    totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        thangNam: year && month ? `${month}/${year}` : (year ? `Năm ${year}` : 'Tháng hiện tại'),
        soDonHang: orderCount,
        tongDoanhThu: totalRevenue,
        tongGiaVon: totalCost,
        loiNhuan: totalProfit,
        tyLeLoiNhuan: `${profitMargin}%`
      }
    });

  } catch (error) {
    console.error('Lỗi tính lợi nhuận:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tính lợi nhuận'
    });
  }
};