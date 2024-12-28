<script setup>
import { ref, onMounted } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import axios from 'axios';

const listProducts = ref([]);

const fectchProducts = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/sanpham');
        listProducts.value = response.data.map(product => {
            return {
                ...product,
            }
        });
    } catch (error) {
        console.error('Error fetching:', error);
    }
}

function formatCurrency(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

onMounted(() => {
    fectchProducts();
})
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full min-h-screen font-sans">
        <div class="flex gap-3">
            <SideBar />
            <div class="relative p-4 flex flex-col gap-4 w-full overflow-auto">
                <Navbar />
                <div class="w-full relative flex flex-col gap-4 overflow-auto max-h-[calc(100vh-120px)] pb-7">
                    <div class="flex lg:flex-row flex-col gap-4 justify-center lg:justify-between items-center">
                        <h1 class="font-bold text-[20px]">Quản lý sản phẩm</h1>
                        <div class="flex justify-center flex-1 gap-2 max-w-xl">
                            <input type="text"
                                class="items-center w-full p-3 bg-white border border-gray-400 text-[12px] font-semibold tracking-wider text-black rounded-md focus:outline-none"
                                placeholder="Tìm kiếm sản phẩm theo tên ..." />
                            <button
                                class="font-bold text-[12px] bg-[#DC143C] text-white px-4 py-2 rounded-md whitespace-nowrap">
                                Tìm kiếm
                            </button>
                        </div>
                    </div>
                    <div
                        class="shadow-lg rounded-lg border-2 border-gray-300">
                        <table class="w-full bg-white whitespace-nowrap text-center text-gray-500">
                            <thead class="bg-[#1A1D27] text-white">
                                <tr>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mã sản phẩm</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Ảnh sản phẩm</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Tên sản phẩm</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Đơn giá</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Loại sản phẩm</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Nhà cung cấp</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Còn lại</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mô tả</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Điều chỉnh</th>
                                </tr>
                            </thead>
                            <tbody class="w-full">
                                <tr class="border-t border-slate-500" v-for="(product, index) in listProducts" :key="index">
                                    <td class="px-6 py-4 font-medium text-gray-900 text-[12px]">{{ product.MaSanPham }}</td>
                                    <td>
                                        <img class="w-[100px] py-2 max-w-full ml-7" :src="`/src/assets/img/${product.Images[3]}`"
                                            alt="Hình ảnh sản phẩm" />
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-[12px] text-ellipsis overflow-hidden max-w-40">
                                        <p class="overflow-hidden text-ellipsis whitespace-nowrap">{{ product.TenSanPham }}</p>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                        {{ formatCurrency(product.GiaBan) }} VNĐ</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">{{ product.LoaiSanPham }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">{{ product.NhaCungCap }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">10
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-[12px] text-ellipsis overflow-hidden max-w-40">
                                        <p class="overflow-hidden text-ellipsis text-[12px] whitespace-nowrap">{{ product.MoTa }}</p>
                                    </td>
                                    <td class="flex justify-center items-center gap-2 px-7 py-7 flex-col">
                                        <a href="`/admin/editProduct/`"
                                            class="inline-block bg-[#00697F] text-white font-medium py-2 px-4 rounded-md transition-all duration-300 hover:bg-[#055565] whitespace-nowrap"><i
                                                class="fa-solid fa-pen-to-square"></i></a>
                                        <form>
                                            <button type="submit"
                                                class="inline-block text-white font-medium bg-[#DC143C] py-2 px-4 mb-4 rounded-md transition-all duration-300 hover:bg-[#B22222] whitespace-nowrap"><i
                                                    class="fa-solid fa-trash"></i></button>
                                        </form>
                                    </td>
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

.fixed {
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
}

.fixed.translate-x-0 {
    transform: translateX(0);
}
</style>