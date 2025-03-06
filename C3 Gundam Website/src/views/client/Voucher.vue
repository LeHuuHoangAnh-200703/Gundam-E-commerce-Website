<script setup>
import { ref, onMounted, computed } from "vue"
import Header from "@/components/client/Header.vue";
import Footer from "@/components/client/Footer.vue";
import BackToTop from "@/components/client/BackToTop.vue";
import axios from 'axios';
import { useRouter } from 'vue-router';
import NotificationClient from "@/components/Notification/NotificationClient.vue";

const router = useRouter();
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
const chatBox = () => {
    const MaKhachHang = localStorage.getItem('MaKhachHang');
    if (!MaKhachHang) {
        router.push('/login');
    } else {
        router.push('/chatbox');
    }
}

function formatCurrency(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const fetchDiscountCode = async () => {
    try {
        const response = await axios.get("http://localhost:3000/api/magiamgia");
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
        const response = await axios.post(`http://localhost:3000/api/khachhang/luuma/${MaKhachHang}/${IdMaGiamGia}`);
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
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="w-full bg-[#DB3F4C] flex-grow">
            <div
                class="flex lg:flex-row flex-col justify-center items-center lg:justify-between w-full p-5 lg:px-[210px]">
                <div class="flex flex-col gap-3 w-full lg:w-[50%] justify-center lg:justify-start items-start">
                    <p class="bg-[rgba(52,52,52,0.7)] text-white text-[14px] px-3 py-2 font-medium rounded-md">C3 GUNDAM
                        STORE</p>
                    <p class="text-white font-semibold uppercase text-[26px]">C3 GUNDAM STORE - Nhận ngay mã giảm giá để
                        xây dựng thế giới Gundam của riêng bạn!</p>
                    <span class="lg:w-[150px] w-full h-1 bg-white"></span>
                    <p class="text-white text-[14px] font-medium">Cửa hàng Gundam không chỉ là nơi bày bán mô hình, mà
                        còn là không gian nuôi dưỡng đam mê, nơi giấc mơ về những chiến binh cơ khí trở thành hiện thực.
                    </p>
                    <p class="text-white text-[14px] font-semibold">Địa chỉ: Đường 96 - Tân Phú - TX.Long Mỹ - Hậu Giang
                    </p>
                </div>
                <div class="w-full lg:w-[50%] flex justify-end">
                    <img src="https://res.cloudinary.com/dwcajbc6f/image/upload/v1739607250/voucher_jnfndb.png" class="w-[350px]" alt="">
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
            <img src="https://res.cloudinary.com/dwcajbc6f/image/upload/v1739607250/voucher_2_l2owyn.png" class="w-[100px]" alt="">
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
                        formatCurrency(discountCode.GiamTien) }} VNĐ</p>
                    <p v-else class="font-semibold text-[#DB3F4C] text-[20px]">Giảm {{
                        discountCode.GiamPhanTram }}%</p>
                    <div class="flex justify-between items-center">
                        <div>
                            <div class="flex gap-1 lg:flex-row flex-col lg:justify-between">
                                <p class="font-semibold text-[14px]">Hạn sử dụng: {{ new
                                    Date(discountCode.NgayHetHan) < new Date() ? 'Hết hạn' :
                                    discountCode.NgayHetHan.toLocaleDateString('vi-VN') }}</p>
                            </div>
                            <p class="font-semibold text-[14px]">Áp dụng với đơn: <span class="text-[#DB3F4C]">{{
                                    formatCurrency(discountCode.GiaApDung) }} VNĐ</span></p>
                            <p class="font-semibold text-[14px]">Mã giảm giá: <span class="text-[#DB3F4C] uppercase">{{
                                discountCode.MaGiamGia }}</span></p>
                        </div>
                        <button @click.prevent="saveDiscountCode(discountCode.IdMaGiamGia)"
                            class="w-[40px] h-[40px] border-2 border-[#1A1D27] flex justify-center items-center self-end rounded-lg hover:border-[#DB3F4C] hover:bg-[#DB3F4C] transition-all duration-300 group"><i
                                class="fa-solid fa-floppy-disk text-[#1A1D27] text-[20px] group-hover:text-white transition-all duration-300"></i></button>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="flex justify-center items-center m-auto w-full">
            <div class="flex flex-col items-center justify-center gap-3">
                <p class="font-semibold text-white text-[18px] lg:text-[24px] text-center">Hiện tại không có mã giảm giá
                    nào!</p>
                <img src="https://res.cloudinary.com/dwcajbc6f/image/upload/v1739607250/cute-astronaut-sleeping-pillow-illustration_m4shij.png" class="w-[200px]" alt="">
            </div>
        </div>
        <Footer />
        <BackToTop />
        <button @click.prevent="chatBox" to="/chatbox"
            class="fixed bottom-32 right-10 flex justify-center items-center [box-shadow:0px_0px_10px_rgba(255,255,255,0.8)] bg-[#003171] border-2 rounded-full w-[50px] h-[50px]">
            <i class="fa-solid fa-comments text-white"></i>
        </button>
        <NotificationClient :message="notification.message" :type="notification.type" />
    </div>
</template>