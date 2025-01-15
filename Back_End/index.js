const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const paypal = require('@paypal/checkout-server-sdk');
const dotenv = require('dotenv');
const http = require("http");
const { Server } = require("socket.io");

dotenv.config()

const app = express();
const PORT = 3000;

// Tạo HTTP server từ Express
const server = http.createServer(app);

// Khởi tạo Socket.IO với HTTP server
const io = new Server(server, {
  cors: {
    origin: "*", // Cho phép tất cả nguồn (có thể điều chỉnh)
    methods: ["GET", "POST"],
  },
});
app.use(cors());
app.use(bodyParser.json());

mongoose
  .connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.log(err));

// Thiết lập PayPal client  
const environment = new paypal.core.SandboxEnvironment('AShJqcyTWgvzRR2HWrM29MpJ9MJLtIisWReNqNnzc38KtBx8we-iL0xhmJhXCK3h90BeLy6PWnRfasLv', 'EH97r0PPBN9vtj4j9-nNV5qos0GOiLcXiP-Z_SDEDXul2y6pOIUbQQ68krZGCYCy3vNR51OlWRt8SYA4');   
const client = new paypal.core.PayPalHttpClient(environment); 

const khachHangRoutes = require("./src/routes/customers");
const adminRoutes = require("./src/routes/admins");
const supplierRoutes = require("./src/routes/suppliers");
const discountCodeRoutes = require("./src/routes/discountCodes");
const notificationRoutes = require("./src/routes/Notifications");
const productRoutes = require("./src/routes/products");
const entryFormRoutes = require("./src/routes/entryForms");
const entryFormInfoRoutes = require("./src/routes/entryFormInfos");
const orderRoutes = require("./src/routes/orders");
const feeabackRoutes = require("./src/routes/feedbacks");
const inventoryRoutes = require("./src/routes/inventories");
const cartRoutes = require("./src/routes/carts");
const locationRoutes = require("./src/routes/locations");

app.use("/api/khachhang", khachHangRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/nhacungcap", supplierRoutes);
app.use("/api/magiamgia", discountCodeRoutes);
app.use("/api/thongbao", notificationRoutes);
app.use("/api/sanpham", productRoutes);
app.use("/api/phieunhap", entryFormRoutes);
app.use("/api/chitietphieunhap", entryFormInfoRoutes);
app.use("/api/donhang", orderRoutes);
app.use("/api/danhgia", feeabackRoutes);
app.use("/api/quanlykho", inventoryRoutes);
app.use("/api/giohang", cartRoutes);
app.use("/api/location", locationRoutes);

// Socket.IO lắng nghe kết nối từ client
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Lắng nghe sự kiện "message" từ client
  socket.on("message", (data) => {
    console.log(`Message received: ${data}`);

    // Gửi lại dữ liệu cho tất cả các client
    io.emit("message", data);
  });

  // Xử lý khi client ngắt kết nối
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Thêm middleware để sử dụng Socket.IO trong các route
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
