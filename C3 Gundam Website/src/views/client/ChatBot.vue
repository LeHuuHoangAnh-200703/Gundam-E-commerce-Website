<script setup>
import { ref, computed, onMounted } from 'vue';
import Header from "@/components/client/Header.vue";
import Footer from "@/components/client/Footer.vue";
import BackToTop from "@/components/client/BackToTop.vue";
import ChatBox from "../../components/client/Chat.vue";
import axios from 'axios';

// --- CẤU HÌNH URL ĐỘNG ---
// Tự động lấy link từ Netlify Environment hoặc Localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// -------------------------

const nameCustomer = ref('');
const message = ref('');
const listMessage = ref([]);
const isLoading = ref(false);
const maKhachHang = localStorage.getItem("MaKhachHang");

const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};
const fetchCustomer = async (idKhachHang) => {
    // SỬA 1: Dùng API_URL
    const response = await axios.get(`${API_URL}/api/khachhang/${idKhachHang}`);
    nameCustomer.value = response.data.TenKhachHang;
}

const fetchChatHistory = async () => {
    try {
        // SỬA 2: Dùng API_URL
        const response = await axios.get(`${API_URL}/api/chatbot/${maKhachHang}`);
        listMessage.value = response.data;
    } catch (error) {
        console.log("Lỗi khi lấy tin nhắn: ", error);
    }
}

const sendMessage = async () => {
    if (!message.value.trim()) return;

    const escapedMessage = escapeHtml(message.value);

    const newUserMessage = {
        NoiDung: escapedMessage,
        MaKhachHang: maKhachHang,
        NguoiGui: 'user'
    };
    listMessage.value = [...listMessage.value, newUserMessage];

    message.value = '';
    isLoading.value = true;

    try {
        // SỬA 3: Dùng API_URL
        const response = await axios.post(`${API_URL}/api/chatbot`, {
            maKhachHang,
            NoiDung: escapedMessage
        });

        // Tạo độ trễ 2 giây để giả lập "suy nghĩ"
        await new Promise(resolve => setTimeout(resolve, 2000));

        const newBotMessage = {
            NoiDung: response.data,
            MaKhachHang: maKhachHang,
            NguoiGui: 'bot'
        };

        listMessage.value = [...listMessage.value, newBotMessage];
    } catch (error) {
        console.log("Lỗi khi gửi tin nhắn: ", error);
    } finally {
        // Tắt trạng thái loading
        isLoading.value = false;
    }
}

onMounted(() => {
    const MaKhachHang = localStorage.getItem('MaKhachHang');
    fetchCustomer(MaKhachHang);
    fetchChatHistory();
})
</script>

<template>
    <div class="bg-gradient-to-br from-[#0F1419] via-[#1A1D27] to-[#0F1419] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="relative mb-5 lg:mx-[200px] flex flex-col justify-center flex-grow">
            <div v-if="listMessage.length > 0" class="flex-grow overflow-y-auto max-h-[calc(100vh-40vh)]">
                <div class="flex flex-col gap-4" v-for="message in listMessage" :key="message">
                    <div class="items-end flex flex-col gap-1" v-if="message.NguoiGui === 'user'">
                        <div class="bg-gray-800 rounded-md border border-white inline-block p-3">
                            <p class="font-medium text-white text-[16px]">{{ message.NoiDung }}</p>
                        </div>
                    </div>
                    <div class="items-start flex flex-col gap-1" v-if="message.NguoiGui === 'bot'">
                        <div class="inline-block p-4">
                            <p class="font-medium text-white text-[16px]">{{ message.NoiDung }}</p>
                        </div>
                    </div>
                </div>
                <div v-if="isLoading" class="items-start flex flex-col gap-1">
                    <div class="inline-block p-4">
                        <div class="flex items-center space-x-2">
                            <div class="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                            <div class="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
                            <div class="w-2 h-2 bg-white rounded-full animate-bounce delay-400"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="flex flex-col items-center mb-16">
                <p class="text-[20px] lg:text-[35px] text-white font-semibold">Xin chào, {{ nameCustomer }}.</p>
                <p class="text-gray-500 text-[18px] lg:text-[32px] font-semibold">Hôm nay tôi có thể giúp gì cho bạn?
                </p>
            </div>
            <hr v-if="listMessage.length > 0" class="my-3" />
            <form @submit.prevent="sendMessage">
                <div
                    class="flex justify-between items-center bg-gray-800 border border-white rounded-lg p-2 m-4 lg:m-0">
                    <input type="text" v-model="message"
                        class="bg-transparent items-center w-full h-full p-1 text-[12px] lg:text-[16px] font-semibold tracking-wider text-white focus:outline-none"
                        placeholder="Bạn muốn biết gì ?" />
                    <button type="submit" :disabled="isLoading" class="px-5 py-3 text-white rounded-lg bg-gray-600">
                        <i class="fa-solid fa-arrow-up text-[16px] font-bold"></i>
                    </button>
                </div>
            </form>
        </div>
        <ChatBox />
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
