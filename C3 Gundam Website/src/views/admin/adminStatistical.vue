<script setup>
import { ref, onMounted } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import axios from "axios";

const customers = ref([]);
const products = ref([]);
const orders = ref([]);
const feedbacks = ref([]);
const fetchStatistical = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/thongke');
        customers.value = response.data.customer;
        products.value = response.data.product;
        feedbacks.value = response.data.feedback;
        // Chuyển object `order` thành array
        const ordersArray = Object.values(response.data.order);
        orders.value = ordersArray.filter(order => order.TrangThaiDon !== "Đã giao thành công");
        console.log(orders.value)
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

onMounted(() => {
    fetchStatistical();
})
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full min-h-screen font-sans">
        <div class="flex gap-3">
            <SideBar />
            <div class="relative p-4 flex flex-col gap-4 w-full overflow-auto">
                <Navbar />
                <div class="w-full relative flex flex-col gap-4 overflow-auto max-h-[calc(100vh-100px)] pb-7">
                    <div class="flex gap-4 w-full lg:flex-row flex-col">
                        <div class="text-white rounded-md shadow-md bg-[#DB3F4C] w-full lg:w-[25%]">
                            <div class="flex justify-between px-4 pt-4 w-full items-center">
                                <i class="fa-solid fa-igloo text-[30px]"></i>
                                <div class="flex flex-col items-end">
                                    <p class="text-[24px] font-bold">{{ products.length }}</p>
                                    <p class="text-[14px] font-semibold">Sản phẩm</p>
                                </div>
                            </div>
                            <div class="mt-6 w-full text-center bg-[#333]/30 rounded-b-md p-2">
                                <router-link to="/admin/adminProducts" class="font-semibold text-[12px]">Xem chi tiết</router-link>
                            </div>
                        </div>
                        <div class="text-white rounded-md shadow-md bg-[#4C47AF] w-full lg:w-[25%]">
                            <div class="flex justify-between px-4 pt-4 w-full items-center">
                                <i class="fa-solid fa-bag-shopping text-[30px]"></i>
                                <div class="flex flex-col items-end">
                                    <p class="text-[24px] font-bold">{{ orders.length }}</p>
                                    <p class="text-[14px] font-semibold">Đơn hàng đã và đang xử lý</p>
                                </div>
                            </div>
                            <div class="mt-6 w-full text-center bg-[#333]/30 rounded-b-md p-2">
                                <router-link to="/admin/listOrders" class="font-semibold text-[12px]">Xem chi tiết</router-link>
                            </div>
                        </div>
                        <div class="text-white rounded-md shadow-md bg-[#DA70D6] w-full lg:w-[25%]">
                            <div class="flex justify-between px-4 pt-4 w-full items-center">
                                <i class="fa-solid fa-comments text-[30px]"></i>
                                <div class="flex flex-col items-end">
                                    <p class="text-[24px] font-bold">{{ feedbacks.length }}</p>
                                    <p class="text-[14px] font-semibold">Đánh giá sản phẩm</p>
                                </div>
                            </div>
                            <div class="mt-6 w-full text-center bg-[#333]/30 rounded-b-md p-2">
                                <router-link to="/admin/listFeedBacks" class="font-semibold text-[12px]">Xem chi tiết</router-link>
                            </div>
                        </div>
                        <div class="text-white rounded-md shadow-md bg-[#008B8B] w-full lg:w-[25%]">
                            <div class="flex justify-between px-4 pt-4 w-full items-center">
                                <i class="fa-solid fa-users text-[30px]"></i>
                                <div class="flex flex-col items-end">
                                    <p class="text-[24px] font-bold">{{ customers.length }}</p>
                                    <p class="text-[14px] font-semibold">Khách hàng đã tham gia</p>
                                </div>
                            </div>
                            <div class="mt-6 w-full text-center bg-[#333]/30 rounded-b-md p-2">
                                <router-link to="/admin/customers" class="font-semibold text-[12px]">Xem chi tiết</router-link>
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