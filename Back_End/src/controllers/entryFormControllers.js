const EntryForm = require("../models/entryFormModels");
const EntryFormInfo = require("../models/entryFormInfoModels");

exports.getAllEntryForms = async (req, res) => {
  try {
    const entryForms = await EntryForm.find();
    res.status(200).json(entryForms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEntryForm = async (req, res) => {
  try {
    const entryForm = await EntryForm.findOne({
      MaPhieuNhap: req.params.maPN,
    });
    if (!entryForm) {
      return res.status(400).json({ message: "Phiếu nhập không tồn tại!" });
    }
    return res.status(200).json(entryForm);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.createEntryForm = async (req, res) => {
  const entryForm = new EntryForm(req.body);
  try {
    await entryForm.save();
    res.status(200).json(entryForm);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatedEntryForm = async (req, res) => {
  try {
    const entryForm = await EntryForm.findOne({
      MaPhieuNhap: req.params.maPN,
    });
    if (!entryForm) {
      return res.status(404).json({ message: "Phiếu nhập không tồn tại" });
    }

    entryForm.MaNhaCungCap = req.body.MaNhaCungCap || entryForm.MaNhaCungCap;
    entryForm.TenNhaCungCap = req.body.TenNhaCungCap || entryForm.TenNhaCungCap;
    entryForm.MaNhanVien = req.body.MaNhanVien || entryForm.MaNhanVien;
    entryForm.TenNhanVien = req.body.TenNhanVien || entryForm.TenNhanVien;

    const updatedEntryForm = await entryForm.save();
    res.status(200).json(updatedEntryForm);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteEntryForm = async (req, res) => {
  const { maPN } = req.params;
  try {
    const entryForm = await EntryForm.findOneAndDelete({
      MaPhieuNhap: maPN,
    });
    if (!entryForm) {
      return res.status(404).json({ message: "Phiếu nhập không tồn tại." });
    }
    res.status(200).json({ message: "Phiếu nhập đã được xóa." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.checkQuantity = async (req, res) => {
  const { maPN } = req.params;
  try {
    const entryForminfos = await EntryFormInfo.find({ MaPhieuNhap: maPN });
    if (entryForminfos.length > 0) {
      return res.status(200).json({ results: true });
    } else {
      return res.status(200).json({ results: false });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getEntryFormByDayMonth = async (req, res) => {
    try {
        const year = req.query.year ? parseInt(req.query.year) : null;
        const month = req.query.month ? parseInt(req.query.month) : null;
        const day = req.query.day ? parseInt(req.query.day) : null;

        // Xây dựng pipeline aggregation
        let pipeline = [];

        if (month && !day && !year) {
            // Lọc chỉ theo tháng (bất kỳ ngày/năm nào)
            pipeline.push({
                $match: {
                    $expr: {
                        $eq: [{ $month: "$NgayNhap" }, month]
                    }
                }
            });
        } else if (day && month && !year) {
            // Lọc chỉ theo tháng và ngày (bất kỳ năm nào)
            pipeline.push({
                $match: {
                    $expr: {
                        $and: [
                            { $eq: [{ $month: "$NgayNhap" }, month] },
                            { $eq: [{ $dayOfMonth: "$NgayNhap" }, day] }
                        ]
                    }
                }
            });
        } else if (day && !month && !year) {
            // Lọc chỉ theo ngày (bất kỳ tháng/năm nào)
            pipeline.push({
                $match: {
                    $expr: {
                        $eq: [{ $dayOfMonth: "$NgayNhap" }, day]
                    }
                }
            });
        } else {
            // Xây dựng điều kiện lọc cho các trường hợp khác
            let matchCondition = {};

            if (day && month && year) {
                // Lọc theo ngày-tháng-năm
                matchCondition.NgayNhap = {
                    $gte: new Date(year, month - 1, day),
                    $lte: new Date(year, month - 1, day, 23, 59, 59, 999)
                };
            } else if (month && year) {
                // Lọc theo tháng-năm
                matchCondition.NgayNhap = {
                    $gte: new Date(year, month - 1, 1),
                    $lte: new Date(year, month, 0, 23, 59, 59, 999)
                };
            } else if (year) {
                // Lọc theo năm
                matchCondition.NgayNhap = {
                    $gte: new Date(year, 0, 1),
                    $lte: new Date(year, 11, 31, 23, 59, 59, 999)
                };
            } else {
                return res.status(400).json({ message: "At least one of year, month, or day is required" });
            }

            pipeline.push({ $match: matchCondition });
        }

        // Thêm stage sắp xếp theo NgayNhap giảm dần
        pipeline.push({ $sort: { NgayNhap: -1 } });

        // Thực thi pipeline
        const results = await EntryForm.aggregate(pipeline);

        return res.status(200).json(results);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};