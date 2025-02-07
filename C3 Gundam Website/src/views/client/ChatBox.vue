<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Header from "@/components/client/Header.vue";
import Footer from "@/components/client/Footer.vue";
import BackToTop from "@/components/client/BackToTop.vue";
import { io } from "socket.io-client";
import axios from "axios";

// State quản lý tin nhắn
const message = ref("");
const messages = ref([]);
const socket = ref(null);

// Lấy thông tin người dùng từ localStorage
const userName = localStorage.getItem("TenKhachHang");
const userId = localStorage.getItem("MaKhachHang");
const adminId = localStorage.getItem("MaAdmin");

// Escape HTML để ngăn ngừa XSS
const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const generateMaTinNhan = (idNguoiGui, idNguoiNhan) => {
    return `MTN_${idNguoiGui}_${idNguoiNhan}`;
};

// Gửi tin nhắn
const sendMessage = async () => {
    if (message.value.trim()) {
        const sanitizedMessage = escapeHtml(message.value);

        try {
            const newMessage = {
                MaTinNhan: generateMaTinNhan(userId, adminId),
                TinNhan: sanitizedMessage,
                NguoiGui: userName,
                idNguoiGui: userId,
                idNguoiNhan: adminId,
                ThoiGian: new Date().toISOString(),
                role: "user",
            };

            // Gửi tin nhắn đến API
            await axios.post("http://localhost:3000/api/tinnhan", newMessage);

            // Gửi tin nhắn đến server qua socket
            socket.value.emit("sendMessage", newMessage);
            console.log(newMessage)
            // Cập nhật giao diện
            messages.value.push({
                ...newMessage,
                ThoiGian: formatDate(new Date()),
            });

            message.value = "";
        } catch (error) {
            console.error("Lỗi khi gửi tin nhắn:", error);
        }
    }
};

// Định dạng ngày giờ
const formatDate = (date) => {
    const options = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    };
    return date.toLocaleString("vi-VN", options);
};

// Lấy tin nhắn từ API
const fetchMessages = async () => {
    try {
        const response = await axios.get(
            `http://localhost:3000/api/tinnhan?idNguoiGui=${userId}&idNguoiNhan=${adminId}`
        );
        if (response.data && response.data.messages && response.data.messages.length > 0) {
            messages.value = response.data.messages.map((msg) => ({
                ...msg,
                ThoiGian: formatDate(new Date(msg.ThoiGian)),
            }));
        } else {
            messages.value = [];
        }
    } catch (error) {
        console.error("Lỗi khi lấy tin nhắn:", error);
    }
};

// Kết nối với Socket.IO
onMounted(() => {
    socket.value = io("http://localhost:3000", {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    // Khi kết nối socket thành công
    socket.value.on("connect", () => {
        console.log("Kết nối socket thành công");

        // Tham gia phòng chat với admin
        socket.value.emit("joinRoom", { idNguoiGui: userId, idNguoiNhan: adminId });
    });

    // Nhận tin nhắn từ server
    socket.value.on("receiveMessage", (data) => {
        messages.value.push({
            ...data,
            ThoiGian: formatDate(new Date(data.ThoiGian)),
        });
    });

    // Lấy tin nhắn khi trang tải
    fetchMessages();
});

// Ngắt kết nối khi rời trang
onUnmounted(() => {
    socket.value.emit("leaveRoom", { idNguoiGui: userId, idNguoiNhan: adminId });
    socket.value.disconnect();
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
                    class="bg-[#242424] flex flex-col gap-3 overflow-hidden px-6 py-3 rounded [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                    <div class="flex gap-3 items-center text-white">
                        <img src="../../assets/img/avatar.jpg"
                            class="w-[50px] h-[50px] rounded-full [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]"
                            alt="" />
                        <div class="flex flex-col">
                            <p class="font-semibold text-[18px]">C3 GUNDAM STORE</p>
                            <p class="text-[12px]">Đang hoạt động</p>
                        </div>
                    </div>
                    <hr />
                    <div class="flex flex-col gap-4 flex-grow overflow-y-auto min-h-[calc(100vh-60vh)]">
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
                            <template v-if="msg.role === 'admin'">
                                <img src="../../assets/img/avatar.jpg" class="w-[35px] h-[35px] rounded-full" alt="" />
                            </template>
                            <div v-if="msg.role === 'admin'" class="flex flex-col gap-1">
                                <div :class="msg.role === 'admin'
                                    ? 'bg-[#4169E1] text-white'
                                    : 'bg-gray-200 text-[#333]'
                                    " class="p-2 rounded-md">
                                    <p class="text-[14px]">{{ msg.TinNhan }}</p>
                                </div>
                                <small class="text-white text-[10px]">{{}}</small>
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
