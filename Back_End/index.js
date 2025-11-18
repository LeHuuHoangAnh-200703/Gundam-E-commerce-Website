const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const paypal = require("@paypal/checkout-server-sdk");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const path = require("path");
const fs = require('fs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

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
const communityPostRoutes = require("./src/routes/communityPosts");
const vnpayRoutes = require("./src/routes/vnpay");
const chatBotRoutes = require("./src/routes/chatbot");
const productTypeRoutes = require("./src/routes/productType");
const barcodeRoutes = require("./src/routes/barcode");
const Customer = require('./src/models/customersModels');
const OTP = require("./src/models/otpModels");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// // Khởi tạo Socket.IO
// const socketIO = new Server(server, {
//   cors: {
//     // Thêm domain Netlify của bạn vào đây
//     origin: [
//         // "http://localhost:5173", 
//         "https://c3gundam-ecommercewebsite.netlify.app"
//     ],
//     methods: ["GET", "POST"],
//     credentials: true
//   },
// });

cloudinary.config({
    cloud_name: 'dwcajbc6f',
    api_key: '365476741985665',
    api_secret: '6gAWhCMdI8DfBAs-1ZDwwx1xM0Y'
});

app.use(cors({
    origin: [
        // "http://localhost:5173", 
        "https://c3gundam-ecommercewebsite.netlify.app"
    ],
    credentials: true
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport config
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Cấu hình multer để lưu file tạm thời
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
});

// Tạo thư mục uploads nếu chưa tồn tại
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Endpoint upload hình ảnh lên Cloudinary
app.post("/api/upload", upload.array("images"), async (req, res) => {
  try {
    const uploadPromises = req.files.map((file) =>
      cloudinary.uploader.upload(file.path, {
        folder: "chatBox",
      })
    );
    const results = await Promise.all(uploadPromises);
    const imageUrls = results.map((result) => result.secure_url);

    // Xóa file tạm sau khi upload
    req.files.forEach((file) => fs.unlinkSync(file.path));

    res.json({ imageUrls });
  } catch (error) {
    console.error("Lỗi khi upload lên Cloudinary:", error);
    res.status(500).json({ error: "Lỗi khi upload hình ảnh" });
  }
});

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
app.use("/api/baidang", communityPostRoutes);
app.use("/api/thanhtoanvnp", vnpayRoutes);
app.use("/api/chatbot", chatBotRoutes);
app.use("/api/loaisanpham", productTypeRoutes);
app.use("/api/barcode", barcodeRoutes);

// Xóa OTP hết hạn định kỳ (mỗi 5 phút)
setInterval(async () => {
  try {
    const currentTime = new Date();
    await OTP.deleteMany({ expiresAt: { $lt: currentTime } });
  } catch (error) {
    console.error("Lỗi khi xóa OTP hết hạn:", error);
  }
}, 5 * 60 * 1000);

// // Middleware xác thực Socket.IO
// socketIO.use((socket, next) => {
//   const { userId, userName } = socket.handshake.auth;
//   if (!userId || !userName) {
//     return next(new Error("Authentication error"));
//   }
//   socket.userId = userId;
//   socket.userName = userName;
//   next();
// });

// // Xử lý sự kiện Socket.IO
// socketIO.on("connection", (socket) => {
//   console.log(`⚡: ${socket.userName} (ID: ${socket.userId}) vừa kết nối!`);

//   socket.on("getChatRooms", async () => {
//     try {
//       const ChatRoom = require("./src/models/messageModels");
//       const User = require("./src/models/customersModels");
//       const chatRooms = await ChatRoom.find();
//       const enrichedChatRooms = await Promise.all(
//         chatRooms.map(async (room) => {
//           const sender = await User.findOne({ MaKhachHang: room.senderId });
//           return {
//             ...room.toObject(),
//             senderName: sender ? sender.TenKhachHang : "Unknown",
//             senderAvatar: sender ? sender.Avatar || "" : "",
//           };
//         })
//       );
//       socket.emit("chatRoomsUpdated", enrichedChatRooms);
//     } catch (error) {
//       console.error("Lỗi khi lấy danh sách phòng chat:", error);
//     }
//   });

//   socket.on("joinRoom", async ({ roomCode, senderId, receiverId, receiverName }) => {
//     socket.join(roomCode);
//     console.log(`${socket.userName} đã tham gia phòng: ${roomCode}`);

//     try {
//       const ChatRoom = require("./src/models/messageModels");
//       const User = require("./src/models/customersModels");
//       let chatRoom = await ChatRoom.findOne({ roomCode });

//       if (!chatRoom) {
//         chatRoom = new ChatRoom({
//           roomCode,
//           senderId,
//           receiverId,
//           receiverName,
//           messages: [],
//           senderMessagesNotRead: [],
//           receiverMessagesNotRead: [],
//         });
//         await chatRoom.save();
//       }
//       // Lấy thông tin khách hàng từ bảng User
//       const sender = await User.findOne({ MaKhachHang: senderId });
//       const chatRoomWithUserInfo = {
//         ...chatRoom.toObject(),
//         senderName: sender ? sender.TenKhachHang : "",
//         senderAvatar: sender ? sender.Image || "" : "",
//       };

//       socket.emit("roomJoined", chatRoomWithUserInfo);
//     } catch (error) {
//       console.error("Lỗi khi tham gia/tạo phòng:", error);
//     }
//   });

//   socket.on("sendMessage", async (data) => {
//     const { roomCode, senderId, senderName, text, images } = data;
//     const message = {
//       text: text || "",
//       senderId,
//       senderN: senderName,
//       time: new Date(),
//       images: images || [],
//     };

//     try {
//       const ChatRoom = require("./src/models/messageModels");
//       let chatRoom = await ChatRoom.findOne({ roomCode });

//       if (chatRoom) {
//         chatRoom.messages.push(message);
//         if (chatRoom.senderId === senderId) {
//           chatRoom.receiverMessagesNotRead.push(message);
//         } else {
//           chatRoom.senderMessagesNotRead.push(message);
//         }
//         await chatRoom.save();

//         // Phát tin nhắn real-time đến phòng
//         socketIO.to(roomCode).emit("receiveMessage", message);

//         // Phát cập nhật danh sách chatRooms cho tất cả client
//         const updatedChatRooms = await ChatRoom.find();
//         // Thêm thông tin khách hàng động vào danh sách phòng chat
//         const User = require("./src/models/customersModels");
//         const enrichedChatRooms = await Promise.all(
//           updatedChatRooms.map(async (room) => {
//             const sender = await User.findOne({ MaKhachHang: room.senderId });
//             return {
//               ...room.toObject(),
//               senderName: sender ? sender.TenKhachHang : "",
//               senderAvatar: sender ? sender.Image || "" : "",
//             };
//           })
//         );
//         socketIO.emit("chatRoomsUpdated", enrichedChatRooms);
//       } else {
//         console.log("Phòng chat không tồn tại");
//       }
//     } catch (error) {
//       console.error("Lỗi khi gửi tin nhắn:", error);
//     }
//   });

//   socket.on("markAsRead", async ({ roomCode, userId }) => {
//     try {
//       const ChatRoom = require("./src/models/messageModels");
//       let chatRoom = await ChatRoom.findOne({ roomCode });

//       if (chatRoom) {
//         if (chatRoom.senderId === userId) {
//           chatRoom.senderMessagesNotRead = [];
//         } else {
//           chatRoom.receiverMessagesNotRead = [];
//         }
//         await chatRoom.save();

//         const User = require("./src/models/customersModels");
//         const sender = await User.findOne({ MaKhachHang: chatRoom.senderId });
//         const chatRoomWithUserInfo = {
//           ...chatRoom.toObject(),
//           senderName: sender ? sender.TenKhachHang : "",
//           senderAvatar: sender ? sender.Image || "" : "",
//         };

//         socketIO.to(roomCode).emit("roomUpdated", chatRoomWithUserInfo);
//         const updatedChatRooms = await ChatRoom.find();
//         const enrichedChatRooms = await Promise.all(
//           updatedChatRooms.map(async (room) => {
//             const sender = await User.findOne({ MaKhachHang: room.senderId });
//             return {
//               ...room.toObject(),
//               senderName: sender ? sender.TenKhachHang : "",
//               senderAvatar: sender ? sender.Image || "" : "",
//             };
//           })
//         );
//         socketIO.emit("chatRoomsUpdated", enrichedChatRooms);
//       }
//     } catch (error) {
//       console.error("Lỗi khi đánh dấu đã đọc:", error);
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log(`🔥: ${socket.userName} (ID: ${socket.userId}) đã ngắt kết nối`);
//   });
// });

// // API lấy danh sách phòng chat
// app.get("/api/chat", async (req, res) => {
//   try {
//     const ChatRoom = require("./src/models/messageModels");
//     const User = require("./src/models/customersModels");
//     const chatRooms = await ChatRoom.find();
//     const enrichedChatRooms = await Promise.all(
//       chatRooms.map(async (room) => {
//         const sender = await User.findOne({ MaKhachHang: room.senderId });
//         return {
//           ...room.toObject(),
//           senderName: sender ? sender.TenKhachHang : "",
//           senderAvatar: sender ? sender.Image || "" : "",
//         };
//       })
//     );
//     res.json(enrichedChatRooms);
//   } catch (error) {
//     res.status(500).json({ error: "Lỗi khi lấy danh sách phòng chat" });
//   }
// });

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Customer.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Kiểm tra email đã tồn tại trong hệ thống chưa
    let user = await Customer.findOne({ Email: profile.emails[0].value });
    
    if (user) {
      // Nếu email đã tồn tại, cập nhật thông tin Google (nếu cần) và trạng thái
      if (!user.provider) {
        // Nếu tài khoản không có provider (tài khoản thông thường), thêm thông tin Google
        user.provider = 'google';
        user.providerId = profile.id;
      }
      user.TrangThai = 1; // Đánh dấu đã đăng nhập
      user.TenKhachHang = profile.displayName || user.TenKhachHang;
      await user.save();
    } else {
      // Nếu email chưa tồn tại, tạo tài khoản mới
      const count = await Customer.countDocuments();
      user = new Customer({
        provider: 'google',
        providerId: profile.id,
        Email: profile.emails[0].value,
        TenKhachHang: profile.displayName,
        NgayTao: new Date(),
        TrangThai: 1, // Đánh dấu đã đăng nhập
      });
      await user.save();
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: 'https://c3gundam-ecommercewebsite.netlify.app/login?googleSuccess=false' }),
  (req, res) => {
    if (req.user && req.user.MaKhachHang) {
      res.redirect(`https://c3gundam-ecommercewebsite.netlify.app/login/?maKhachHang=${req.user.MaKhachHang}&googleSuccess=true`);
    } else {
      res.redirect('https://c3gundam-ecommercewebsite.netlify.app/login?googleSuccess=false');
    }
  }
);

// Chạy server
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});