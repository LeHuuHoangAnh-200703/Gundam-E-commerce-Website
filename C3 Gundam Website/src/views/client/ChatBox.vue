<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import Header from "@/components/client/Header.vue";
import Footer from "@/components/client/Footer.vue";
import BackToTop from "@/components/client/BackToTop.vue";
import { io } from "socket.io-client";

// --- CẤU HÌNH URL ĐỘNG ---
// Tự động nhận diện môi trường: Netlify (Production) hoặc Localhost
// Lấy từ biến VITE_SOCKET_URL trong .env (hoặc fallback về localhost)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// -------------------------

// Khai báo các biến reactive
const messages = ref([]);
const message = ref("");
const selectedFiles = ref([]);
const userId = ref(localStorage.getItem("MaKhachHang"));
const userName = ref(localStorage.getItem("TenKhachHang"));
const image = ref(localStorage.getItem("HinhAnh"));
const roomCode = ref(`${userId.value}_admin`);

// SỬA 1: Dùng SOCKET_URL thay vì localhost cứng
const socket = io(SOCKET_URL, {
  auth: {
    userId: userId.value,
    userName: userName.value,
  },
  // Thêm option này để đảm bảo kết nối ổn định trên môi trường Production
  transports: ['websocket', 'polling'], 
  withCredentials: true 
});

const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const handleFileUpload = (event) => {
  selectedFiles.value = Array.from(event.target.files);
};

const removeImage = (index) => {
  selectedFiles.value.splice(index, 1);
};

// Theo dõi thay đổi trong localStorage
watch(
  () => [localStorage.getItem("TenKhachHang"), localStorage.getItem("HinhAnh")],
  ([newName, newImage]) => {
    userName.value = newName;
    image.value = newImage;
    socket.emit("updateUserInfo", {
      userId: userId.value,
      userName: newName,
      senderAvatar: newImage,
    });
  }
);

// Gửi tin nhắn
const sendMessage = async () => {
  const messageData = {
    roomCode: roomCode.value,
    senderId: userId.value,
    senderName: userName.value,
    text: message.value ? escapeHtml(message.value.trim()) : "",
    images: [],
  };

  if (selectedFiles.value.length > 0) {
    const formData = new FormData();
    selectedFiles.value.forEach((file) => {
      formData.append("images", file);
    });

    try {
      // SỬA 2: Dùng API_URL cho upload ảnh
      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      messageData.images = result.imageUrls;
      selectedFiles.value = [];
    } catch (error) {
      console.error("Lỗi khi upload ảnh:", error);
      return;
    }
  }

  if (messageData.text || messageData.images.length > 0) {
    socket.emit("sendMessage", messageData);
    message.value = "";
  }
};

