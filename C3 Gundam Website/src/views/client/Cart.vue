<script setup>
import { ref } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';  
</script>


<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <h1 class="text-center text-white text-[28px] font-semibold mt-6">Giỏ hàng của bạn</h1>
        <div class="relative mb-5 m-2 lg:mx-[200px] flex flex-col flex-grow">
            <div class="w-full m-4">
                <div
                    class="bg-[#242424] mb-7 overflow-hidden px-6 py-3 rounded [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                    <div class="flex space-x-[60px] py-3 items-center justify-between">
                        <div class="flex gap-4 items-center">
                            <div class="inline-flex items-center mr-4">
                                <label class="flex items-center cursor-pointer relative">
                                    <input type="checkbox"
                                        class="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-[#DB3F4C] checked:border-[#DB3F4C]"
                                        id="check2" />
                                    <span
                                        class="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20"
                                            fill="currentColor" stroke="currentColor" stroke-width="1">
                                            <path fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd"></path>
                                        </svg>
                                    </span>
                                </label>
                            </div>
                            <img src="../../assets/img/RG01.jpg" class="w-[80px]" alt="">
                            <div class="flex flex-col gap-1 justify-center">
                                <div class="w-72 whitespace-nowrap text-ellipsis overflow-hidden">
                                    <p class="text-white text-[14px] overflow-hidden text-ellipsis whitespace-nowrap">RG
                                        1/144 RX-0 UNICORN GUNDAM
                                        (BILIBILI
                                        10TH ANNIVERSARY VER)</p>
                                </div>
                                <p class="text-[14px] text-white font-medium">Loại sản phẩm: RG</p>
                                <p class="text-[14px] text-white font-medium">Đơn giá: 2.350.000 VNĐ</p>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button
                                class="w-[40px] h-[40px] bg-[#333] rounded-full text-white font-bold hover:bg-[#DB3F4C]">-</button>
                            <input id="quantity" name="total_amount" value="1" style="appearance: textfield;"
                                type="number" min="1"
                                class="text-lg bg-transparent border-gray-600 text-white border-2 rounded-md font-semibold h-10 w-16 text-center" />
                            <button
                                class="w-[40px] h-[40px] bg-[#333] rounded-full text-white font-bold hover:bg-[#DB3F4C]">+</button>
                        </div>
                        <p class="text-[14px] text-white font-medium">Tổng tiền: 2.350.000 VNĐ</p>
                        <form action="" method="POST">
                            <button type="submit"
                                class="w-[40px] h-[40px] bg-[#333] rounded-full text-white font-bold hover:bg-[#DB3F4C]">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </form>
                    </div>
                    <hr>
                    <div class="flex space-x-[60px] py-3 items-center justify-between">
                        <div class="flex gap-4 items-center">
                            <div class="inline-flex items-center mr-4">
                                <label class="flex items-center cursor-pointer relative">
                                    <input type="checkbox"
                                        class="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-[#DB3F4C] checked:border-[#DB3F4C]"
                                        id="check2" />
                                    <span
                                        class="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20"
                                            fill="currentColor" stroke="currentColor" stroke-width="1">
                                            <path fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd"></path>
                                        </svg>
                                    </span>
                                </label>
                            </div>
                            <img src="../../assets/img/RG01.jpg" class="w-[80px]" alt="">
                            <div class="flex flex-col gap-1 justify-center">
                                <div class="w-72 whitespace-nowrap text-ellipsis overflow-hidden">
                                    <p class="text-white text-[14px] overflow-hidden text-ellipsis whitespace-nowrap">RG
                                        1/144 RX-0 UNICORN GUNDAM
                                        (BILIBILI
                                        10TH ANNIVERSARY VER)</p>
                                </div>
                                <p class="text-[14px] text-white font-medium">Loại sản phẩm: RG</p>
                                <p class="text-[14px] text-white font-medium">Đơn giá: 2.350.000 VNĐ</p>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button
                                class="w-[40px] h-[40px] bg-[#333] rounded-full text-white font-bold hover:bg-[#DB3F4C]">-</button>
                            <input id="quantity" name="total_amount" value="1" style="appearance: textfield;"
                                type="number" min="1"
                                class="text-lg bg-transparent border-gray-600 text-white border-2 rounded-md font-semibold h-10 w-16 text-center" />
                            <button
                                class="w-[40px] h-[40px] bg-[#333] rounded-full text-white font-bold hover:bg-[#DB3F4C]">+</button>
                        </div>
                        <p class="text-[14px] text-white font-medium">Tổng tiền: 2.350.000 VNĐ</p>
                        <form action="" method="POST">
                            <button type="submit"
                                class="w-[40px] h-[40px] bg-[#333] rounded-full text-white font-bold hover:bg-[#DB3F4C]">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </form>
                    </div>
                    <hr>
                </div>
                <button type="submit"
                    class="px-6 py-3 bg-[#DB3F4C] rounded-md text-white font-medium self-end w-auto">Đặt
                    hàng</button>
            </div>
        </div>
        <Footer />
        <BackToTop />
    </div>
</template>

<style scoped></style>