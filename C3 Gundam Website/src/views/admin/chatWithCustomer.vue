<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import { io } from "socket.io-client";
import axios from "axios";

const messages = ref([]);
const message = ref("");
const chatRooms = ref([]);
const selectedFiles = ref([]);
const selectedRoom = ref(null);
const adminId = ref("AM55511");
const adminName = ref("C3 GUNDAM STORE");
const searchQuery = ref("");

const socket = io("http://localhost:3000", {
  auth: {
    userId: adminId.value,
    userName: adminName.value,
  },
});

const loadChatRooms = async () => {
  try {
    const response = await axios.get("http://localhost:3000/api/chat");
    chatRooms.value = response.data.filter((room) => room.receiverId === adminId.value)
      .sort((a, b) => b.receiverMessagesNotRead.length - a.receiverMessagesNotRead.length);
  } catch (error) {
    console.error("Lỗi khi tải danh sách phòng chat:", error);
  }
};

const selectRoom = (room) => {
  selectedRoom.value = room;
  socket.emit("joinRoom", {
    roomCode: room.roomCode,
    senderId: adminId.value,
    receiverId: room.senderId,
    senderName: adminName.value,
  });
  socket.emit("markAsRead", { roomCode: room.roomCode, userId: adminId.value });
};

const sendMessage = async () => {
  if (message.value.trim() && selectedRoom.value) {
    const messageData = {
      roomCode: selectedRoom.value.roomCode,
      senderId: adminId.value,
      senderName: adminName.value,
      text: message.value,
      images: [],
    };
    if (selectedFiles.value.length > 0) {
      const formData = new FormData();
      selectedFiles.value.forEach((file) => {
        formData.append("images", file);
      });

      try {
        const response = await fetch("http://localhost:3000/api/upload", {
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
    messages.value.push({
      TinNhan: messageData.text,
      HinhAnh: messageData.images || [],
      ThoiGian: formatTime(new Date()),
      role: "admin",
    });
    socket.emit("sendMessage", messageData);
    message.value = "";
  }
};

const formatTime = (time) => {
  return new Date(time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

const handleFileUpload = (event) => {
  selectedFiles.value = Array.from(event.target.files);
};

const imageUrls = computed(() => {
  return selectedFiles.value.map((image) => URL.createObjectURL(image));
});

const removeImage = (index) => {
  selectedFiles.value.splice(index, 1);
};

const unreadMessagesCount = computed(() => {
  const counts = {};
  chatRooms.value.forEach((room) => {
    counts[room.roomCode] = room.receiverMessagesNotRead.length;
  });
  return counts;
});

const filteredRooms = computed(() => {
  return chatRooms.value.filter(room => {
    const chatRooms = !searchQuery.value || room.senderName.toLowerCase().includes(searchQuery.value.toLowerCase());
    return chatRooms;
  })
})

onMounted(() => {
  // Tải danh sách phòng chat ban đầu từ API
  loadChatRooms();

  // Lắng nghe các sự kiện Socket.IO để cập nhật real-time
  socket.on("chatRoomsUpdated", (updatedChatRooms) => {
    const filteredRooms = updatedChatRooms.filter((room) => room.receiverId === adminId.value);
    chatRooms.value = filteredRooms.sort(
      (a, b) => b.receiverMessagesNotRead.length - a.receiverMessagesNotRead.length
    );

    // Cập nhật lại phòng đang chọn nếu có
    if (selectedRoom.value) {
      const updatedRoom = filteredRooms.find(
        (room) => room.roomCode === selectedRoom.value.roomCode
      );
      if (updatedRoom) {
        selectedRoom.value = updatedRoom;
        messages.value = updatedRoom.messages.map((msg) => ({
          TinNhan: msg.text,
          HinhAnh: msg.images || [],
          ThoiGian: formatTime(msg.time),
          role: msg.senderId === adminId.value ? "admin" : "user",
        }));
      }
    }
  });


  socket.on("roomJoined", (chatRoom) => {
    if (chatRoom.roomCode === selectedRoom.value?.roomCode) {
      messages.value = chatRoom.messages.map((msg) => ({
        TinNhan: msg.text,
        HinhAnh: msg.images || [],
        ThoiGian: formatTime(msg.time),
        role: msg.senderId === adminId.value ? "admin" : "user",
      }));
    }
  });

  socket.on("receiveMessage", (msg) => {
    if (selectedRoom.value && msg.roomCode === selectedRoom.value.roomCode) {
      if (msg.senderId !== adminId.value) {
        messages.value.push({
          TinNhan: msg.text,
          HinhAnh: msg.images || [],
          ThoiGian: formatTime(msg.time),
          role: "user",
        });
      }
    }
  });

  socket.on("roomUpdated", (chatRoom) => {
    if (chatRoom.roomCode === selectedRoom.value?.roomCode) {
      selectedRoom.value = chatRoom;
      messages.value = chatRoom.messages.map((msg) => ({
        TinNhan: msg.text,
        HinhAnh: msg.images || [],
        ThoiGian: formatTime(msg.time),
        role: msg.senderId === adminId.value ? "admin" : "user",
      }));
    }
  });
});

onUnmounted(() => {
  socket.disconnect();
});
</script>

<template>
  <div class="relative bg-[#F2F2F7] w-full h-screen font-sans flex">
    <SideBar />
    <div class="flex-1 flex flex-col h-screen overflow-hidden">
      <div class="flex-shrink-0 p-4">
        <Navbar />
      </div>
      <div class="flex-1 px-4 py-4 overflow-y-auto">
        <div class="flex flex-col gap-4">
          <div class="flex lg:flex-row flex-col gap-4 justify-center lg:justify-between items-center">
            <h1 class="font-bold text-[20px] uppercase">Tin nhắn từ khách hàng</h1>
          </div>
          <div class="w-full flex lg:flex-row flex-col gap-8 items-start">
            <div
              class="flex flex-col gap-5 bg-white p-4 rounded-lg shadow-lg w-full min-h-[calc(100vh-25vh)] overflow-hidden lg:w-[40%]">
              <div class="flex flex-col gap-2">
                <p class="font-semibold text-[20px]">Đoạn chat</p>
                <div class="relative flex justify-center flex-1 gap-2 w-full">
                  <input type="text" v-model="searchQuery"
                    class="items-center w-full p-3 bg-gray-200 text-[12px] shadow font-semibold tracking-wider text-black rounded-md focus:outline-none"
                    placeholder="Tìm kiếm tên khách hàng ..." />
                  <i class="fa-solid fa-magnifying-glass absolute top-[10px] right-3 text-[22px] text-[#003171]"></i>
                </div>
                <div class="flex flex-col gap-2 mt-3 overflow-y-auto max-h-[calc(100vh-300px)]">
                  <div v-for="room in filteredRooms" :key="room.roomCode"
                    class="flex gap-2 items-center hover:bg-gray-200 p-2 cursor-pointer border-b-2 pb-4"
                    @click="selectRoom(room)">
                    <div class="flex gap-2 items-center">
                      <img :src="room.senderAvatar || '/src/assets/img/avatar.jpg'"
                        class="w-[50px] h-[50px] rounded-full" alt="" />
                      <div class="flex flex-col justify-center">
                        <p class="text-[14px] font-bold">{{ room.senderName }}</p>
                        <div class="whitespace-nowrap text-ellipsis overflow-hidden w-56">
                          <p class="overflow-hidden text-ellipsis whitespace-nowrap text-gray-500 text-[12px]">
                            {{ room.messages.length > 0 ? room.messages[room.messages.length -
                              1].text : "Chưa có tin nhắn" }}
                          </p>
                        </div>
                      </div>
                    </div>
                    <span v-if="unreadMessagesCount[room.roomCode] > 0"
                      class="bg-red-500 text-white text-[12px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {{ unreadMessagesCount[room.roomCode] }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-8 w-full h-full overflow-hidden">
              <div v-if="selectedRoom"
                class="bg-white p-4 w-full h-full border-2 rounded-lg shadow-lg flex flex-col gap-4 overflow-hidden">
                <div class="flex gap-2 items-center">
                  <img :src="selectedRoom.senderAvatar || '/src/assets/img/avatar.jpg'"
                    class="w-[50px] h-[50px] rounded-full" alt="" />
                  <p class="text-[14px] font-bold">{{ selectedRoom.senderName }}</p>
                </div>
                <hr />
                <div :class="(messages.length > 0) ? '' : 'items-center justify-center'"
                  class="flex flex-col gap-4 flex-grow overflow-y-auto max-h-[calc(100vh-53vh)]">
                  <div v-if="messages.length > 0">
                    <div v-for="(msg, index) in messages" :key="index">
                      <div v-if="msg.role === 'admin'" class="flex flex-col justify-end gap-2 items-end">
                        <div v-if="msg.TinNhan" class="bg-[#4169E1] p-2 rounded-t-lg rounded-l-lg inline-block">
                          <p class="text-white text-[14px]">{{ msg.TinNhan }}</p>
                        </div>
                        <div v-if="msg.HinhAnh.length > 0" class="flex gap-3 flex-wrap">
                          <img v-for="(img, i) in msg.HinhAnh" :key="i" :src="img"
                            class="max-w-[200px] rounded-md border-2" />
                        </div>
                        <small class="text-[#333] text-[10px] self-end">{{ msg.ThoiGian }}</small>
                      </div>
                      <div v-if="msg.role === 'user'" class="flex gap-2 my-2">
                        <img :src="selectedRoom.senderAvatar || '/src/assets/img/avatar.jpg'"
                          class="w-[35px] h-[35px] rounded-full" alt="" />
                        <div class="flex flex-col gap-1">
                          <div v-if="msg.TinNhan" class="bg-gray-200 p-2 rounded-md self-end">
                            <p class="text-[#333] text-[14px] inline-block">{{ msg.TinNhan }}</p>
                          </div>
                          <div v-if="msg.HinhAnh.length > 0" class="flex gap-3 flex-wrap">
                            <img v-for="(img, i) in msg.HinhAnh" :key="i" :src="img"
                              class="max-w-[200px] rounded-md border-2" />
                          </div>
                          <small class="text-[#333] text-[10px]">{{ msg.ThoiGian }}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="flex flex-col items-center justify-center">
                    <p class="text-[20px] font-semibold text-gray-600">Hiện tại không có tin nhắn!</p>
                    <img src="../../assets/img/empty_admin.png" class="w-[100px] h-[100px]" alt="">
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
                <hr />
                <form @submit.prevent="sendMessage">
                  <div class="flex justify-between w-full gap-4 items-end">
                    <input v-model="message" type="text"
                      class="items-center w-full h-full p-3 bg-gray-200 text-[12px] shadow font-semibold tracking-wider text-black rounded-md focus:outline-none"
                      placeholder="Tin nhắn của bạn ..." />
                    <label for="image_upload">
                      <i class="fa-solid fa-image text-gray-500 text-[35px] cursor-pointer"></i>
                      <input type="file" class="hidden" id="image_upload" multiple @change="handleFileUpload" />
                    </label>
                    <button type="submit"
                      class="flex justify-center items-center bg-[#4169E1] px-5 py-4 text-white rounded-md">
                      <i class="fa-solid fa-arrow-up text-[16px] font-bold"></i>
                    </button>
                  </div>
                </form>
              </div>
              <div v-else
                class="bg-white p-4 w-full min-h-[calc(100vh-25vh)] border-2 rounded-lg shadow-lg flex flex-col gap-4 overflow-hidden">
                <div class="flex justify-center items-center m-auto w-full h-full">
                  <div class="flex flex-col items-center justify-center gap-3 h-full">
                    <p class="font-semibold text-[18px] lg:text-[24px] text-center">
                      Vui lòng chọn một khách hàng để trò chuyện!
                    </p>
                    <img src="../../assets/img/empty_admin.png" class="w-[200px] lg:w-[300px]" alt="">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.active-link {
  background: #DB3F4C;
  color: white;
}

.fixed {
  transform: translateX(100%);
  transition: transform 0.3s ease-in-out;
}

.fixed.translate-x-0 {
  transform: translateX(0);
}
</style>