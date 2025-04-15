<script setup>
import { onUnmounted, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { io } from "socket.io-client";

const router = useRouter();

const chatBot = () => {
    const MaKhachHang = localStorage.getItem('MaKhachHang');
    if (!MaKhachHang) {
        router.push('/login');
    }
    // } else {
    //     router.push('/chatbox');
    // }
}

</script>

<template>
    <button @click.prevent="chatBot"
        class="fixed bottom-48 right-10 cursor-pointer flex justify-center items-center [box-shadow:0px_0px_10px_rgba(255,255,255,0.8)] bg-[#FFD700] border-2 rounded-full w-[50px] h-[50px]">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot-icon lucide-bot"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
    </button>
</template>

<style></style>