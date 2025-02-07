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
// Quản lý danh sách phòng chat
const rooms = new Map();

// Socket.IO lắng nghe kết nối từ client
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Xử lý khi client tham gia phòng chat
  socket.on("joinRoom", ({ idNguoiGui, idNguoiNhan }) => {
    const roomId = [idNguoiGui, idNguoiNhan].sort().join("-");
    socket.join(roomId);
    console.log(`Client ${socket.id} joined room: ${roomId}`);

    // Cập nhật danh sách phòng
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(socket.id);
  });

  // Xử lý khi client gửi tin nhắn
  socket.on("sendMessage", async (data) => {
    try {
      const { MaTinNhan, idNguoiGui, idNguoiNhan, NoiDung, NguoiGui, role } = data;
      const roomId = [idNguoiGui, idNguoiNhan].sort().join("-");

      // Kiểm tra xem người dùng đã tham gia phòng chưa
      if (!rooms.has(roomId) || !rooms.get(roomId).has(socket.id)) {
        console.error(`Client ${socket.id} chưa tham gia phòng ${roomId}`);
        return;
      }

      // Tìm hoặc tạo cuộc trò chuyện
      let chat = await MessageModel.findOne({ MaTinNhan });
      if (chat) {
        chat.NoiDung.push({ NguoiGui, TinNhan: NoiDung, role, ThoiGian: new Date() });
        await chat.save();
      } else {
        chat = new MessageModel({
          MaTinNhan,
          idNguoiGui,
          idNguoiNhan,
          NoiDung: [{ NguoiGui, TinNhan: NoiDung, role, ThoiGian: new Date() }],
        });
        await chat.save();
      }

      // Phát tin nhắn đến phòng chat
      io.to(roomId).emit("receiveMessage", {
        NguoiGui,
        TinNhan: NoiDung,
        role,
        ThoiGian: new Date(),
      });

    } catch (error) {
      console.error("Lỗi khi lưu tin nhắn:", error);
    }
  });

  // Xử lý khi client rời phòng chat
  socket.on("leaveRoom", ({ idNguoiGui, idNguoiNhan }) => {
    const roomId = [idNguoiGui, idNguoiNhan].sort().join("-");
    socket.leave(roomId);
    console.log(`Client ${socket.id} rời phòng: ${roomId}`);

    // Xóa socket khỏi danh sách phòng
    if (rooms.has(roomId)) {
      rooms.get(roomId).delete(socket.id);
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId);
      }
    }
  });

  // Xử lý ngắt kết nối
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    // Xóa client khỏi tất cả các phòng
    for (const [roomId, clients] of rooms) {
      clients.delete(socket.id);
      if (clients.size === 0) {
        rooms.delete(roomId);
      }
    }
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