<script setup>
import { ref, onMounted, watch } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter()
const listAddress = ref([]);
const maKhachHang = ref('');
const notification = ref({
    message: '',
    type: ''
});
const fetchCustomer = async (idKhachHang) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/khachhang/${idKhachHang}`);
        listAddress.value = response.data.DanhSachDiaChi;
        maKhachHang.value = response.data.MaKhachHang;
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

const deleteLocation = async (maKhachHang ,id) => {
    try {
        const response = await axios.delete(`http://localhost:3000/api/khachhang/diachi/${maKhachHang}/${id}`);
        notification.value = {
            message: "Xóa địa chỉ thành công!",
            type: "success",
        };
        setTimeout(() => {
            router.push('/profile');
        }, 3000);
    } catch (err) {
        notification.value = {
            message: err.response?.data?.message || "Xóa địa chỉ thất bại!",
            type: "error",
        };
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}
function formatCurrency(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

onMounted(() => {
    const idKhachHang = router.currentRoute.value.params.maKhachHang;
    console.log(idKhachHang);
    fetchCustomer(idKhachHang);
})
</script>

<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="relative my-5 m-2 lg:mx-[200px] flex flex-grow">
            <div class="w-full m-4">
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-4">
                        <h1 class="font-bold text-[20px] uppercase text-white">Danh sách địa chỉ của bạn</h1>
                        <div class="px-4 pb-4 pt-2 bg-white rounded-md">
                            <div v-for="(address, index) in listAddress" :key="index"
                                class="flex lg:flex-row flex-col gap-2 justify-between items-center border-b-2 py-2">
                                <div>
                                    <p class="text-[14px]">Tên người nhận: <span class="font-semibold">{{
                                        address.TenNguoiNhan }}</span></p>
                                    <p class="text-[14px]">Số điện thoại: <span class="font-semibold">{{
                                        address.DienThoai
                                            }}</span></p>
                                    <p class="text-[14px]">Địa chỉ nhận hàng: <span class="font-semibold">{{
                                        address.DiaChi
                                            }}</span></p>
                                </div>
                                <button @click.prevent="deleteLocation(maKhachHang,address._id)"
                                    class="flex items-center justify-center self-end lg:self-center w-[40px] h-[40px] bg-[#333] rounded-full text-white font-bold hover:bg-[#DB3F4C] transition-all duration-300"><i
                                        class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-4">
                        <h1 class="font-bold text-[20px] uppercase text-white">Danh sách mã giảm giá của bạn</h1>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                            <div
                                class="flex flex-col gap-1 border-t-4 border-[#DB3F4C] bg-white p-4 shadow-lg w-full rounded-md">
                                <p class="font-bold text-[20px]">MỪNG SINH NHẬT 1 TUỔI</p>
                                <!-- <p v-if="discountCode.GiamTien" class="font-semibold text-[#DB3F4C] text-[20px]">Giảm {{
                                    formatCurrency(discountCode.GiamTien) }} VNĐ</p> -->
                                <p class="font-semibold text-[#DB3F4C] text-[18px]">Giảm 40%</p>
                                <div class="flex gap-1 lg:flex-row flex-col lg:justify-between">
                                    <p class="font-semibold text-[14px]">Hạn sử dụng: 20/07/2025</p>
                                </div>
                                <p class="font-semibold text-[14px]">Áp dụng với đơn: <span class="text-[#DB3F4C]">500.000
                                        VNĐ</span></p>
                                <p class="font-semibold text-[14px]">Mã giảm giá: <span
                                        class="text-[#DB3F4C] uppercase">CHAOMUNGBAN</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Footer />
        <BackToTop />
        <transition name="slide-fade" mode="out-in">
            <div v-if="notification.message" :class="['fixed top-4 right-4 p-4 bg-white shadow-lg border-t-4 rounded z-10 flex items-center space-x-2', {
                'border-[#DB3F4C]': notification.type === 'error',
                'border-[#40E0D0]': notification.type === 'success',
            }]">
                <div class="flex gap-2 justify-center items-center">
                    <img :src="notification.type === 'success' ? '/src/assets/img/rb_7710.png' : '/src/assets/img/rb_12437.png'"
                        class="w-[50px]" alt="">
                    <p class="text-[16px] font-semibold"
                        :class="notification.type === 'success' ? 'text-[#40E0D0]' : 'text-[#DB3F4C]'">{{
                            notification.message }}</p>
                </div>
            </div>
        </transition>
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