<script setup>
import { ref, onMounted, computed } from "vue"
import Header from "@/components/client/Header.vue";
import Footer from "@/components/client/Footer.vue";
import BackToTop from "@/components/client/BackToTop.vue";
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const chatBox = () => {
    const MaKhachHang = localStorage.getItem('MaKhachHang');
    if (!MaKhachHang) {
        router.push('/login');
    } else {
        router.push('/chatbox');
    }
}

</script>

<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="w-full bg-[#DB3F4C] flex-grow">
            <div
                class="flex lg:flex-row flex-col justify-center items-center lg:justify-between w-full p-5 lg:px-[210px]">
                <div class="flex flex-col gap-3 w-full lg:w-[50%] justify-center lg:justify-start items-start">
                    <p class="bg-[rgba(52,52,52,0.7)] text-white text-[14px] px-3 py-2 font-medium rounded-md">C3 GUNDAM
                        STORE</p>
                    <p class="text-white font-semibold uppercase text-[26px]">C3 GUNDAM STORE - Gắn kết đam mê, xây dựng
                        thế giới Gundam của riêng bạn.</p>
                    <span class="lg:w-[150px] w-full h-1 bg-white"></span>
                    <p class="text-white text-[14px] font-medium">Cửa hàng Gundam không chỉ là nơi bày bán mô hình, mà
                        còn là không gian nuôi dưỡng đam mê, nơi giấc mơ về những chiến binh cơ khí trở thành hiện thực.
                    </p>
                    <p class="text-white text-[14px] font-semibold">Địa chỉ: Đường 96 - Tân Phú - TX.Long Mỹ - Hậu Giang
                    </p>
                </div>
                <div class="w-full lg:w-[50%] flex justify-end">
                    <img src="../../assets/img/voucher.png" class="w-[350px]" alt="">
                </div>
            </div>
        </div>
        <div
            class="flex justify-between items-center flex-col lg:flex-row my-2 bg-gradient-to-b text-center lg:text-start from-[#DB3F4C] to-[#1A1D27] px-5 py-2 lg:mx-[210px]">
            <div>
                <p class="text-white font-semibold uppercase text-[22px] lg:text-[26px]">Voucher hôm nay của cửa hàng.
                </p>
                <p class="text-white font-medium my-1">Số lượng có hạn, chỉ áp dụng phù hợp cho một số đơn hàng thõa
                    điều kiện của voucher.</p>
            </div>
            <img src="../../assets/img/voucher_2.png" class="w-[100px]" alt="">
        </div>
        <div class="flex flex-col gap-4 lg:mx-[210px] mt-2 mb-8 p-5 lg:p-0">
            <h1 class="font-bold text-[20px] uppercase text-white">Danh sách mã giảm giá</h1>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                <div class="flex flex-col gap-1 border-t-4 border-[#DB3F4C] bg-white p-4 shadow-lg w-full">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="font-bold text-[20px]">MỪNG SINH NHẬT 1 TUỔI</p>
                            <!-- <p v-if="discountCode.GiamTien" class="font-semibold text-[#DB3F4C] text-[20px]">Giảm {{
                                    formatCurrency(discountCode.GiamTien) }} VNĐ</p> -->
                        </div>
                        <div class="w-[30px] h-[30px] rounded-full border-2 border-[#1A1D27] flex justify-center items-center">
                            <p class="text-[#1A1D27] text-[14px] font-bold">6</p>
                        </div>
                    </div>
                    <p class="font-semibold text-[#DB3F4C] text-[18px]">Giảm 40%</p>
                    <div class="flex justify-between items-center">
                        <div>
                            <div class="flex gap-1 lg:flex-row flex-col lg:justify-between">
                                <p class="font-semibold text-[14px]">Hạn sử dụng: 20/07/2025</p>
                            </div>
                            <p class="font-semibold text-[14px]">Áp dụng với đơn: <span class="text-[#DB3F4C]">500.000
                                    VNĐ</span></p>
                            <p class="font-semibold text-[14px]">Mã giảm giá: <span
                                    class="text-[#DB3F4C] uppercase">CHAOMUNGBAN</span></p>
                        </div>
                        <button
                            class="w-[40px] h-[40px] border-2 border-[#1A1D27] flex justify-center items-center self-end rounded-lg hover:border-[#DB3F4C] hover:bg-[#DB3F4C] transition-all duration-300 group"><i
                                class="fa-solid fa-floppy-disk text-[#1A1D27] text-[20px] group-hover:text-white transition-all duration-300"></i></button>
                    </div>
                </div>
                <div class="flex flex-col gap-1 border-t-4 border-[#DB3F4C] bg-white p-4 shadow-lg w-full">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="font-bold text-[20px]">MỪNG SINH NHẬT 1 TUỔI</p>
                            <!-- <p v-if="discountCode.GiamTien" class="font-semibold text-[#DB3F4C] text-[20px]">Giảm {{
                                    formatCurrency(discountCode.GiamTien) }} VNĐ</p> -->
                        </div>
                        <div class="w-[30px] h-[30px] rounded-full border-2 border-[#1A1D27] flex justify-center items-center">
                            <p class="text-[#1A1D27] text-[14px] font-bold">6</p>
                        </div>
                    </div>
                    <p class="font-semibold text-[#DB3F4C] text-[18px]">Giảm 40%</p>
                    <div class="flex justify-between items-center">
                        <div>
                            <div class="flex gap-1 lg:flex-row flex-col lg:justify-between">
                                <p class="font-semibold text-[14px]">Hạn sử dụng: 20/07/2025</p>
                            </div>
                            <p class="font-semibold text-[14px]">Áp dụng với đơn: <span class="text-[#DB3F4C]">500.000
                                    VNĐ</span></p>
                            <p class="font-semibold text-[14px]">Mã giảm giá: <span
                                    class="text-[#DB3F4C] uppercase">CHAOMUNGBAN</span></p>
                        </div>
                        <button
                            class="w-[40px] h-[40px] border-2 border-[#1A1D27] flex justify-center items-center self-end rounded-lg hover:border-[#DB3F4C] hover:bg-[#DB3F4C] transition-all duration-300 group"><i
                                class="fa-solid fa-floppy-disk text-[#1A1D27] text-[20px] group-hover:text-white transition-all duration-300"></i></button>
                    </div>
                </div>
                <div class="flex flex-col gap-1 border-t-4 border-[#DB3F4C] bg-white p-4 shadow-lg w-full">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="font-bold text-[20px]">MỪNG SINH NHẬT 1 TUỔI</p>
                            <!-- <p v-if="discountCode.GiamTien" class="font-semibold text-[#DB3F4C] text-[20px]">Giảm {{
                                    formatCurrency(discountCode.GiamTien) }} VNĐ</p> -->
                        </div>
                        <div class="w-[30px] h-[30px] rounded-full border-2 border-[#1A1D27] flex justify-center items-center">
                            <p class="text-[#1A1D27] text-[14px] font-bold">6</p>
                        </div>
                    </div>
                    <p class="font-semibold text-[#DB3F4C] text-[18px]">Giảm 40%</p>
                    <div class="flex justify-between items-center">
                        <div>
                            <div class="flex gap-1 lg:flex-row flex-col lg:justify-between">
                                <p class="font-semibold text-[14px]">Hạn sử dụng: 20/07/2025</p>
                            </div>
                            <p class="font-semibold text-[14px]">Áp dụng với đơn: <span class="text-[#DB3F4C]">500.000
                                    VNĐ</span></p>
                            <p class="font-semibold text-[14px]">Mã giảm giá: <span
                                    class="text-[#DB3F4C] uppercase">CHAOMUNGBAN</span></p>
                        </div>
                        <button
                            class="w-[40px] h-[40px] border-2 border-[#1A1D27] flex justify-center items-center self-end rounded-lg hover:border-[#DB3F4C] hover:bg-[#DB3F4C] transition-all duration-300 group"><i
                                class="fa-solid fa-floppy-disk text-[#1A1D27] text-[20px] group-hover:text-white transition-all duration-300"></i></button>
                    </div>
                </div>
            </div>
        </div>
        <Footer />
        <BackToTop />
        <button @click.prevent="chatBox" to="/chatbox"
            class="fixed bottom-32 right-10 flex justify-center items-center [box-shadow:0px_0px_10px_rgba(255,255,255,0.8)] bg-[#003171] border-2 rounded-full w-[50px] h-[50px]">
            <i class="fa-solid fa-comments text-white"></i>
        </button>
    </div>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.5s ease;
}

.slide-fade-enter,
.slide-fade-leave-to {
    transform: translateX(100%);
    opacity: 0;
}
</style>