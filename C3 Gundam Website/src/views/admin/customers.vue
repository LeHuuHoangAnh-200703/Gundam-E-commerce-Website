<script setup>
import { ref, onMounted, computed } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import axios from 'axios';

const listCustomers = ref([]);
const searchValue = ref('');
const fetchCustomers = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/khachhang');
        listCustomers.value = response.data.map(customer => {
            return {
                ...customer,
                NgayTao: new Date(customer.NgayTao)
            }
        }).sort((a,b) => b.TongDonHang - a.TongDonHang);
    } catch (err) {
        console.log("Error fetching: ", err.message);
    }
}

const findNameCustomers = computed(() => {
    if (!searchValue.value) {
        return listCustomers.value;
    }
    return listCustomers.value.filter(customer => {
        return customer.TenKhachHang.toLowerCase().includes(searchValue.value);
    })
})

const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' };
    const formattedDate = date.toLocaleDateString('vi-VN', options);

    return formattedDate;
};

onMounted(() => {
    fetchCustomers();
})
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full h-screen font-sans flex">
        <SideBar />
        <div class="flex-1 flex flex-col h-screen overflow-hidden">
            <div class="flex-shrink-0 p-4">
                <Navbar />
            </div>
            <div class="flex-1 px-4 py-4 overflow-y-auto">
                <div class="flex flex-col gap-4">
                    <div class="flex lg:flex-row flex-col gap-4 justify-center lg:justify-between items-center">
                        <h1 class="font-bold text-[20px] uppercase">Quản lý khách hàng</h1>
                        <div class="relative flex justify-center flex-1 gap-2 max-w-xl">
                            <input type="text" v-model="searchValue"
                                class="items-center w-full p-3 bg-white border pr-10 border-gray-400 text-[12px] font-semibold tracking-wider text-black rounded-md focus:outline-none"
                                placeholder="Tìm kiếm khách hàng theo tên ..." />
                            <i
                                class="fa-solid fa-magnifying-glass absolute top-2 lg:top-3 right-3 text-[22px] text-[#003171]"></i>
                        </div>
                    </div>
                    <div class="shadow-lg border-2 border-gray-300 overflow-auto">
                        <table class="w-full bg-white whitespace-nowrap text-center text-gray-500">
                            <thead class="bg-[#1A1D27] text-white">
                                <tr>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">STT</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mã khách hàng</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Tên khách hàng</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Email</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Ngày tham gia</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Tổng đơn hàng</th>
                                </tr>
                            </thead>
                            <tbody class="w-full">
                                <tr class="border-t border-slate-500" v-for="(customer, index) in findNameCustomers"
                                    :key="index">
                                    <td class="px-6 py-4 font-medium text-gray-900 text-[12px]">{{ index + 1 }}</td>
                                    <td class="px-6 py-4 font-medium text-gray-900 text-[12px]">{{ customer.MaKhachHang
                                        }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">{{
                                        customer.TenKhachHang }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">{{
                                        customer.Email }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">{{
                                        formatDate(customer.NgayTao) }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">{{
                                        customer.TongDonHang }} đơn hàng</td>
                                </tr>
                            </tbody>
                        </table>
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
</style>