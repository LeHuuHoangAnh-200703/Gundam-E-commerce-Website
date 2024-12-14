<script setup>
import { ref } from "vue";
const isSidebarVisible = ref(false);
const isNotificationVisible = ref(false);

const sidebarMenuMobile = [
    { name: "Thống kê", icon: "fa-solid fa-chart-simple", path: "adminStatistical" },
    { name: "Danh sách sản phẩm", icon: "fa-solid fa-igloo", path: "adminProducts" },
    { name: "Danh sách nhân viên", icon: "fa-solid fa-users", path: "staffList" },
    { name: "Danh sách đơn hàng", icon: "fa-solid fa-bag-shopping", path: "ordersList" },
    { name: "Danh sách người dùng", icon: "fa-solid fa-users", path: "customers" },
    { name: "Danh sách đánh giá", icon: "fa-solid fa-comments", path: "feedbacks" },
    { name: "Thêm sản phẩm", icon: "fa-solid fa-cart-plus", path: "createProducts" },
    { name: "Thêm nhân viên", icon: "fa-solid fa-user-plus", path: "addAdmin" },
    { name: "Phiếu nhập", icon: "fa-solid fa-rectangle-list", path: "entryForm" },
    { name: "Hóa đơn", icon: "fa-solid fa-scroll", path: "billInfo" },
    { name: "Đăng xuất", icon: "fa-solid fa-right-from-bracket", path: "logout" },
];

const toggleSideBar = () => {
    isSidebarVisible.value = !isSidebarVisible.value;
}

const toggleNotification = () => {
    isNotificationVisible.value = !isNotificationVisible.value;
}
</script>

<template>
    <div class="w-full">
        <nav class="bg-white flex p-3 justify-between shadow-md rounded-md">
            <div class="flex gap-3">
                <img src="../../assets/img/avatar.jpg" class="w-[50px] rounded-full" alt="">
                <div class="font-semibold flex flex-col justify-center">
                    <p class="text-[14px]">Lê Hữu Hoàng Anh</p>
                    <p class="text-[12px]">Chức vụ: <span class="text-[#DB3F4C]">Quản trị viên</span></p>
                </div>
            </div>
            <div class="flex gap-3 justify-center items-center">
                <router-link to="" @click="toggleNotification()" class="px-2 py-2 rounded-full group">
                    <i class="fa-solid fa-bell relative transition-all duration-200 text-[20px]">
                        <span
                            class="absolute top-0 right-0 w-2 h-2 group-hover:bg-[#FFD700] bg-[#DB3F4C] transition-all duration-200 rounded-full"></span>
                    </i>
                </router-link>
                <router-link to="" class="px-2 py-2 rounded-full group hidden lg:block">
                    <i
                        class="fa-solid fa-right-from-bracket group-hover:text-[#DB3F4C] transition-all duration-200 text-[20px]"></i>
                </router-link>
                <button @click="toggleSideBar()" class="block lg:hidden">
                    <i class="fa-solid fa-bars text-[20px]"></i>
                </button>
            </div>
            <div class="fixed bottom-0 top-0 left-0 bg-[#1A1D27] w-[100%] min-h-full transition-transform duration-300 z-20"
                :class="{ 'translate-x-full': !isSidebarVisible, 'translate-x-0': isSidebarVisible }">
                <div class="flex flex-col gap-4 px-5 py-5">
                    <div class="flex justify-between items-center">
                        <p class="font-bold text-white text-center text-[20px] font-bungee"><span
                                class="text-[#DB3F4C]">C3
                            </span>
                            Gundam Store</p>
                        <i @click="toggleSideBar()" class="fa-regular fa-circle-xmark text-white text-4xl"></i>
                    </div>
                    <hr>
                    <ul class="flex flex-col text-white">
                        <router-link to="" v-for="(sidebar, index) in sidebarMenuMobile" :key="index"
                            class="flex gap-3 items-center font-semibold cursor-pointer py-3 hover:text-[#DB3F4C] rounded-md transition-all duration-200">
                            <i :class="sidebar.icon"></i>
                            {{ sidebar.name }}
                        </router-link>
                    </ul>
                </div>
            </div>
            <div class="notification fixed top-28 w-full lg:w-96 bg-white shadow-lg p-4 rounded-lg z-10"
                :class="{ 'lg:right-[25%] right-[100%]': isNotificationVisible, 'right-[-100%]': !isNotificationVisible }">
                <div class="flex justify-between items-center">
                   <p class="font-semibold text-[18px]">Thông báo</p>
                    <i @click="toggleNotification()" class="fa-solid cursor-pointer fa-arrow-right font-semibold text-[20px]"></i> 
                </div>
                <hr class="mt-2">
                <div class="flex gap-3 items-center border-b py-2">
                    <div class="w-12 h-12 rounded-full bg-[#40E0D0] flex justify-center items-center">
                        <i class="fa-regular fa-bell text-[20px]"></i>
                    </div>
                    <div class="flex flex-col">
                        <p class="font-semibold text-[16px]">Sản phẩm mới vừa được thêm.</p>
                        <p class="text-[12px] font-medium text-gray-600">12:30 24-07-2024</p>
                    </div>
                </div>
                <div class="flex gap-3 items-center border-b py-2">
                    <div class="w-12 h-12 rounded-full bg-[#40E0D0] flex justify-center items-center">
                        <i class="fa-regular fa-bell text-[20px]"></i>
                    </div>
                    <div class="flex flex-col">
                        <p class="font-semibold text-[16px]">Hóa đơn vừa được thêm.</p>
                        <p class="text-[12px] font-medium text-gray-600">12:30 24-07-2024</p>
                    </div>
                </div>
                <div class="flex gap-3 items-center border-b py-2">
                    <div class="w-12 h-12 rounded-full bg-[#40E0D0] flex justify-center items-center">
                        <i class="fa-regular fa-bell text-[20px]"></i>
                    </div>
                    <div class="flex flex-col">
                        <p class="font-semibold text-[16px]">Nhân viên vừa được thêm.</p>
                        <p class="text-[12px] font-medium text-gray-600">12:30 24-07-2024</p>
                    </div>
                </div>
            </div>
        </nav>
    </div>
</template>

<style scoped>
.fixed {
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
}
.fixed.translate-x-0 {
    transform: translateX(0);
}

.notification {
    transition: right 0.3s ease-in-out;
}
</style>