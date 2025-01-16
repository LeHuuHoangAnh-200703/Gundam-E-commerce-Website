<script setup>
import { ref, onMounted, watch } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import axios from 'axios';

const errors = ref({});
const message = ref('');
const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const sendMessage = async () => {
    if (message.value) {
        message.value = escapeHtml(message.value);
    }
}
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
                    <form @submit.prevent="sendMessage" method="POST">
                        <div class="flex flex-col gap-4 flex-grow overflow-y-auto max-h-[calc(100vh-53vh)]">
                            <div class="flex flex-col gap-1 self-end">
                                <div class="bg-[#4169E1] p-2 rounded-t-lg rounded-l-lg">
                                    <p class="text-white text-[14px] inline-block">Xin chào bạn! C3 Gundam có thể giúp
                                        gì cho bạn?</p>
                                </div>
                                <small class="self-end text-white pr-2 text-[10px]">11/01/2024 12:02:50</small>
                            </div>
                            <div class="flex gap-2">
                                <img src="../../assets/img/avatar.jpg" class="w-[35px] h-[35px] rounded-full" alt="">
                                <div class="flex flex-col gap-1 self-end">
                                    <div class="bg-gray-200 p-2 rounded-md self-end">
                                        <p class="text-[#333] text-[14px] inline-block">Xin chào bạn! C3 Gundam có
                                            thể giúp gì cho bạn?</p>
                                    </div>
                                    <small class="self-end text-white text-[10px]">11/01/2024 12:02:50</small>
                                </div>
                            </div>
                        </div>
                        <hr class="my-3">
                        <div class="flex justify-between w-full gap-4 items-center">
                            <input type="text" v-model="message"
                                class="items-center w-full h-full p-3 bg-gray-200 text-[12px] shadow font-semibold tracking-wider text-black rounded-md focus:outline-none"
                                placeholder="Tin nhắn của bạn ...">
                            <button type="submit"
                                class="flex justify-center items-center bg-[#4169E1] px-5 py-4 text-white rounded-md"><i
                                    class="fa-solid fa-arrow-up text-[16px] font-bold"></i></button>
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