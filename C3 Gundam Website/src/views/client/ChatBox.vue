<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Header from "@/components/client/Header.vue";
import Footer from "@/components/client/Footer.vue";
import BackToTop from "@/components/client/BackToTop.vue";
import { io } from "socket.io-client";
import axios from "axios";

// Khai báo các biến reactive
const messages = ref([]);
const message = ref("");
const userId = ref(localStorage.getItem('MaKhachHang'));
const userName = ref(localStorage.getItem('TenKhachHang'));
const image = ref(localStorage.getItem('HinhAnh'));
console.log(image.value)
const roomCode = ref(`${userId.value}_admin`);
const socket = io("http://localhost:3000", {
    auth: {
        userId: userId.value,
        userName: userName.value,
    },
});

// Gửi tin nhắn
const sendMessage = async () => {
    if (message.value.trim()) {
        const messageData = {
            roomCode: roomCode.value,
            senderId: userId.value,
            senderName: userName.value,
            text: message.value,
        };

        socket.emit("sendMessage", messageData);
        message.value = ""; // Xóa input sau khi gửi
    }
};

// Format thời gian
const formatTime = (time) => {
    return new Date(time).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

// Tải lịch sử tin nhắn khi vào phòng
const loadChatHistory = async () => {
    try {
        const response = await axios.get(`http://localhost:3000/api/chat`);
        const chatRooms = response.data;
        const chatRoom = chatRooms.find((room) => room.roomCode === roomCode.value);

        if (chatRoom) {
            messages.value = chatRoom.messages.map((msg) => ({
                TinNhan: msg.text,
                ThoiGian: formatTime(msg.time),
                role: msg.senderId === userId.value ? "user" : "admin",
            }));
        }
    } catch (error) {
        console.error("Lỗi khi tải lịch sử chat:", error);
    }
};

// Lifecycle hooks
onMounted(() => {
    // Tham gia phòng chat
    socket.emit("joinRoom", {
        roomCode: roomCode.value,
        senderId: userId.value,
        receiverId: "AM55511",
        senderName: userName.value,
        receiverName: "C3 GUNDAM STORE",
        senderAvatar: image.value
    });

    // Nhận thông tin phòng khi tham gia
    socket.on("roomJoined", (chatRoom) => {
        messages.value = chatRoom.messages.map((msg) => ({
            TinNhan: msg.text,
            ThoiGian: formatTime(msg.time),
            role: msg.senderId === userId.value ? "user" : "admin",
        }));
    });

    // Nhận tin nhắn real-time
    socket.on("receiveMessage", (msg) => {
        messages.value.push({
            TinNhan: msg.text,
            ThoiGian: formatTime(msg.time),
            role: msg.senderId === userId.value ? "user" : "admin",
        });
    });
    // Tải lịch sử tin nhắn khi vào
    loadChatHistory();
});

onUnmounted(() => {
    socket.disconnect();
});
</script>

<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="relative mb-5 lg:mx-[200px] flex justify-center items-center flex-grow">
            <div class="w-full m-4">
                <h1 class="font-bold text-white text-[20px] my-4">
                    Đoạn chat <i class="fa-solid fa-comments"></i>
                </h1>
                <div
                    class="bg-[#242424] flex flex-col h-full w-full gap-3 overflow-hidden px-6 py-3 rounded [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                    <div class="flex gap-3 items-center text-white">
                        <img src="../../assets/img/avatar.jpg"
                            class="w-[50px] h-[50px] rounded-full [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]"
                            alt="" />
                        <div class="flex flex-col">
                            <p class="font-semibold text-[18px]">C3 GUNDAM STORE</p>
                            <p class="text-[12px]">Hoạt động từ (7:30-22:30)</p>
                        </div>
                    </div>
                    <hr />
                    <div class="flex flex-col gap-4 flex-grow overflow-y-auto max-h-[calc(100vh-40vh)]">
                        <div v-for="(msg, index) in messages" :key="index">
                            <div class="flex flex-col gap-1" :class="{ 'items-end': msg.role === 'user' }"
                                v-if="msg.role === 'user'">
                                <div class="bg-[#4169E1] p-2 rounded-t-lg rounded-l-lg self-end">
                                    <p class="text-white text-[14px] inline-block">
                                        {{ msg.TinNhan }}
                                    </p>
                                </div>
                                <small class="text-white text-[10px]">{{ msg.ThoiGian }}</small>
                            </div>
                            <div v-if="msg.role === 'admin'" class="flex gap-2">
                                <img src="../../assets/img/avatar.jpg" class="w-[35px] h-[35px] rounded-full" alt="" />
                                <div class="flex flex-col gap-1">
                                    <div class="p-2 rounded-md bg-gray-200 text-[#333]">
                                        <p class="text-[14px]">{{ msg.TinNhan }}</p>
                                    </div>
                                    <small class="text-white text-[10px]">{{ msg.ThoiGian }}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr class="my-3" />
                    <form @submit.prevent="sendMessage">
                        <div class="flex justify-between w-full gap-4 items-center">
                            <input type="text" v-model="message"
                                class="items-center w-full h-full p-3 bg-gray-200 text-[12px] shadow font-semibold tracking-wider text-black rounded-md focus:outline-none"
                                placeholder="Tin nhắn của bạn ..." />
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