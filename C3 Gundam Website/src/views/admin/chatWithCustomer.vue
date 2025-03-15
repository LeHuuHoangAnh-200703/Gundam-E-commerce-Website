<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import { io } from "socket.io-client";
import axios from "axios";

const messages = ref([]);
const message = ref("");
const chatRooms = ref([]);
const selectedRoom = ref(null);
const adminId = ref("AM55511");
const adminName = ref("C3 GUNDAM STORE");

const socket = io("http://localhost:3000", {
    auth: {
        userId: adminId.value,
        userName: adminName.value,
    },
});

const loadChatRooms = async () => {
    try {
        const response = await axios.get("http://localhost:3000/api/chat");
        chatRooms.value = response.data.filter((room) => room.receiverId === adminId.value);
    } catch (error) {
        console.error("Lỗi khi tải danh sách phòng chat:", error);
    }
};

const selectRoom = (room) => {
    selectedRoom.value = room;
    console.log("Đã chọn phòng:", selectedRoom.value.roomCode);
    loadChatHistory(room.roomCode);
    socket.emit("joinRoom", {
        roomCode: room.roomCode,
        senderId: adminId.value,
        receiverId: room.senderId,
        senderName: adminName.value,
        receiverName: room.senderName,
    });
    // Đánh dấu tin nhắn đã đọc khi nhấp vào khách hàng
    socket.emit("markAsRead", { roomCode: room.roomCode, userId: adminId.value });
};

const loadChatHistory = async (roomCode) => {
    try {
        const response = await axios.get("http://localhost:3000/api/chat");
        const chatRoom = response.data.find((room) => room.roomCode === roomCode);
        if (chatRoom) {
            messages.value = chatRoom.messages.map((msg) => ({
                TinNhan: msg.text,
                ThoiGian: formatTime(msg.time),
                role: msg.senderId === adminId.value ? "admin" : "user",
            }));
            console.log("Lịch sử tin nhắn đã tải:", messages.value);
        }
    } catch (error) {
        console.error("Lỗi khi tải lịch sử tin nhắn:", error);
    }
};

const sendMessage = () => {
    if (message.value.trim() && selectedRoom.value) {
        const messageData = {
            roomCode: selectedRoom.value.roomCode,
            senderId: adminId.value,
            senderName: adminName.value,
            text: message.value,
        };

        messages.value.push({
            TinNhan: messageData.text,
            ThoiGian: formatTime(new Date()),
            role: "admin",
        });

        socket.emit("sendMessage", messageData);
        console.log("Tin nhắn đã gửi:", messageData);
        message.value = "";
    }
};

