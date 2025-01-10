// const axios = require("axios");
// const { StatusCode } = require("../../utils/constants.js");
// const { jsonGenerate } = require("../../utils/helpers.js");

// const getProvinces = async (req, res) => {
//   try {
//     const response = await axios.get("https://vapi.vnappmob.com/api/v2/province");
//     res.json(jsonGenerate(StatusCode.OK, "get Provinces", response.data));
//   } catch (error) {
//     console.error("Error fetching provinces:", error);
//     res
//       .status(error.response ? error.response.status : 500)
//       .send(error.response ? error.response.data : "Internal Server Error");
//   }
// };

// const getDistrict = async (req, res) => {
//   const { province_id } = req.query;
//   try {
//     const response = await axios.get(
//       `https://vapi.vnappmob.com/api/v2/province/district/${province_id}`
//     );
//     res.json(jsonGenerate(StatusCode.OK, "get District", response.data));
//   } catch (error) {
//     console.error("Error fetching districts:", error);
//     res
//       .status(error.response ? error.response.status : 500)
//       .send(error.response ? error.response.data : "Internal Server Error");
//   }
// };

// const getWard = async (req, res) => {
//   const { district_id } = req.query;
//   try {
//     const response = await axios.get(
//       `https://vapi.vnappmob.com/api/v2/province/ward/${district_id}`
//     );
//     res.json(jsonGenerate(StatusCode.OK, "get Ward", response.data));
//   } catch (error) {
//     console.error("Error fetching wards:", error);
//     res
//       .status(error.response ? error.response.status : 500)
//       .send(error.response ? error.response.data : "Internal Server Error");
//   }
// };

// module.exports = {
//   getProvinces,
//   getDistrict,
//   getWard,
// };
