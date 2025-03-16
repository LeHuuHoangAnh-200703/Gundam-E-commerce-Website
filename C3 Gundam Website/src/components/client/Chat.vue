<script setup>
import { onUnmounted, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { io } from "socket.io-client";

const router = useRouter();
const hasUnreadMessages = ref(false); // Biến để theo dõi tin nhắn chưa đọc

// Kết nối Socket.IO
const socket = io("http://localhost:3000", {
    auth: {
        userId: localStorage.getItem('MaKhachHang'),
        userName: localStorage.getItem('TenKhachHang')
    },
});

const chatBox = () => {
    const MaKhachHang = localStorage.getItem('MaKhachHang');
    if (!MaKhachHang) {
        router.push('/login');
    } else {
        router.push('/chatbox');
        // Khi nhấp vào nút chat, đánh dấu tin nhắn đã đọc
        hasUnreadMessages.value = false;
        socket.emit("markAsRead", { roomCode: `${MaKhachHang}_admin`, userId: MaKhachHang });
    }
}

onMounted(() => {
    socket.on("connect", () => {
        console.log("Đã kết nối Socket.IO với server từ client");
    });

    // Lắng nghe tin nhắn mới từ admin
    socket.on("receiveMessage", (msg) => {
        const MaKhachHang = localStorage.getItem("MaKhachHang");
        if (msg.senderId !== MaKhachHang && msg.roomCode === `${MaKhachHang}_admin`) {
            hasUnreadMessages.value = true; // Hiển thị dấu chấm đỏ khi có tin nhắn từ admin
        }
    });

    // Cập nhật trạng thái tin nhắn chưa đọc
    socket.on("chatRoomsUpdated", (updatedChatRooms) => {
        const MaKhachHang = localStorage.getItem("MaKhachHang");
        const clientRoom = updatedChatRooms.find((room) => room.senderId === MaKhachHang && room.receiverId === "AM55511");
        if (clientRoom) {
            hasUnreadMessages.value = clientRoom.senderMessagesNotRead.length > 0;
        }
    });
});

onUnmounted(() => {
    socket.disconnect();
});

</script>

<template>
    <button @click.prevent="chatBox"
        class="fixed bottom-32 right-10 cursor-pointer flex justify-center items-center [box-shadow:0px_0px_10px_rgba(255,255,255,0.8)] bg-[#003171] border-2 rounded-full w-[50px] h-[50px]">
        <i class="fa-solid fa-comments text-white"></i>
        <span v-if="hasUnreadMessages"
            class="absolute top-0 right-0 w-[12px] h-[12px] bg-red-500 border-2 border-white rounded-full"></span>
    </button>
</template>

<style></style>