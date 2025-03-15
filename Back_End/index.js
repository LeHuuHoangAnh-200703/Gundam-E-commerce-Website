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
const server = http.createServer(app);

// Khởi tạo Socket.IO
const socketIO = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
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
app.use("/api/thongke", statisticalRoutes);

// Middleware xác thực Socket.IO
socketIO.use((socket, next) => {
  const { userId, userName } = socket.handshake.auth;
  if (!userId || !userName) {
    return next(new Error("Authentication error"));
  }
  socket.userId = userId;
  socket.userName = userName;
  next();
});

// Xử lý sự kiện Socket.IO
socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.userName} (ID: ${socket.userId}) vừa kết nối!`);

  socket.on("joinRoom", async ({ roomCode, senderId, receiverId, senderName, receiverName, senderAvatar }) => {
    socket.join(roomCode);
    console.log(`${socket.userName} đã tham gia phòng: ${roomCode}`);

    try {
      const ChatRoom = require("./src/models/messageModels");
      let chatRoom = await ChatRoom.findOne({ roomCode });

      if (!chatRoom) {
        chatRoom = new ChatRoom({
          roomCode,
          senderId,
          receiverId,
          senderName,
          receiverName,
          senderAvatar: senderAvatar || "",
          receiverAvatar: "",
          messages: [],
          senderMessagesNotRead: [],
          receiverMessagesNotRead: [],
        });
        await chatRoom.save();
      }

      socket.emit("roomJoined", chatRoom);
    } catch (error) {
      console.error("Lỗi khi tham gia/tạo phòng:", error);
    }
  });

  socket.on("sendMessage", async (data) => {
    const { roomCode, senderId, senderName, text } = data;
    const message = {
      text,
      senderId,
      senderN: senderName,
      time: new Date(),
    };

    try {
      const ChatRoom = require("./src/models/messageModels");
      let chatRoom = await ChatRoom.findOne({ roomCode });

      if (chatRoom) {
        chatRoom.messages.push(message);
        if (chatRoom.senderId === senderId) {
          chatRoom.receiverMessagesNotRead.push(message);
        } else {
          chatRoom.senderMessagesNotRead.push(message);
        }
        await chatRoom.save();

        // Phát tin nhắn real-time đến phòng
        socketIO.to(roomCode).emit("receiveMessage", message);

        // Phát cập nhật danh sách chatRooms cho tất cả client
        const updatedChatRooms = await ChatRoom.find();
        socketIO.emit("chatRoomsUpdated", updatedChatRooms);
      } else {
        console.log("Phòng chat không tồn tại");
      }
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
    }
  });

  socket.on("markAsRead", async ({ roomCode, userId }) => {
    try {
      const ChatRoom = require("./src/models/messageModels");
      let chatRoom = await ChatRoom.findOne({ roomCode });

      if (chatRoom) {
        if (chatRoom.senderId === userId) {
          chatRoom.senderMessagesNotRead = [];
        } else {
          chatRoom.receiverMessagesNotRead = [];
        }
        await chatRoom.save();

        socketIO.to(roomCode).emit("roomUpdated", chatRoom);
        const updatedChatRooms = await ChatRoom.find();
        socketIO.emit("chatRoomsUpdated", updatedChatRooms);
      }
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔥: ${socket.userName} (ID: ${socket.userId}) đã ngắt kết nối`);
  });
});

// API lấy danh sách phòng chat
app.get("/api/chat", async (req, res) => {
  try {
    const ChatRoom = require("./src/models/messageModels");
    const chatRooms = await ChatRoom.find();
    res.json(chatRooms);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách phòng chat" });
  }
});

// Chạy server
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});