const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const paypal = require("@paypal/checkout-server-sdk");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

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
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
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
const messageRoutes = require("./src/routes/messages");
const statisticalRoutes = require("./src/routes/statisticals");

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
app.use("/api/tinnhan", messageRoutes);
app.use("/api/thongke", statisticalRoutes);

const MessageModel = require("./src/models/messageModels");
// Socket.IO lắng nghe kết nối từ client
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Xử lý khi client gửi tin nhắn
  socket.on("sendMessage", async (data) => {
    try {
      // Tìm bản ghi chat theo MaTinNhan
      const chat = await MessageModel.findOne({
        MaTinNhan: data.MaTinNhan
      });
      // Nếu đã có cuộc trò chuyện, thêm tin nhắn vào mảng
      if (chat) {
        chat.NoiDung.push({
          NguoiGui: data.NguoiGui,
          TinNhan: data.NoiDung,
          role: data.role,
          ThoiGian: new Date(),
        });

        await chat.save(); // Lưu thay đổi
      } else {
        // Nếu chưa có, tạo bản ghi mới
        const newChat = new MessageModel({
          MaTinNhan: data.MaTinNhan,
          idNguoiGui: data.idNguoiGui,
          idNguoiNhan: data.idNguoiNhan,
          NoiDung: [
            {
              NguoiGui: data.NguoiGui,
              TinNhan: data.NoiDung,
              role: data.role,
              ThoiGian: new Date(),
            },
          ],
        });

        await newChat.save(); // Lưu bản ghi mới
      }
      // Phát tin nhắn cho các client trong room
      io.to(data.roomId).emit("receiveMessage", data);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  // Xử lý khi client tham gia phòng chat
  socket.on("joinRoom", ({ idNguoiGui, idNguoiNhan }) => {
    const roomId = [idNguoiGui, idNguoiNhan].sort().join("-");
    socket.join(roomId);
    console.log(`Client ${socket.id} joined room: ${roomId}`);
  });

  // Xử lý ngắt kết nối
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Thêm middleware để sử dụng Socket.IO trong các route
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Chạy server
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});