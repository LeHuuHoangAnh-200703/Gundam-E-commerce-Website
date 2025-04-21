const Province = require("../models/provinceModels");

const getProvinces = async (req, res) => {
  try {
    const provinces = await Province.find({}, "Id Name");
    res.status(200).json(provinces);
  } catch (error) {
    console.error("Error fetching provinces:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getDistrict = async (req, res) => {
  const { province_id } = req.query;
  try {
    const province = await Province.findOne(
      { Id: province_id },
      "Districts" // Chỉ lấy trường Districts
    );
    if (!province) {
      return res.status(404).json({ error: "Province not found" });
    }
    res.status(200).json(province.Districts);
  } catch (error) {
    console.error("Error fetching districts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getWard = async (req, res) => {
  const { district_id } = req.query;
  try {
    const province = await Province.findOne(
      { "Districts.Id": district_id },
      { "Districts.$": 1 } // Lấy quận/huyện khớp với district_id
    );
    if (!province || !province.Districts || province.Districts.length === 0) {
      return res.status(404).json({ error: "District not found" });
    }
    res.status(200).json(province.Districts[0].Wards);
  } catch (error) {
    console.error("Error fetching wards:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getProvinces,
  getDistrict,
  getWard,
};