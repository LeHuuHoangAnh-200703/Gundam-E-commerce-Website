<script setup>
import { ref } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";

const options = [
    {
        name: "Đang chờ xác nhận",
        icon: "fa-solid fa-wallet"
    },
    {
        name: "Đang chờ lấy hàng",
        icon: "fa-solid fa-box"
    },
    {
        name: "Đã được chuyển đi",
        icon: "fa-solid fa-truck-fast"
    },
    {
        name: "Đã nhận được hàng",
        icon: "fa-solid fa-thumbs-up"
    },
]
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full min-h-screen font-sans">
        <div class="flex gap-3">
            <SideBar />
            <div class="relative p-4 flex flex-col gap-4 w-full overflow-auto">
                <Navbar />
                <div class="flex lg:flex-row flex-col gap-4 justify-center lg:justify-between items-center">
                    <h1 class="font-bold text-[20px]">Danh sách đơn hàng</h1>
                </div>
                <div class="w-full flex lg:flex-row flex-col gap-8 items-start">
                    <div class="flex flex-col gap-5 bg-white p-4 rounded-lg shadow-lg w-full lg:w-1/3">
                        <div class="flex flex-col gap-2">
                            <p class="font-semibold text-[18px]">Điều chỉnh đơn hàng</p>
                            <button v-for="option in options" :key="option"
                                class="border-2 px-5 py-3 flex justify-start items-center gap-4 rounded-md hover:border-[#003171] transition-all duration-300">
                                <i :class="option.icon"></i> {{ option.name }}
                            </button>
                        </div>
                    </div>
                    <div class="flex flex-col gap-8 w-full overflow-y-auto max-h-[calc(100vh-200px)]">
                        <div class="bg-white p-4 w-full border-2 rounded-lg shadow-lg flex flex-col gap-4">
                            <div class="flex flex-col lg:flex-row items-center justify-center lg:justify-between">
                                <p class="text-[14px] font-semibold">Ngày đặt hàng: <span
                                        class="text-[#003171]">20-07-2024</span></p>
                                <p class="text-[14px] font-semibold">Đang chờ xác nhận</p>
                            </div>
                            <hr>
                            <div class="overflow-y-auto max-h-[250px] flex flex-col gap-4">
                                <div class="flex gap-4 border-b-2 pb-4 mb-3">
                                    <img src="../../assets/img/RG01.jpg" class="w-[100px]" alt="">
                                    <div class="flex flex-col gap-1">
                                        <div
                                            class="w-44 block lg:hidden whitespace-nowrap text-ellipsis overflow-hidden">
                                            <p
                                                class="text-[14px] overflow-hidden font-semibold text-ellipsis whitespace-nowrap">
                                                RG
                                                1/144 RX-0 UNICORN GUNDAM
                                                (BILIBILI
                                                10TH ANNIVERSARY VER)</p>
                                        </div>
                                        <p class="text-[14px] font-semibold hidden lg:block">RG 1/144 RX-0
                                            UNICORN
                                            GUNDAM
                                            (BILIBILI 10TH
                                            ANNIVERSARY VER)</p>
                                        <p class="text-[14px] font-medium">Loại sản phẩm: RG</p>
                                        <p class="text-[14px] font-medium">Đơn giá: <span
                                                class="text-[#003171]">2.350.000 VNĐ</span></p>
                                        <p class="text-[14px] font-medium">Số lượng: <span
                                                class="text-[#003171]">2</span></p>
                                    </div>
                                </div>
                                <div class="flex gap-4 border-b-2 pb-4 mb-3">
                                    <img src="../../assets/img/RG01.jpg" class="w-[100px]" alt="">
                                    <div class="flex flex-col gap-1">
                                        <div
                                            class="w-44 block lg:hidden whitespace-nowrap text-ellipsis overflow-hidden">
                                            <p
                                                class="text-[14px] overflow-hidden font-semibold text-ellipsis whitespace-nowrap">
                                                RG
                                                1/144 RX-0 UNICORN GUNDAM
                                                (BILIBILI
                                                10TH ANNIVERSARY VER)</p>
                                        </div>
                                        <p class="text-[14px] font-semibold hidden lg:block">RG 1/144 RX-0
                                            UNICORN
                                            GUNDAM
                                            (BILIBILI 10TH
                                            ANNIVERSARY VER)</p>
                                        <p class="text-[14px] font-medium">Loại sản phẩm: RG</p>
                                        <p class="text-[14px] font-medium">Đơn giá: <span
                                                class="text-[#003171]">2.350.000 VNĐ</span></p>
                                        <p class="text-[14px] font-medium">Số lượng: <span
                                                class="text-[#003171]">2</span></p>
                                    </div>
                                </div>
                                <div class="flex gap-4 border-b-2 pb-4 mb-3">
                                    <img src="../../assets/img/RG01.jpg" class="w-[100px]" alt="">
                                    <div class="flex flex-col gap-1">
                                        <div
                                            class="w-44 block lg:hidden whitespace-nowrap text-ellipsis overflow-hidden">
                                            <p
                                                class="text-[14px] overflow-hidden font-semibold text-ellipsis whitespace-nowrap">
                                                RG
                                                1/144 RX-0 UNICORN GUNDAM
                                                (BILIBILI
                                                10TH ANNIVERSARY VER)</p>
                                        </div>
                                        <p class="text-[14px] font-semibold hidden lg:block">RG 1/144 RX-0
                                            UNICORN
                                            GUNDAM
                                            (BILIBILI 10TH
                                            ANNIVERSARY VER)</p>
                                        <p class="text-[14px] font-medium">Loại sản phẩm: RG</p>
                                        <p class="text-[14px] font-medium">Đơn giá: <span
                                                class="text-[#003171]">2.350.000 VNĐ</span></p>
                                        <p class="text-[14px] font-medium">Số lượng: <span
                                                class="text-[#003171]">2</span></p>
                                    </div>
                                </div>
                            </div>
                            <div class="flex flex-col gap-3">
                                <h3 class="text-[18px] font-semibold">Thông tin khách hàng</h3>
                                <div class="flex flex-col lg:flex-row lg:justify-between">
                                    <div>
                                        <p class="font-medium text-[14px]">Tên khách hàng: <span class="font-semibold">Hoàng Anh</span></p>
                                        <p class="font-medium text-[14px]">Số điện thoại: <span class="font-semibold">079-965-86594</span></p>
                                        <p class="font-medium text-[14px]">Địa chỉ nhận hàng: <span class="font-semibold">Long Mỹ - Hậu Giang</span></p>
                                        <p class="font-medium text-[14px]">Ghi chú: <span class="font-semibold">Không có</span></p>
                                    </div>
                                    <div>
                                        <p class="font-medium text-[14px]">Hình thức thanh toán: <span class="font-semibold">Ví Paypal</span></p>
                                        <p class="font-medium text-[14px]">Mã giảm giá: <span class="font-semibold">Không có</span></p>
                                        <p class="font-medium text-[14px]">Tổng đơn: <span class="font-semibold text-[#003171]">3.500.000 VNĐ</span></p>
                                    </div>
                                </div>
                            </div>
                            <div class="flex justify-center lg:justify-end">
                                <button class="px-5 py-2 rounded-md font-semibold text-white text-[14px] bg-[#1A1D27] transition-all duration-300 hover:bg-[#003171]">Xác nhận đơn hàng</button>
                            </div>
                        </div>
                        <div class="bg-white p-4 w-full border-2 rounded-lg shadow-lg flex flex-col gap-4">
                            <div class="flex flex-col lg:flex-row items-center justify-center lg:justify-between">
                                <p class="text-[14px] font-semibold">Ngày đặt hàng: <span
                                        class="text-[#003171]">20-07-2024</span></p>
                                <p class="text-[14px] font-semibold">Đang chờ xác nhận</p>
                            </div>
                            <hr>
                            <div class="overflow-y-auto max-h-[250px] flex flex-col gap-4">
                                <div class="flex gap-4 border-b-2 pb-4 mb-3">
                                    <img src="../../assets/img/RG01.jpg" class="w-[100px]" alt="">
                                    <div class="flex flex-col gap-1">
                                        <div
                                            class="w-44 block lg:hidden whitespace-nowrap text-ellipsis overflow-hidden">
                                            <p
                                                class="text-[14px] overflow-hidden font-semibold text-ellipsis whitespace-nowrap">
                                                RG
                                                1/144 RX-0 UNICORN GUNDAM
                                                (BILIBILI
                                                10TH ANNIVERSARY VER)</p>
                                        </div>
                                        <p class="text-[14px] font-semibold hidden lg:block">RG 1/144 RX-0
                                            UNICORN
                                            GUNDAM
                                            (BILIBILI 10TH
                                            ANNIVERSARY VER)</p>
                                        <p class="text-[14px] font-medium">Loại sản phẩm: RG</p>
                                        <p class="text-[14px] font-medium">Đơn giá: <span
                                                class="text-[#003171]">2.350.000 VNĐ</span></p>
                                        <p class="text-[14px] font-medium">Số lượng: <span
                                                class="text-[#003171]">2</span></p>
                                    </div>
                                </div>
                            </div>
                            <div class="flex flex-col gap-3">
                                <h3 class="text-[18px] font-semibold">Thông tin khách hàng</h3>
                                <div class="flex flex-col lg:flex-row lg:justify-between">
                                    <div>
                                        <p class="font-medium text-[14px]">Tên khách hàng: <span class="font-semibold">Hoàng Anh</span></p>
                                        <p class="font-medium text-[14px]">Số điện thoại: <span class="font-semibold">079-965-86594</span></p>
                                        <p class="font-medium text-[14px]">Địa chỉ nhận hàng: <span class="font-semibold">Long Mỹ - Hậu Giang</span></p>
                                        <p class="font-medium text-[14px]">Ghi chú: <span class="font-semibold">Không có</span></p>
                                    </div>
                                    <div>
                                        <p class="font-medium text-[14px]">Hình thức thanh toán: <span class="font-semibold">Ví Paypal</span></p>
                                        <p class="font-medium text-[14px]">Mã giảm giá: <span class="font-semibold">Không có</span></p>
                                        <p class="font-medium text-[14px]">Tổng đơn: <span class="font-semibold text-[#003171]">3.500.000 VNĐ</span></p>
                                    </div>
                                </div>
                            </div>
                            <div class="flex justify-center lg:justify-end">
                                <button class="px-5 py-2 rounded-md font-semibold text-white text-[14px] bg-[#1A1D27] transition-all duration-300 hover:bg-[#003171]">Xác nhận đơn hàng</button>
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