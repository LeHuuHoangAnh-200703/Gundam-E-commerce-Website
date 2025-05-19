<script setup>
import { ref, computed, onMounted } from 'vue';
import Header from "@/components/client/Header.vue";
import Footer from "@/components/client/Footer.vue";
import BackToTop from "@/components/client/BackToTop.vue";
import ChatBox from "../../components/client/Chat.vue";
import axios from 'axios';

const nameCustomer = ref('');
const message = ref('');

const fetchCustomer = async (idKhachHang) => {
    const response = await axios.get(`http://localhost:3000/api/khachhang/${idKhachHang}`);
    nameCustomer.value = response.data.TenKhachHang;
}

onMounted(() => {
    const MaKhachHang = localStorage.getItem('MaKhachHang');
    fetchCustomer(MaKhachHang);
})
</script>

<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="relative mb-5 lg:mx-[200px] flex flex-col justify-center flex-grow">
            <div v-if="message.length > 0" class="flex flex-col gap-4 flex-grow overflow-y-auto max-h-[calc(100vh-40vh)]">
                <div class="items-end flex flex-col gap-1">
                    <div class="bg-gray-800 rounded-md border border-white inline-block p-4">
                        <p class="font-medium text-white text-[16px]">Chào shop, mình mới biết shop qua bạn bè</p>
                    </div>
                </div>
                <div class="items-start flex flex-col gap-1">
                    <div class="inline-block p-4">
                        <p class="font-medium text-white text-[16px]">Chào bạn! Shop rất vui được hỗ trợ bạn. Bạn cần
                            tìm hiểu gì ạ?</p>
                    </div>
                </div>
            </div>
            <div v-else class="flex flex-col items-center mb-16">
                <p class="text-[20px] lg:text-[35px] text-white font-semibold">Xin chào, {{ nameCustomer }}.</p>
                <p class="text-gray-500 text-[18px] lg:text-[32px] font-semibold">Hôm nay tôi có thể giúp gì cho bạn?</p>
            </div>
            <hr v-if="message.length> 0" class="my-3" />
            <form>
                <div class="flex justify-between items-center bg-gray-800 border border-white rounded-lg p-2 m-4 lg:m-0">
                    <input type="text"
                        class="bg-transparent items-center w-full h-full p-1 text-[12px] lg:text-[16px] font-semibold tracking-wider text-white focus:outline-none"
                        placeholder="Bạn muốn biết gì ?" />
                    <button type="submit" class="px-5 py-4 text-white rounded-lg bg-gray-600">
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
