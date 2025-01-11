const axios = require("axios");

const getProvinces = async (req, res) => {
  try {
    const response = await axios.get("https://vapi.vnappmob.com/api/v2/province");
    // res.json(jsonGenerate(StatusCode.OK, "get Provinces", response.data));
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(error.response ? error.response.status : 500)
      .send(error.response ? error.response.data : "Internal Server Error");
  }
};

const getDistrict = async (req, res) => {
  const { province_id } = req.query;
  try {
    const response = await axios.get(
      `https://vapi.vnappmob.com/api/v2/province/district/${province_id}`
    );
    // res.json(jsonGenerate(StatusCode.OK, "get District", response.data));
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(error.response ? error.response.status : 500)
      .send(error.response ? error.response.data : "Internal Server Error");
  }
};

const getWard = async (req, res) => {
  const { district_id } = req.query;
  try {
    const response = await axios.get(
      `https://vapi.vnappmob.com/api/v2/province/ward/${district_id}`
    );
    // res.json(jsonGenerate(StatusCode.OK, "get Ward", response.data));
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(error.response ? error.response.status : 500)
      .send(error.response ? error.response.data : "Internal Server Error");
  }
};

module.exports = {
  getProvinces,
  getDistrict,
  getWard,
};