// Format thời gian
const formatTime = (time) => {
  if (!time) return ''

  const now = new Date()
  const postTime = new Date(time)
  const diffInSeconds = Math.floor((now - postTime) / 1000)

  if (diffInSeconds < 60) return 'Vừa xong'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`

  return postTime.toLocaleDateString('vi-VN')
}

// Lifecycle hooks
onMounted(() => {
  // Tham gia phòng chat
  socket.emit("joinRoom", {
    roomCode: roomCode.value,
    senderId: userId.value,
    receiverId: "AM55511",
    senderName: userName.value,
    receiverName: "C3 GUNDAM STORE",
    senderAvatar: image.value,
  });

  // Đánh dấu tin nhắn đã đọc khi mở chatbox
  socket.emit("markAsRead", {
    roomCode: roomCode.value,
    userId: userId.value,
  });

  // Nhận thông tin phòng khi tham gia (bao gồm lịch sử tin nhắn)
  socket.on("roomJoined", (chatRoom) => {
    messages.value = chatRoom.messages.map((msg) => ({
      TinNhan: msg.text,
      HinhAnh: msg.images || [],
      ThoiGian: formatTime(msg.time),
      role: msg.senderId === userId.value ? "user" : "admin",
    }));
    // Cập nhật thông tin khách hàng từ server (nếu backend gửi)
    if (chatRoom.senderName && chatRoom.senderAvatar) {
      userName.value = chatRoom.senderName;
      image.value = chatRoom.senderAvatar;
    }
  });

  // Nhận tin nhắn real-time
  socket.on("receiveMessage", (msg) => {
    messages.value.push({
      TinNhan: msg.text,
      HinhAnh: msg.images || [],
      ThoiGian: formatTime(msg.time),
      role: msg.senderId === userId.value ? "user" : "admin",
    });
  });

  // Cập nhật phòng chat khi có thay đổi (bao gồm thông tin khách hàng)
  socket.on("roomUpdated", (chatRoom) => {
    if (chatRoom.roomCode === roomCode.value) {
      messages.value = chatRoom.messages.map((msg) => ({
        TinNhan: msg.text,
        HinhAnh: msg.images || [],
        ThoiGian: formatTime(msg.time),
        role: msg.senderId === userId.value ? "user" : "admin",
      }));
      // Cập nhật thông tin khách hàng từ server
      if (chatRoom.senderName && chatRoom.senderAvatar) {
        userName.value = chatRoom.senderName;
        image.value = chatRoom.senderAvatar;
      }
    }
  });
});

const imageUrls = computed(() => {
  return selectedFiles.value.map((image) => URL.createObjectURL(image));
});

onUnmounted(() => {
  socket.disconnect();
});
</script>

<template>
  <div
    class="bg-gradient-to-br from-[#0F1419] via-[#1A1D27] to-[#0F1419] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
    <Header />
    <div class="relative mb-5 lg:mx-[200px] flex justify-center items-center flex-grow">
      <div class="w-full m-4">
        <h1 class="font-bold text-white text-[20px] my-4">
          Đoạn chat <i class="fa-solid fa-comments"></i>
        </h1>
        <div
          class="bg-[#242424] flex flex-col min-h-[calc(100vh-30vh)] w-full gap-3 overflow-hidden px-6 py-3 rounded [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
          <div class="flex gap-3 items-center text-white">
            <img src="../../assets/img/avatar.png"
              class="w-[50px] h-[50px] rounded-full [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]" alt="" />
            <div class="flex flex-col">
              <p class="font-semibold text-[18px]">C3 GUNDAM STORE</p>
              <p class="text-[12px]">Hoạt động từ (7:30-22:30)</p>
            </div>
          </div>
          <hr />
          <div class="flex flex-col gap-4 flex-grow overflow-y-auto max-h-[calc(100vh-40vh)]">
            <div v-if="messages.length > 0">
              <div v-for="(msg, index) in messages" :key="index">
                <div class="flex flex-col gap-1 mb-2" :class="{ 'items-end': msg.role === 'user' }"
                  v-if="msg.role === 'user'">
                  <div class="self-end">
                    <div v-if="msg.TinNhan" class="bg-[#4169E1] p-2 rounded-t-lg rounded-l-lg inline-block">
                      <p class="text-white text-[14px]">{{ msg.TinNhan }}</p>
                    </div>
                    <div v-if="msg.HinhAnh.length > 0" class="flex gap-3 flex-wrap">
                      <img v-for="(img, i) in msg.HinhAnh" :key="i" :src="img" class="max-w-[200px] rounded-md" />
                    </div>
                  </div>
                  <small class="text-white text-[10px]">{{ msg.ThoiGian }}</small>
                </div>
                <div v-if="msg.role === 'admin'" class="flex gap-2">
                  <img src="../../assets/img/avatar.png" class="w-[35px] h-[35px] rounded-full border-2" alt="" />
                  <div class="flex flex-col gap-1">
                    <div class="rounded-md text-[#333]">
                      <div v-if="msg.TinNhan" class="bg-gray-200 p-2 rounded-lg inline-block">
                        <p class="text-[14px]">{{ msg.TinNhan }}</p>
                      </div>
                      <div v-if="msg.HinhAnh.length > 0" class="flex gap-3 flex-wrap my-2">
                        <img v-for="(img, i) in msg.HinhAnh" :key="i" :src="img" class="max-w-[200px] rounded-md" />
                      </div>
                    </div>
                    <small class="text-white text-[10px]">{{
                      msg.ThoiGian
                    }}</small>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="flex flex-col items-center justify-center lg:mt-16 mt-40">
              <div class="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center">
                <i class="fa-regular fa-comments text-gray-400 text-2xl"></i>
              </div>
              <div class="text-center mt-2">
                <h3 class="text-white font-semibold text-lg mb-2">Chưa có tin nhắn nào</h3>
                <p class="text-gray-400 text-sm">Hãy nhắn tin với quản trị viên thông qua khung chat này!</p>
              </div>
            </div>
          </div>
          <div v-if="selectedFiles.length > 0" class="flex flex-wrap gap-2 mt-2 rounded-md p-2">
            <div v-for="(imageUrl, index) in imageUrls" :key="index" class="relative">
              <img :src="imageUrl" class="w-20 h-20 object-cover border rounded-md" />
              <button
                class="absolute -top-2 -right-2 bg-[#DB3F4C] rounded-full w-5 h-5 flex items-center justify-center text-black"
                @click="removeImage(index)">
                <i class="fa-solid fa-xmark text-white"></i>
              </button>
            </div>
          </div>
          <hr class="my-3" />
          <form @submit.prevent="sendMessage">
            <div class="flex justify-between w-full gap-4 items-center">
              <input type="text" v-model="message"
                class="items-center w-full h-full p-3 bg-gray-200 text-[12px] shadow font-semibold tracking-wider text-black rounded-md focus:outline-none"
                placeholder="Tin nhắn của bạn ..." />
              <label for="image_upload">
                <i class="fa-solid fa-image text-white text-[35px] cursor-pointer"></i>
                <input type="file" class="hidden" id="image_upload" multiple @change="handleFileUpload" />
              </label>
              <button type="submit"
                class="flex justify-center items-center bg-[#4169E1] px-5 py-4 text-white rounded-md">
                <i class="fa-solid fa-arrow-up text-[16px] font-bold"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <Footer />
    <BackToTop />
  </div>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s ease;
}

.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
