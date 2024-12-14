<script setup>
import {ref} from "vue";
const status = ref(0);
const sidebarMenu = [
    { name: "Thống kê", icon: "fa-solid fa-chart-simple", path: "adminStatistical" },
    { name: "Danh sách sản phẩm", icon: "fa-solid fa-igloo", path: "adminDashboard" },
    { name: "Danh sách nhân viên", icon: "fa-solid fa-users", path: "staffList" },
    { name: "Danh sách đơn hàng", icon: "fa-solid fa-bag-shopping", path: "ordersBook" },
    { name: "Danh sách người dùng", icon: "fa-solid fa-users", path: "customers" },
    { name: "Danh sách đánh giá", icon: "fa-solid fa-comments", path: "customers" },
    { name: "Thêm sản phẩm", icon: "fa-solid fa-cart-plus", path: "createProducts" },
    { name: "Thêm nhân viên", icon: "fa-solid fa-user-plus", path: "addAdmin" },
    { name: "Phiếu nhập", icon: "fa-solid fa-rectangle-list", path: "entryForm" },
    { name: "Hóa đơn", icon: "fa-solid fa-scroll", path: "billInfo" },
];

const saveStatus = (index) => {
    console.log(index);
    status.value = index;
}
</script>

<template>
    <div class="bg-[#1A1D27] min-h-screen w-[25%] max-w-96 hidden lg:block">
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
</template>


<style scoped>
.active-link {
    background: #DB3F4C;
    color: white;
}
</style>