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
                <div class="w-full relative flex flex-col gap-4 overflow-auto max-h-[calc(100vh-100px)] pb-7">
                    <div class="flex lg:flex-row flex-col gap-4 justify-center items-center">
                        <h1 class="font-bold text-[20px]">Quản lý mã giảm giá</h1>
                    </div>
                    <div class="bg-white rounded-lg shadow-lg w-full lg:w-[70%] mx-auto p-4">
                        <form action="">
                            <div class="w-full flex flex-col lg:flex-row gap-8">
                                <div class="w-full flex flex-col gap-4">
                                    <div class="flex flex-col gap-2">
                                        <label for="nameDiscountCode" class="text-[15px] font-semibold">Tên mã giảm
                                            giá</label>
                                        <input type="text" id="nameDiscountCode"
                                            class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            placeholder="Nhập tên mã giảm giá ...">
                                    </div>
                                    <div class="flex flex-col gap-2">
                                        <label for="optionDiscountCode" class="text-[15px] font-semibold">Áp dụng với
                                            đơn</label>
                                        <select
                                            class="p-2 border-2 cursor-pointer text-[#003171] rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            name="" id="optionDiscountCode">
                                            <option value="6000" class="text-[#003171] font-semibold">
                                                6.000.000 VNĐ</option>
                                            <option value="3000" class="text-[#003171] font-semibold">3.000.000 VNĐ
                                            </option>
                                            <option value="1500" class="text-[#003171] font-semibold">1.500.000 VNĐ
                                            </option>
                                            <option value="500" class="text-[#003171] font-semibold">500.000 VNĐ
                                            </option>
                                        </select>
                                    </div>
                                    <div class="flex gap-4">
                                        <div class="flex flex-col gap-2 w-full">
                                            <label for="priceDiscountCode" class="text-[15px] font-semibold">Giảm với số
                                                tiền</label>
                                            <input type="text" id="priceDiscountCode"
                                                class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                                placeholder="Nhập số tiền giảm ...">
                                        </div>
                                        <div class="flex flex-col gap-2 w-full">
                                            <label for="percentDiscountCode" class="text-[15px] font-semibold">Giảm với
                                                %</label>
                                            <input type="text" id="percentDiscountCode"
                                                class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                                placeholder="Nhập số % giảm ...">
                                        </div>
                                    </div>
                                    <div class="flex gap-4">
                                        <div class="flex flex-col gap-2 w-full">
                                            <label for="timeUsed" class="text-[15px] font-semibold">Số lượt sử
                                                dụng</label>
                                            <input type="text" id="timeUsed"
                                                class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                                placeholder="Nhập số lượt sử dụng ...">
                                        </div>
                                        <div class="flex flex-col gap-2 w-full">
                                            <label for="date" class="text-[15px] font-semibold">Ngày hết hạn</label>
                                            <input type="date" id="date"
                                                class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]">
                                        </div>
                                    </div>
                                    <div class="flex flex-col gap-2">
                                        <label for="discountCode" class="text-[15px] font-semibold">Mã giảm giá</label>
                                        <input type="text" id="discountCode"
                                            class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            placeholder="Nhập mã giảm giá ...">
                                    </div>
                                    <div class="flex justify-center lg:justify-end">
                                        <button type="submit"
                                            class="px-5 py-2 rounded-md font-semibold text-white text-[14px] bg-[#1A1D27] transition-all duration-300 hover:bg-[#003171]">Thêm
                                            mã giảm giá</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="p-4 rounded-lg flex flex-col gap-6">
                        <h1 class="font-bold text-[20px]">Danh sách mã giảm giá</h1>
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div class="flex flex-col gap-1 border-t-4 border-[#DB3F4C] bg-white p-4 shadow-lg">
                                <p class="font-bold text-[22px]">Mã giả giá nhân dịp giáng sinh</p>
                                <p class="font-semibold text-[#DB3F4C] text-[20px]">Giảm 30%</p>
                                <div class="flex lg:flex-row flex-col lg:justify-between">
                                    <p class="font-semibold text-[14px]">Hạn sử dụng: 20-07-2024</p>
                                    <p class="font-semibold text-[14px]">Số lượt sử dụng: 10</p>
                                </div>
                                <p class="font-semibold text-[14px]">Áp dụng với đơn: <span
                                        class="text-[#DB3F4C]">6.000.000
                                        VNĐ</span></p>
                                <p class="font-semibold text-[14px]">Mã giảm giá: <span
                                        class="text-[#DB3F4C] uppercase">C3Christmas</span></p>
                                <div class="flex justify-end gap-4 mt-3">
                                    <a href=""
                                        class="bg-[#00697F] text-white px-4 py-3 rounded-md transition-all duration-300 hover:bg-[#055565]"><i
                                            class="fa-solid fa-pen-to-square"></i></a>
                                    <form>
                                        <button type="submit"
                                            class="text-white bg-[#DC143C] px-4 py-3 rounded-md transition-all duration-300 hover:bg-[#B22222]"><i
                                                class="fa-solid fa-trash"></i></button>
                                    </form>
                                </div>
                            </div>
                            <div class="flex flex-col gap-1 border-t-4 border-[#DB3F4C] bg-white p-4 shadow-lg">
                                <p class="font-bold text-[22px]">Mã giả giá nhân dịp giáng sinh</p>
                                <p class="font-semibold text-[#DB3F4C] text-[20px]">Giảm 100k</p>
                                <div class="flex lg:flex-row flex-col lg:justify-between">
                                    <p class="font-semibold text-[14px]">Hạn sử dụng: 20-07-2024</p>
                                    <p class="font-semibold text-[14px]">Số lượt sử dụng: 10</p>
                                </div>
                                <p class="font-semibold text-[14px]">Áp dụng với đơn: <span
                                        class="text-[#DB3F4C]">3.000.000
                                        VNĐ</span></p>
                                <p class="font-semibold text-[14px]">Mã giảm giá: <span
                                        class="text-[#DB3F4C] uppercase">C3Christmas</span></p>
                                <div class="flex justify-end gap-4 mt-3">
                                    <a href=""
                                        class="bg-[#00697F] text-white px-4 py-3 rounded-md transition-all duration-300 hover:bg-[#055565]"><i
                                            class="fa-solid fa-pen-to-square"></i></a>
                                    <form>
                                        <button type="submit"
                                            class="text-white bg-[#DC143C] px-4 py-3 rounded-md transition-all duration-300 hover:bg-[#B22222]"><i
                                                class="fa-solid fa-trash"></i></button>
                                    </form>
                                </div>
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