const formatTime = (time) => {
    return new Date(time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

// Đếm số tin nhắn chưa đọc cho mỗi phòng
const unreadMessagesCount = computed(() => {
    const counts = {};
    chatRooms.value.forEach((room) => {
        counts[room.roomCode] = room.receiverMessagesNotRead.length;
    });
    return counts;
});

onMounted(() => {
    loadChatRooms();

    socket.on("roomJoined", (chatRoom) => {
        if (chatRoom.roomCode === selectedRoom.value?.roomCode) {
            messages.value = chatRoom.messages.map((msg) => ({
                TinNhan: msg.text,
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
                    ThoiGian: formatTime(msg.time),
                    role: "user",
                });
            }
        }
    });

    // Lắng nghe cập nhật danh sách chatRooms
    socket.on("chatRoomsUpdated", (updatedChatRooms) => {
        chatRooms.value = updatedChatRooms.filter((room) => room.receiverId === adminId.value);
    });

    socket.on("roomUpdated", (chatRoom) => {
        if (chatRoom.roomCode === selectedRoom.value?.roomCode) {
            messages.value = chatRoom.messages.map((msg) => ({
                TinNhan: msg.text,
                ThoiGian: formatTime(msg.time),
                role: msg.senderId === adminId.value ? "admin" : "user",
            }));
            console.log("Phòng đã cập nhật, tin nhắn:", messages.value); // Debug
        }
    });
});

onUnmounted(() => {
    socket.disconnect();
});
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full min-h-screen font-sans">
        <div class="flex gap-3">
            <SideBar />
            <div class="relative p-4 flex flex-col gap-4 w-full overflow-auto">
                <Navbar />
                <div class="flex lg:flex-row flex-col gap-4 justify-center lg:justify-between items-center">
                    <h1 class="font-bold text-[20px] uppercase">Tin nhắn từ khách hàng</h1>
                </div>
                <div class="w-full flex lg:flex-row flex-col gap-8 items-start">
                    <div
                        class="flex flex-col gap-5 bg-white p-4 rounded-lg shadow-lg w-full min-h-[calc(100vh-25vh)] overflow-hidden lg:w-[40%]">
                        <div class="flex flex-col gap-2">
                            <p class="font-semibold text-[20px]">Đoạn chat</p>
                            <div class="relative flex justify-center flex-1 gap-2 max-w-xl">
                                <input type="text"
                                    class="items-center w-full p-3 bg-gray-200 text-[12px] shadow font-semibold tracking-wider text-black rounded-md focus:outline-none"
                                    placeholder="Tìm kiếm tên khách hàng ..." />
                                <i
                                    class="fa-solid fa-magnifying-glass absolute top-[10px] right-3 text-[22px] text-[#003171]"></i>
                            </div>
                            <div class="flex flex-col gap-2 mt-3 overflow-y-auto max-h-[calc(100vh-300px)]">
                                <div v-for="room in chatRooms" :key="room.roomCode"
                                    class="flex gap-2 items-center hover:bg-gray-200 rounded-lg p-2 cursor-pointer"
                                    @click="selectRoom(room)">
                                    <div class="flex gap-2">
                                        <img :src="room.senderAvatar || '../../assets/img/avatar.jpg'"
                                            class="w-[50px] h-[50px] rounded-full" alt="" />
                                        <div class="flex flex-col justify-center">
                                            <p class="text-[14px] font-bold">{{ room.senderName }}</p>
                                            <div class="whitespace-nowrap text-ellipsis overflow-hidden w-56">
                                                <p
                                                    class="overflow-hidden text-ellipsis whitespace-nowrap text-gray-500 text-[12px]">
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
                            <div class="flex gap-2">
                                <img :src="selectedRoom.senderAvatar || '../../assets/img/avatar.jpg'"
                                    class="w-[50px] h-[50px] rounded-full" alt="" />
                                <div class="flex flex-col justify-center">
                                    <p class="text-[14px] font-bold">{{ selectedRoom.senderName }}</p>
                                </div>
                            </div>
                            <hr />
                            <div class="flex flex-col gap-4 flex-grow overflow-y-auto max-h-[calc(100vh-53vh)]">
                                <div v-for="(msg, index) in messages" :key="index">
                                    <div v-if="msg.role === 'admin'" class="flex flex-col justify-end gap-2 items-end">
                                        <div class="bg-[#4169E1] p-2 rounded-t-lg rounded-l-lg">
                                            <p class="text-white text-[14px] inline-block">{{ msg.TinNhan }}</p>
                                        </div>
                                        <small class="text-[#333] text-[10px] self-end">{{ msg.ThoiGian }}</small>
                                    </div>
                                    <div v-if="msg.role === 'user'" class="flex gap-2 items-end">
                                        <img :src="selectedRoom.senderAvatar || '../../assets/img/avatar.jpg'"
                                            class="w-[35px] h-[35px] rounded-full" alt="" />
                                        <div class="bg-gray-200 p-2 rounded-md self-end">
                                            <p class="text-[#333] text-[14px] inline-block">{{ msg.TinNhan }}</p>
                                        </div>
                                        <small class="text-[#333] text-[10px]">{{ msg.ThoiGian }}</small>
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <form @submit.prevent="sendMessage">
                                <div class="flex justify-between w-full gap-4 items-end">
                                    <input v-model="message" type="text"
                                        class="items-center w-full h-full p-3 bg-gray-200 text-[12px] shadow font-semibold tracking-wider text-black rounded-md focus:outline-none"
                                        placeholder="Tin nhắn của bạn ..." />
                                    <button type="submit"
                                        class="flex justify-center items-center bg-[#4169E1] px-5 py-4 text-white rounded-md">
                                        <i class="fa-solid fa-arrow-up text-[16px] font-bold"></i>
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div v-else
                            class="bg-white p-4 w-full border-2 rounded-lg shadow-lg flex items-center justify-center h-full">
                            <div class="flex justify-center items-center m-auto w-full h-full">
                                <div class="flex flex-col items-center justify-center gap-3">
                                    <p class="font-semibold text-[18px] lg:text-[24px] text-center">
                                        Vui lòng chọn một khách hàng để trò chuyện!
                                    </p>
                                    <img src="https://res.cloudinary.com/dwcajbc6f/image/upload/v1739607250/cute-astronaut-sleeping-pillow-illustration_m4shij.png"
                                        class="w-[200px] lg:w-[350px]" alt="">
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