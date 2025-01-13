<script setup>
import { ref, onMounted, computed } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import axios from 'axios';
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full min-h-screen font-sans">
        <div class="flex gap-3">
            <SideBar />
            <div class="relative p-4 flex flex-col gap-4 w-full overflow-auto">
                <Navbar />
                <div class="flex lg:flex-row flex-col gap-4 justify-center lg:justify-between items-center">
                    <h1 class="font-bold text-[20px] uppercase">Tin nhắn từ khách hàng </h1>
                </div>
                <div class="w-full flex lg:flex-row flex-col gap-8 items-start">
                    <div
                        class="flex flex-col gap-5 bg-white p-4 rounded-lg shadow-lg w-full min-h-[calc(100vh-25vh)] overflow-hidden lg:w-[40%]">
                        <div class="flex flex-col gap-2">
                            <p class="font-semibold text-[20px]">Đoạn chat </p>
                            <div class="relative flex justify-center flex-1 gap-2 max-w-xl">
                                <input type="text"
                                    class="items-center w-full p-3 bg-gray-200 text-[12px] shadow font-semibold tracking-wider text-black rounded-md focus:outline-none"
                                    placeholder="Tìm kiếm tên khách hàng ..." />
                                <i
                                    class="fa-solid fa-magnifying-glass absolute top-[10px] right-3 text-[22px] text-[#003171]"></i>
                            </div>
                            <div class="flex flex-col gap-2 mt-3 overflow-y-auto max-h-[calc(100vh-300px)]">
                                <div class="flex gap-2 hover:bg-gray-200 rounded-lg p-2 cursor-pointer">
                                    <img src="../../assets/img/avatar.jpg" class="w-[50px] h-[50px] rounded-full"
                                        alt="">
                                    <div class="flex flex-col justify-center">
                                        <p class="text-[14px] font-bold">Lê Hữu Hoàng Anh</p>
                                        <div class="whitespace-nowrap text-ellipsis overflow-hidden w-56">
                                            <p
                                                class="overflow-hidden text-ellipsis whitespace-nowrap text-gray-500 text-[12px]">
                                                Đây là đoạn tin nhắn sẽ được hiển thị Đây là đoạn tin nhắn sẽ được hiển
                                                thị </p>
                                        </div>
                                    </div>
                                </div>
                                <hr>
                                <div class="flex gap-2 hover:bg-gray-200 rounded-lg p-2 cursor-pointer">
                                    <img src="../../assets/img/1736583214853.jpg" class="w-[50px] h-[50px] rounded-full"
                                        alt="">
                                    <div class="flex flex-col justify-center">
                                        <p class="text-[14px] font-bold">Hữu Anh</p>
                                        <div class="whitespace-nowrap text-ellipsis overflow-hidden w-56">
                                            <p
                                                class="overflow-hidden text-ellipsis whitespace-nowrap text-gray-500 text-[12px]">
                                                Đây là đoạn tin nhắn sẽ được hiển thị Đây là đoạn tin nhắn sẽ được hiển
                                                thị </p>
                                        </div>
                                    </div>
                                </div>
                                <hr>
                                <div class="flex gap-2 hover:bg-gray-200 rounded-lg p-2 cursor-pointer">
                                    <img src="../../assets/img/1736583214853.jpg" class="w-[50px] h-[50px] rounded-full"
                                        alt="">
                                    <div class="flex flex-col justify-center">
                                        <p class="text-[14px] font-bold">Hữu Anh</p>
                                        <div class="whitespace-nowrap text-ellipsis overflow-hidden w-56">
                                            <p
                                                class="overflow-hidden text-ellipsis whitespace-nowrap text-gray-500 text-[12px]">
                                                Đây là đoạn tin nhắn sẽ được hiển thị Đây là đoạn tin nhắn sẽ được hiển
                                                thị </p>
                                        </div>
                                    </div>
                                </div>
                                <hr>
                                <div class="flex gap-2 hover:bg-gray-200 rounded-lg p-2 cursor-pointer">
                                    <img src="../../assets/img/1736583214853.jpg" class="w-[50px] h-[50px] rounded-full"
                                        alt="">
                                    <div class="flex flex-col justify-center">
                                        <p class="text-[14px] font-bold">Hữu Anh</p>
                                        <div class="whitespace-nowrap text-ellipsis overflow-hidden w-56">
                                            <p
                                                class="overflow-hidden text-ellipsis whitespace-nowrap text-gray-500 text-[12px]">
                                                Đây là đoạn tin nhắn sẽ được hiển thị Đây là đoạn tin nhắn sẽ được hiển
                                                thị </p>
                                        </div>
                                    </div>
                                </div>
                                <hr>
                                <div class="flex gap-2 hover:bg-gray-200 rounded-lg p-2 cursor-pointer">
                                    <img src="../../assets/img/1736583214853.jpg" class="w-[50px] h-[50px] rounded-full"
                                        alt="">
                                    <div class="flex flex-col justify-center">
                                        <p class="text-[14px] font-bold">Hữu Anh</p>
                                        <div class="whitespace-nowrap text-ellipsis overflow-hidden w-56">
                                            <p
                                                class="overflow-hidden text-ellipsis whitespace-nowrap text-gray-500 text-[12px]">
                                                Đây là đoạn tin nhắn sẽ được hiển thị Đây là đoạn tin nhắn sẽ được hiển
                                                thị </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-8 w-full h-full overflow-hidden">
                        <div
                            class="bg-white p-4 w-full h-full border-2 rounded-lg shadow-lg flex flex-col gap-4 overflow-hidden">
                            <div class="flex gap-2">
                                <img src="../../assets/img/1736583214853.jpg" class="w-[50px] h-[50px] rounded-full"
                                    alt="">
                                <div class="flex flex-col justify-center">
                                    <p class="text-[14px] font-bold">Hữu Anh</p>
                                    <p class="text-gray-500 text-[12px]">
                                        Đang hoạt động
                                    </p>
                                </div>
                            </div>
                            <hr>
                            <div class="flex flex-col gap-4 flex-grow overflow-y-auto max-h-[calc(100vh-53vh)]">
                                <div class="bg-[#4169E1] p-2 rounded-t-lg rounded-l-lg self-end">
                                    <p class="text-white text-[14px] inline-block">Xin chào bạn! C3 Gundam có thể giúp
                                        gì cho bạn?</p>
                                </div>
                                <div class="flex gap-2 items-end">
                                    <img src="../../assets/img/avatar.jpg" class="w-[35px] h-[35px] rounded-full"
                                        alt="">
                                    <div class="bg-gray-200 p-2 rounded-md self-end">
                                        <p class="text-[#333] text-[14px] inline-block">Xin chào bạn! C3 Gundam có
                                            thể giúp gì cho bạn?</p>
                                    </div>
                                </div>
                                <div class="bg-[#4169E1] p-2 rounded-t-lg rounded-l-lg self-end">
                                    <p class="text-white text-[14px] inline-block">Xin chào bạn! C3 Gundam có thể giúp
                                        gì cho bạn?</p>
                                </div>
                                <div class="flex gap-2 items-end">
                                    <img src="../../assets/img/avatar.jpg" class="w-[35px] h-[35px] rounded-full"
                                        alt="">
                                    <div class="bg-gray-200 p-2 rounded-md self-end">
                                        <p class="text-[#333] text-[14px] inline-block">Xin chào bạn! C3 Gundam có
                                            thể giúp gì cho bạn?</p>
                                    </div>
                                </div>
                                <div class="flex gap-2 items-end">
                                    <img src="../../assets/img/avatar.jpg" class="w-[35px] h-[35px] rounded-full"
                                        alt="">
                                    <div class="bg-gray-200 p-2 rounded-md self-end">
                                        <p class="text-[#333] text-[14px] inline-block">Xin chào bạn! C3 Gundam có
                                            thể giúp gì cho bạn?</p>
                                    </div>
                                </div>
                            </div>
                            <hr>
                            <div class="flex justify-between w-full gap-4 items-end">
                                <input type="text"
                                    class="items-center w-full p-3 bg-gray-200 text-[12px] shadow font-semibold tracking-wider text-black rounded-md focus:outline-none"
                                    placeholder="Tin nhắn của bạn ...">
                                <button
                                    class="flex justify-center items-center bg-[#4169E1] px-5 py-4 text-white rounded-md"><i
                                        class="fa-solid fa-arrow-up text-[16px] font-bold"></i></button>
                            </div>
                        </div>
                    </div>
                    <!-- <div v-else
                        class="bg-white p-4 w-full border-2 rounded-lg shadow-lg flex items-center justify-center">
                        <div class="flex justify-center items-center m-auto w-full h-full">
                            <div class="flex flex-col items-center justify-center gap-3">
                                <p class="font-semibold text-[18px] lg:text-[24px] text-center">Hiện tại
                                    không có đơn hàng nào!</p>
                                <img src="../../assets/img/rb_4168.png" class="w-[200px] lg:w-[380px]" alt="">
                            </div>
                        </div>
                    </div> -->
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