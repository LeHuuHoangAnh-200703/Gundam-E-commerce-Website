const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

mongoose
  .connect("mongodb://localhost:27017/C3_GunDam_Store", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.log(err));

const khachHangRoutes = require("./src/routes/customers");

app.use("/api/khachhang", khachHangRoutes);
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
