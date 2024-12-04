<script setup>
import { ref } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';  
</script>

<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <!-- <h1 class="text-center text-white text-[28px] font-semibold mt-6">Đơn hàng đã mua</h1>
        <div class="relative mb-5 m-2 lg:mx-[200px] flex items-center flex-col flex-grow">
            <div class="w-full m-4">
                <div
                    class="bg-[#242424] flex flex-col mb-5 overflow-hidden px-4 py-3 rounded [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                    <div
                        class="flex flex-col gap-2 lg:flex-row justify-center items-center lg:justify-between text-white font-semibold">
                        <p class="text-[14px] lg:text-[16px]">Ngày đặt hàng: <span
                                class="text-[#FFD700]">20/07/2024</span></p>
                        <p class="text-[14px] lg:text-[16px] text-[#FFD700] text-center lg:text-start"><i
                                class="fa-solid fa-truck-fast"></i> Đơn hàng đã được chuyển đi và sẽ sớm đến bạn</p>
                    </div>
                    <hr class="my-3">
                    <div class="flex gap-4 border-b-2 pb-4 mb-3">
                        <img src="../../assets/img/RG01.jpg" class="w-[100px]" alt="">
                        <div class="flex flex-col gap-1">
                            <div class="w-44 block lg:hidden whitespace-nowrap text-ellipsis overflow-hidden">
                                <p class="text-white text-[14px] overflow-hidden text-ellipsis whitespace-nowrap">RG
                                    1/144 RX-0 UNICORN GUNDAM
                                    (BILIBILI
                                    10TH ANNIVERSARY VER)</p>
                            </div>
                            <p class="text-[14px] text-white font-medium hidden lg:block">RG 1/144 RX-0 UNICORN GUNDAM (BILIBILI 10TH
                                ANNIVERSARY VER)</p>
                            <p class="text-[14px] text-white font-medium">Loại sản phẩm: RG</p>
                            <p class="text-[14px] text-white font-medium">Đơn giá: <span
                                    class="text-[#FFD700]">2.350.000 VNĐ</span></p>
                            <p class="text-[14px] text-white font-medium">Số lượng: <span
                                    class="text-[#FFD700]">2</span></p>
                        </div>
                    </div>
                    <div class="flex gap-4 border-b-2 pb-4 mb-3">
                        <img src="../../assets/img/RG01.jpg" class="w-[100px]" alt="">
                        <div class="flex flex-col gap-1">
                            <div class="w-44 block lg:hidden whitespace-nowrap text-ellipsis overflow-hidden">
                                <p class="text-white text-[14px] overflow-hidden text-ellipsis whitespace-nowrap">RG
                                    1/144 RX-0 UNICORN GUNDAM
                                    (BILIBILI
                                    10TH ANNIVERSARY VER)</p>
                            </div>
                            <p class="text-[14px] text-white font-medium hidden lg:block">RG 1/144 RX-0 UNICORN GUNDAM (BILIBILI 10TH
                                ANNIVERSARY VER)</p>
                            <p class="text-[14px] text-white font-medium">Loại sản phẩm: RG</p>
                            <p class="text-[14px] text-white font-medium">Đơn giá: <span
                                    class="text-[#FFD700]">2.350.000 VNĐ</span></p>
                            <p class="text-[14px] text-white font-medium">Số lượng: <span
                                    class="text-[#FFD700]">2</span></p>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2 lg:flex-row justify-center items-center lg:justify-between text-white font-semibold mb-4">
                        <p class="text-[14px] lg:text-[16px] text-center lg:text-start">Lưu ý: <span class="text-[#FFD700]">Đơn hàng chỉ được hủy khi chưa được chuyển đi</span></p>
                        <p class="text-[14px] lg:text-[16px] text-center lg:text-start">Tổng tiền: <span class="text-[#FFD700]">4.360.000 VNĐ</span></p>
                    </div>
                    <button class="bg-[#DB3F4C] px-5 py-2 rounded-md text-white self-end w-auto">Hủy đơn hàng</button>
                </div>
            </div>
        </div> -->
        <div class="flex justify-center items-center m-auto w-full">
            <div class="flex flex-col items-center justify-center gap-3">
                <p class="font-semibold text-white text-[18px] lg:text-[24px] text-center">Hiện tại không có đơn hàng nào!</p>
                <img src="../../assets/img/banner.png" class="w-[200px]" alt="">
            </div>
        </div>
        <Footer />
        <BackToTop />
    </div>
</template>

<style scoped></style>