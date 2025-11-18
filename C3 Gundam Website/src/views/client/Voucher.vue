<script setup>
import { ref, onMounted, computed } from "vue"
import Header from "@/components/client/Header.vue";
import Footer from "@/components/client/Footer.vue";
import BackToTop from "@/components/client/BackToTop.vue";
import axios from 'axios';
import { useRouter } from 'vue-router';
import NotificationClient from "@/components/Notification/NotificationClient.vue";
import EmtyState from '@/components/Notification/EmtyState.vue';
import Chat from '../../components/client/Chat.vue';
import ChatBot from '../../components/client/ChatBot.vue';

const router = useRouter();

// --- CẤU HÌNH URL ĐỘNG ---
// Tự động nhận diện môi trường: Netlify (Production) hoặc Localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// -------------------------

const listDiscountCodes = ref([]);
const notification = ref({
    message: '',
    type: ''
});
const showNotification = (msg, type) => {
    notification.value = { message: msg, type: type };
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
};

function formatCurrency(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const fetchDiscountCode = async () => {
    try {
        // SỬA 1: Dùng API_URL
        const response = await axios.get(`${API_URL}/api/magiamgia`);
        listDiscountCodes.value = response.data.map(discountCode => {
            return {
                ...discountCode,
                NgayHetHan: new Date(discountCode.NgayHetHan),
                NgayTao: new Date(discountCode.NgayTao),
            }
        })
        listDiscountCodes.value.sort((a, b) => b.NgayTao - a.NgayTao);
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

const saveDiscountCode = async (IdMaGiamGia) => {
    const MaKhachHang = localStorage.getItem("MaKhachHang");
    try {
        // SỬA 2: Dùng API_URL
        const response = await axios.post(`${API_URL}/api/khachhang/luuma/${MaKhachHang}/${IdMaGiamGia}`);
        showNotification("Lưu mã giảm giá thành công!", "success");
        setTimeout(() => {
            router.push('/voucher');
        }, 1000);
        await fetchDiscountCode();
    } catch (error) {
        showNotification(error.response?.data?.message || "Lưu mã giảm giá thất bại!", "error");
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}

const validDiscountCodes = computed(() => {
    return listDiscountCodes.value.filter(discountCode =>
        new Date(discountCode.NgayHetHan) >= new Date()
    );
});

onMounted(() => {
    fetchDiscountCode();
})
</script>

<template>
    <div
        class="bg-gradient-to-br from-[#0F1419] via-[#1A1D27] to-[#0F1419] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="w-full bg-[#DB3F4C] flex-grow">
            <div
                class="flex lg:flex-row flex-col justify-center items-center lg:justify-between w-full p-5 lg:px-[210px]">
                <div class="flex flex-col gap-3 w-full lg:w-[50%] justify-center lg:justify-start items-start">
                    <div
                        class="bg-black/40 backdrop-blur-sm text-white text-sm px-4 py-2 font-medium rounded-full border border-white/20 transition-all duration-300 hover:bg-black/50">
                        <span class="text-red-300 animate-pulse">●</span> C3 GUNDAM STORE
                    </div>
                    <h1 class="text-white font-bold text-2xl lg:text-3xl drop-shadow-lg">
                        Nhận ngay mã giảm giá, <br>
                        <span class="text-yellow-300">Hãy xây dựng thế giới Gundam</span> <br>
                        của riêng bạn
                    </h1>
                    <div class="flex items-center gap-4 w-full">
                        <div
                            class="h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex-1 max-w-[200px]">
                        </div>
                        <div class="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                    <p class="text-white text-[14px] font-medium">Cửa hàng Gundam không chỉ là nơi bày bán mô hình, mà
                        còn là không gian nuôi dưỡng đam mê, nơi giấc mơ về những chiến binh cơ khí trở thành hiện thực.
                    </p>
                    <div class="flex items-center gap-3 text-white">
                        <i class="fa-solid fa-location-dot text-yellow-400"></i>
                        <span class="text-sm lg:text-base font-semibold">Đường 96 - Tân Phú - TX.Long Mỹ - Hậu
                            Giang</span>
                    </div>
                </div>
                <div class="w-full lg:w-[50%] flex justify-center lg:justify-end relative">
                    <div class="absolute inset-0 opacity-10">
                        <div class="w-full h-full bg-gradient-to-br from-white/5 to-transparent"></div>
                    </div>
                    <div class="relative">
                        <div
                            class="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-2xl blur-2xl -z-10 scale-110">
                        </div>
                        <div class="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                            <img src="../../assets/img/Banner_Voucher.png" alt="C3 Gundam Store Logo"
                                class="w-[300px] lg:w-[320px] rounded-xl drop-shadow-xl transition-all duration-300 hover:scale-105" />
                        </div>
                        <div class="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400/80 rounded-full animate-pulse"></div>
                        <div class="absolute -bottom-4 -left-4 w-6 h-6 bg-orange-400/80 rounded-full animate-pulse"
                            style="animation-delay: 1s;"></div>
                        <div
                            class="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-yellow-400/40 rounded-tr-2xl">
                        </div>
                        <div
                            class="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-orange-400/40 rounded-bl-2xl">
                        </div>
                    </div>
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
            <img src="../../assets/img/voucher.png" class="w-[100px]" alt="">
        </div>
        <div v-if="validDiscountCodes.length > 0" class="flex flex-col gap-4 lg:mx-[210px] mt-2 mb-20 p-5 lg:p-0">
            <h1 class="font-bold text-[20px] uppercase text-white">Danh sách mã giảm giá</h1>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                <div v-for="(discountCode, index) in validDiscountCodes" :key="index"
                    class="flex flex-col gap-1 border-t-4 border-[#DB3F4C] bg-white p-4 shadow-lg w-full">
                    <div class="flex justify-between items-center">
                        <p class="font-bold text-[20px]">{{ discountCode.TenMaGiamGia }}</p>
                        <div
                            class="w-[30px] h-[30px] rounded-full border-2 border-[#1A1D27] flex justify-center items-center">
                            <p class="text-[#1A1D27] text-[14px] font-bold">{{ discountCode.SoLanLuuMa }}</p>
                        </div>
                    </div>
                    <p v-if="discountCode.GiamTien" class="font-semibold text-[#DB3F4C] text-[20px]">Giảm {{
                        formatCurrency(discountCode.GiamTien) }} <span class="text-[16px] relative -top-[2px] underline">đ</span></p>
                    <p v-else class="font-semibold text-[#DB3F4C] text-[20px]">Giảm {{
                        discountCode.GiamPhanTram }}%</p>
                    <div class="flex justify-between items-center">
                        <div class="flex flex-col gap-1">
                            <div class="flex gap-1 lg:flex-row flex-col lg:justify-between">
                                <p class="font-semibold text-[14px]">Hạn sử dụng: {{ new
                                    Date(discountCode.NgayHetHan) < new Date() ? 'Hết hạn' :
                                    discountCode.NgayHetHan.toLocaleDateString('vi-VN') }}</p>
                            </div>
                            <p class="font-semibold text-[14px]">Áp dụng với đơn: <span class="text-[#DB3F4C]">{{
                                formatCurrency(discountCode.GiaApDung) }} <span class="text-[14px] relative -top-[2px] underline">đ</span></span></p>
                        </div>
                        <button @click.prevent="saveDiscountCode(discountCode.IdMaGiamGia)"
                            class="w-[40px] h-[40px] border-2 border-[#1A1D27] flex justify-center items-center self-end rounded-lg hover:border-[#DB3F4C] hover:bg-[#DB3F4C] transition-all duration-300 group"><i
                                class="fa-solid fa-floppy-disk text-[#1A1D27] text-[20px] group-hover:text-white transition-all duration-300"></i></button>
                    </div>
                </div>
            </div>
        </div>
        <EmtyState v-else icon="fa-tags" title="Chưa có mã giảm giá nào" message="Hiện tại chưa có mã giảm giá nào khả dụng.
                        Hãy theo dõi để không bỏ lỡ những ưu đãi hấp dẫn sắp tới!" />
        <Footer />
        <BackToTop />
        <Chat />
        <ChatBot />
        <NotificationClient :message="notification.message" :type="notification.type" />
    </div>
</template>