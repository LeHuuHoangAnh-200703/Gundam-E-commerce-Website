<script setup>
import { ref } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full min-h-screen font-sans">
        <div class="flex gap-3">
            <SideBar />
            <div class="relative p-4 flex flex-col gap-4 w-full overflow-auto">
                <Navbar />
                <div class="flex lg:flex-row flex-col gap-4 justify-center items-center">
                    <h1 class="font-bold text-[20px]">Quản lý chi tiết hóa đơn</h1>
                </div>
                <div class="bg-white rounded-lg shadow-lg w-full lg:w-[70%] mx-auto p-4">
                    <form action="">
                        <div class="w-full flex flex-col lg:flex-row gap-8">
                            <div class="w-full flex flex-col gap-4">
                                <div class="flex flex-col gap-2">
                                    <label for="idBill" class="text-[15px] font-semibold">Mã hóa đơn</label>
                                    <input type="text" id="idBill"
                                        class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                        placeholder="Nhập mã hóa đơn ...">
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label for="idProduct" class="text-[15px] font-semibold">Mã sản phẩm</label>
                                    <input type="text" id="idProduct"
                                        class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                        placeholder="Nhập mã sản phẩm ...">
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label for="quantity" class="text-[15px] font-semibold">Số lượng</label>
                                    <input type="text" id="quantity"
                                        class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                        placeholder="Nhập Số lượng ...">
                                </div>
                                <div class="flex justify-center lg:justify-end">
                                    <button type="submit"
                                        class="px-5 py-2 rounded-md font-semibold text-white text-[14px] bg-[#1A1D27] transition-all duration-300 hover:bg-[#003171]">Thêm chi tiết
                                        hóa đơn</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="overflow-y-auto max-h-[calc(100vh-200px)] shadow-lg rounded-lg border-2 border-gray-300">
                    <table class="w-full bg-white whitespace-nowrap text-center text-gray-500">
                        <thead class="bg-[#1A1D27] text-white">
                            <tr>
                                <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mã hóa đơn</th>
                                <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mã thiết bị</th>
                                <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Số lượng</th>
                                <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Đơn giá</th>
                                <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Điều chỉnh</th>
                            </tr>
                        </thead>
                        <tbody class="w-full">
                            <tr class="border-t border-slate-500">
                                <td class="px-6 py-4 font-medium text-gray-900 text-[12px]">SP3240</td>
                                <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                    1.230.000 VNĐ</td>
                                <td
                                    class="px-6 py-4 whitespace-nowrap text-[12px] text-ellipsis overflow-hidden max-w-40">
                                    <p class="overflow-hidden text-ellipsis whitespace-nowrap">RG 1/144 RX-0 UNICORN
                                        GUNDAM (BILIBILI 10TH ANNIVERSARY VER)</p>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                    1.230.000 VNĐ</td>
                                <td class="flex justify-center items-center gap-2 px-7 py-7 flex-col">
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