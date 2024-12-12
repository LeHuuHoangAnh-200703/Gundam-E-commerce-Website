<script setup>
import { ref } from "vue"
const status = ref(0);
const isSidebarVisible = ref(false);
const sidebarMenu = [
    { name: "Danh sách sản phẩm", icon: "fa-solid fa-igloo", path: "adminDashboard" },
    { name: "Danh sách nhân viên", icon: "fa-solid fa-users", path: "staffList" },
    { name: "Danh sách đơn hàng", icon: "fa-solid fa-bag-shopping", path: "ordersBook" },
    { name: "Danh sách người dùng", icon: "fa-solid fa-users", path: "customers" },
    { name: "Danh sách phản hồi", icon: "fa-solid fa-comments", path: "customers" },
    { name: "Thêm sản phẩm", icon: "fa-solid fa-cart-plus", path: "createProducts" },
    { name: "Thêm nhân viên", icon: "fa-solid fa-user-plus", path: "addAdmin" },
    { name: "Phiếu nhập", icon: "fa-solid fa-rectangle-list", path: "entryForm" },
    { name: "Hóa đơn", icon: "fa-solid fa-scroll", path: "billInfo" },
];

const saveStatus = (index) => {
    console.log(index);
    status.value = index;
}

const toggleSideBar = () => {
    isSidebarVisible.value = !isSidebarVisible.value;
}
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full min-h-screen font-sans">
        <div class="flex gap-3">
            <div class="bg-[#1A1D27] min-h-screen w-1/4 hidden lg:block">
                <p class="p-8 font-bold text-white text-center text-[18px] font-bungee"><span class="text-[#DB3F4C]">C3
                    </span>
                    Gundam Store</p>
                <hr class="mb-8 mx-8">
                <ul class="flex flex-col space-y-2 text-[14px] font-semibold px-8 text-white mb-8">
                    <router-link to="" v-for="(sidebar, index) in sidebarMenu" :key="index" @click="saveStatus(index)"
                        :class="{ 'active-link': status === index }"
                        class="flex gap-3 items-center font-semibold cursor-pointer px-2 py-3 hover:bg-[#DB3F4C] rounded-md transition-all duration-200">
                        <i :class="sidebar.icon"></i>
                        {{ sidebar.name }}
                    </router-link>
                </ul>
            </div>
            <div class="relative p-4 flex flex-col w-full">
                <nav class="bg-white flex p-3 justify-between shadow-md rounded-md">
                    <div class="flex gap-3">
                        <img src="../../assets/img/avatar.jpg" class="w-[50px] rounded-full" alt="">
                        <div class="font-semibold flex flex-col justify-center">
                            <p class="text-[14px]">Lê Hữu Hoàng Anh</p>
                            <p class="text-[12px]">Chức vụ: <span class="text-[#DB3F4C]">Quản trị viên</span></p>
                        </div>
                    </div>
                    <div class="flex gap-3 justify-center items-center">
                        <router-link to="" class="px-2 py-2 rounded-full group hidden lg:block">
                            <i class="fa-solid fa-bell relative transition-all duration-200 text-[20px]">
                                <span
                                    class="absolute top-0 right-0 w-2 h-2 group-hover:bg-[#FFD700] bg-[#DB3F4C] transition-all duration-200 rounded-full"></span>
                            </i>
                        </router-link>
                        <router-link to="" class="px-2 py-2 rounded-full group">
                            <i
                                class="fa-solid fa-right-from-bracket group-hover:text-[#DB3F4C] transition-all duration-200 text-[20px]"></i>
                        </router-link>
                        <button @click="toggleSideBar()" class="block lg:hidden">
                            <i class="fa-solid fa-bars text-[20px]"></i>
                        </button>
                    </div>
                    <div class="fixed bottom-0 top-0 left-0 bg-[#1A1D27] w-[100%] min-h-full transition-transform duration-300" :class="{ 'translate-x-full': !isSidebarVisible, 'translate-x-0': isSidebarVisible }">
                        <div class="flex flex-col gap-4 px-5 py-5">
                            <div class="flex justify-between items-center">
                                <p class="font-bold text-white text-center text-[20px] font-bungee"><span
                                        class="text-[#DB3F4C]">C3
                                    </span>
                                    Gundam Store</p>
                                <i @click="toggleSideBar()" class="fa-regular fa-circle-xmark text-white text-4xl"></i>
                            </div>
                            <hr>
                            <ul class="flex flex-col space-x-2 text-white">
                                <router-link to="" v-for="(sidebar, index) in sidebarMenu" :key="index"
                                    class="flex gap-3 items-center font-semibold cursor-pointer px-2 py-3 hover:text-[#DB3F4C] rounded-md transition-all duration-200">
                                    <i :class="sidebar.icon"></i>
                                    {{ sidebar.name }}
                                </router-link>
                            </ul>
                        </div>
                    </div>
                </nav>
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