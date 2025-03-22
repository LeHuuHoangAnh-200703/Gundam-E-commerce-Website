<script setup>
import { ref, computed, onMounted } from "vue";
const status = ref(0);
const sidebarMenu = [
    { name: "Thống kê", icon: "fa-solid fa-chart-simple", path: "statisticals" },
    { name: "Quản lý sản phẩm", icon: "fa-solid fa-igloo", path: "adminProducts" },
    { name: "Quản lý đơn hàng", icon: "fa-solid fa-bag-shopping", path: "listOrders" },
    { name: "Quản lý đánh giá", icon: "fa-solid fa-comments", path: "listFeedBacks" },
    { name: "Quản lý khách hàng", icon: "fa-solid fa-users", path: "customers" },
    { name: "Quản lý nhà cung cấp", icon: "fa-solid fa-user-large", path: "listSuppliers" },
    { name: "Quản lý mã giảm giá", icon: "fa-solid fa-tags", path: "discountCode" },
    { name: "Thêm sản phẩm", icon: "fa-solid fa-cart-plus", path: "addProduct" },
    // { name: "Thêm tài khoản", icon: "fa-solid fa-user-plus", path: "addAdmin" },
    { name: "Quản lý kho", icon: "fa-solid fa-rectangle-list", path: "inventoryLits" },
];

const saveStatus = (index) => {
    status.value = index;
    localStorage.setItem("sidebarStatus", index);
};

onMounted(() => {
    const savedStatus = localStorage.getItem("sidebarStatus");
    if (savedStatus !== null) {
        status.value = parseInt(savedStatus);
    }
});
</script>

<template>
    <div class="bg-[#1A1D27] min-h-screen w-[25%] max-w-96 hidden lg:block">
        <p class="p-8 font-bold text-white text-center text-[18px] font-bungee"><span class="text-[#DB3F4C]">C3
            </span>
            Gundam Store</p>
        <hr class="mb-8 mx-8">
        <ul class="flex flex-col space-y-2 text-[12px] font-semibold px-8 text-white mb-8">
            <router-link :to="sidebar.path" v-for="(sidebar, index) in sidebarMenu" :key="index" @click="saveStatus(index)"
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