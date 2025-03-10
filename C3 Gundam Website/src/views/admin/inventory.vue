<script setup>
import { onMounted, ref, computed } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import axios from "axios";

const inventoryLists = ref([]);
const searchValue = ref("");
const fetchInventory = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/quanlykho');
        inventoryLists.value = response.data.map(inventory => {
            return {
                ...inventory,
                NgayCapNhat: new Date(inventory.NgayCapNhat)
            }
        })
        console.log(inventoryLists.value)
        inventoryLists.value.sort((a, b) => b.NgayCapNhat - a.NgayCapNhat);
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

const findProducts = computed(() => {
    if (!searchValue.value) {
        return inventoryLists.value;
    }

    return inventoryLists.value.filter(product => {
        return product.MaSanPham.toLowerCase().includes(searchValue.value.toLowerCase()) || product.TenSanPham.toLowerCase().includes(searchValue.value.toLowerCase());
    })
})

const formatDate = (date) => {
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' };
    const formattedDate = date.toLocaleString('vi-VN', options);

    const [time, day] = formattedDate.split(', ');
    return `${time}`;
};

function formatCurrency(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

onMounted(() => {
    fetchInventory();
})
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full min-h-screen font-sans">
        <div class="flex gap-3">
            <SideBar />
            <div class="relative p-4 flex flex-col gap-4 w-full overflow-auto">
                <Navbar />
                <div class="w-full relative flex flex-col gap-4 overflow-auto max-h-[calc(100vh-100px)] pb-7">
                    <div class="flex gap-4 justify-between items-center">
                        <div class="flex lg:flex-row flex-col gap-4 justify-center lg:justify-between items-center">
                            <h1 class="font-bold text-[20px] uppercase">Quản lý kho</h1>
                            <div class="relative flex justify-center flex-1 gap-2 max-w-xl">
                                <input type="text" v-model="searchValue"
                                    class="items-center w-full p-3 bg-white border pr-10 border-gray-400 text-[12px] font-semibold tracking-wider text-black rounded-md focus:outline-none"
                                    placeholder="Tìm kiếm sản phẩm ..." />
                                <i
                                    class="fa-solid fa-magnifying-glass absolute top-2 lg:top-3 right-3 text-[22px] text-[#003171]"></i>
                            </div>
                        </div>
                        <router-link to="/admin/listEntryForms"
                            class="bg-[#003171] text-white font-bold w-[50px] h-[50px] rounded-full flex justify-center items-center">
                            <i class="fa-solid fa-plus"></i>
                        </router-link>
                    </div>
                    <div class="shadow-lg rounded-lg border-2 border-gray-300">
                        <table class="w-full bg-white whitespace-nowrap text-center text-gray-500">
                            <thead class="bg-[#1A1D27] text-white">
                                <tr>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">STT</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mã sản phẩm</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Tên sản phẩm</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Số lượng còn lại</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Giá nhập gần nhất</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Ngày cập nhật</th>
                                </tr>
                            </thead>
                            <tbody class="w-full">
                                <tr class="border-t border-slate-500" v-for="(inventory, index) in findProducts"
                                    :key="index">
                                    <td class="px-6 py-4 font-medium text-gray-900 text-[12px]">{{ index + 1 }}</td>
                                    <td class="px-6 py-4 font-medium text-gray-900 text-[12px]">{{ inventory.MaSanPham
                                        }}</td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-[12px] text-ellipsis overflow-hidden max-w-40">
                                        <p class="overflow-hidden text-ellipsis whitespace-nowrap">{{
                                            inventory.TenSanPham }}</p>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">{{
                                        (inventory.SoLuongTon > 0) ?inventory.SoLuongTon : 'Hết hàng' }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">{{
                                        formatCurrency(inventory.GiaNhapGanNhat) }} VNĐ</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">{{
                                        formatDate(inventory.NgayCapNhat) }}</td>
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