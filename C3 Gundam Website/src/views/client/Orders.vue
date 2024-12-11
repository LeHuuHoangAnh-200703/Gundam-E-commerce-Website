<script setup>
import { ref } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';  
</script>


<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth">
        <Header />
        <div class="relative my-5 m-2 lg:mx-[200px] flex justify-center items-center">
            <div class="w-full m-4">
                <div
                    class="bg-[#242424] overflow-hidden px-6 py-3 rounded [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                    <div class="flex flex-col gap-2 justify-center">
                        <form action="" class="flex flex-col justify-end items-end gap-6">
                            <div class="flex flex-col lg:flex-row gap-8 w-full">
                                <div class="flex flex-col gap-4 w-full lg:w-1/2 text-white lg:border-r-2 lg:pr-10">
                                    <p class="text-white font-semibold text-[20px]">Thông tin mua hàng</p>
                                    <hr>
                                    <div class="w-full">
                                        <label for=""
                                            class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Email</label>
                                        <input type="text" placeholder="test@gmail.com"
                                            class="w-full px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                    </div>
                                    <div class="w-full">
                                        <label for=""
                                            class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Họ
                                            tên</label>
                                        <input type="text" placeholder="Nhập họ tên của bạn ..."
                                            class="w-full px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                    </div>
                                    <div class="w-full flex lg:flex-row flex-col gap-4">
                                        <div class="w-full lg:w-[60%]">
                                            <label for=""
                                                class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Địa
                                                chỉ nhận hàng</label>
                                            <input type="text" placeholder="Nhập địa chỉ ..."
                                                class="w-full px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                        </div>
                                        <div class="w-full lg:w-[40%]">
                                            <label for=""
                                                class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Số
                                                điện thoại</label>
                                            <input type="text" placeholder="079-xxx-xxxx"
                                                class="w-full px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                        </div>
                                    </div>
                                    <div class="w-full">
                                        <label for=""
                                            class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Ghi
                                            chú</label>
                                        <textarea type="text" placeholder="Ghi chú ..."
                                            class="w-full px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                    </div>
                                </div>
                                <div class="flex flex-col gap-4 w-full lg:w-1/2">
                                    <p class="text-white font-semibold text-[20px]">Đơn hàng</p>
                                    <hr>
                                    <div class="flex flex-col gap-4 overflow-hidden">
                                        <div class="overflow-y-auto max-h-[200px] flex flex-col gap-4">
                                            <div class="flex gap-4">
                                                <img src="../../assets/img/RG01.jpg"
                                                    class="w-[50px] lg:w-[80px] border-2" alt="">
                                                <div class="overflow-hidden">
                                                    <div
                                                        class="w-56 block lg:hidden whitespace-nowrap text-ellipsis overflow-hidden">
                                                        <p
                                                            class="text-white text-[14px] overflow-hidden text-ellipsis whitespace-nowrap">
                                                            RG 1/144 RX-0 UNICORN GUNDAM
                                                            (BILIBILI
                                                            10TH ANNIVERSARY VER)</p>
                                                    </div>
                                                    <p class="text-white text-[14px] hidden lg:block">RG 1/144 RX-0
                                                        UNICORN GUNDAM
                                                        (BILIBILI
                                                        10TH ANNIVERSARY VER)</p>
                                                    <p class="text-white text-[14px]">Mã sản phẩm: <span
                                                            class="text-[#FFD700]">SP20234</span></p>
                                                    <div class="flex lg:flex-row flex-col justify-between">
                                                        <p class="text-white text-[14px]">Giá: <span
                                                                class="text-[#FFD700]">2.350.000 VNĐ</span></p>
                                                        <p class="text-white text-[14px]">Số lượng: <span
                                                                class="text-[#FFD700]">2</span></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <hr>
                                        <div class="w-full">
                                            <label for=""
                                                class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Mã
                                                giảm giá</label>
                                            <input type="text" placeholder="Nhập mã giảm giá ..."
                                                class="w-full text-white px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                        </div>
                                        <div class="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                                            <label for="" class="font-semibold text-white mr-4">Hình thức thanh toán:
                                            </label>
                                            <select name="" id=""
                                                class="bg-transparent border-2 px-8 cursor-pointer py-2 text-white rounded-md">
                                                <option class="text-[#333] cursor-pointer" value="Thanh toán khi nhận hàng">Thanh toán khi nhận hàng</option>
                                                <option class="text-[#333] cursor-pointer" value="Thanh toán qua ví Paypal">Thanh toán qua ví Paypal</option>
                                            </select>
                                        </div>
                                        <hr>
                                        <p class="text-white text-[16px] text-end">Tổng cộng: <span
                                                class="text-[#FFD700]">2.350.000 VNĐ</span></p>
                                        <button type="submit"
                                            class="px-6 py-3 bg-[#DB3F4C] rounded-md text-white font-medium self-end w-auto">Đặt
                                            hàng</button>
                                    </div>
                                </div>
                            </div>
                            <!-- <button type="submit" class="px-5 py-3 bg-[#DB3F4C] rounded-md text-white font-medium">Đặt hàng</button> -->
                        </form>
                    </div>
                </div>
            </div>
        </div>
        <Footer />
        <BackToTop />
    </div>
</template>

<style scoped></style>