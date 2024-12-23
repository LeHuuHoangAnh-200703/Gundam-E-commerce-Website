const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require("body-parser");

const app  = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

mongoose
  .connect(process.env.DATABSE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.log(err));
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
})
