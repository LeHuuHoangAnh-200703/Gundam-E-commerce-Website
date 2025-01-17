<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import { io } from 'socket.io-client';
import axios from 'axios';

const message = ref('');
const messages = ref([]);
const socket = ref(null); // Kết nối socket.io

// Escape HTML để ngăn chặn XSS
const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

// Kết nối với Socket.IO server
onMounted(() => {
    socket.value = io('http://localhost:3000');

    // Lắng nghe tin nhắn từ server
    socket.value.on('message', (data) => {
        messages.value.push(data); // Thêm tin nhắn vào danh sách
    });
});

// Gửi tin nhắn đến server
const userName = localStorage.getItem('TenKhachHang');
const userId = localStorage.getItem('MaKhachHang');
const adminId = localStorage.getItem('MaAdmin');
// Gửi tin nhắn đến server  
const sendMessage = async () => {  
    if (message.value.trim()) {  
        const sanitizedMessage = escapeHtml(message.value);  
        const newMessage = {  
            NoiDung: sanitizedMessage,  
            NguoiGui: userName,
            idNguoiGui: userId,
            idNguoiNhan: adminId,  
            ThoiGian: new Date().toISOString(),
            role: 'user',    
        };  

        try {
            const response = await axios.post('http://localhost:3000/api/tinnhan', newMessage);
            console.log(message.value)
            messages.value.push(response.data.newMessage);
            message.value = '';
        } catch (error) {
            console.log('Error sending message:', error);
        }  
    }  
};

onMounted(() => {
    socket.value = io('http://localhost:3000', {
        reconnectionAttempts: 5, // Số lần thử kết nối lại
        reconnectionDelay: 1000, // Thời gian giữa các lần thử kết nối lại
    });

    socket.value.on('connect', () => {
        console.log('Socket connected');
    });

    socket.value.on('disconnect', () => {
        console.log('Socket disconnected');
    });

    socket.value.on('message', (data) => {
        messages.value.push(data); // Thêm tin nhắn vào danh sách
    });
});

</script>

<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="relative mb-5 lg:mx-[200px] flex justify-center items-center flex-grow">
            <div class="w-full m-4">
                <h1 class="font-bold text-white text-[20px] my-4">Đoạn chat <i class="fa-solid fa-comments"></i></h1>
                <div
                    class="bg-[#242424] flex flex-col gap-3 overflow-hidden px-6 py-3 rounded [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                    <div class="flex gap-3 items-center text-white">
                        <img src="../../assets/img/avatar.jpg"
                            class="w-[50px] h-[50px] rounded-full [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]"
                            alt="">
                        <div class="flex flex-col">
                            <p class="font-semibold text-[18px]">C3 GUNDAM STORE</p>
                            <p class="text-[12px]">Đang hoạt động</p>
                        </div>
                    </div>
                    <hr>
                    <div class="flex flex-col gap-4 flex-grow overflow-y-auto max-h-[calc(100vh-53vh)]">
                        <!-- Hiển thị danh sách tin nhắn -->
                        <div v-for="(msg, index) in messages" :key="index" class="flex gap-2"
                            :class="{ 'self-end': msg.sender === 'client' }">
                            <template v-if="msg.sender === 'admin'">
                                <img src="../../assets/img/avatar.jpg" class="w-[35px] h-[35px] rounded-full" alt="">
                            </template>
                            <div class="flex flex-col gap-1">
                                <div :class="msg.sender === 'client' ? 'bg-[#4169E1] text-white' : 'bg-gray-200 text-[#333]'"
                                    class="p-2 rounded-md">
                                    <p class="text-[14px]">{{ msg.content }}</p>
                                </div>
                                <small class="text-white text-[10px]">{{ new Date(msg.timestamp).toLocaleString()
                                    }}</small>
                            </div>
                        </div>
                    </div>
                    <hr class="my-3">
                    <form @submit.prevent="sendMessage" method="POST">
                        <div class="flex justify-between w-full gap-4 items-center">
                            <input type="text" v-model="message"
                                class="items-center w-full h-full p-3 bg-gray-200 text-[12px] shadow font-semibold tracking-wider text-black rounded-md focus:outline-none"
                                placeholder="Tin nhắn của bạn ...">
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