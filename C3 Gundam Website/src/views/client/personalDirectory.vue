<script setup>
import { ref, onMounted, watch } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import NotificationClient from '@/components/Notification/NotificationClient.vue';

const router = useRouter()
const listAddress = ref([]);
const listDiscountCodes = ref([]);
const maKhachHang = ref('');
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

const fetchDiscountCode = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/magiamgia');
        listDiscountCodes.value = response.data.map(discountCode => {
            return {
                ...discountCode,
                SoLanSuDung: discountCode.SoLanSuDung,
            };
        });
    } catch (error) {
        console.error('Error fetching:', error);
    }
}
const fetchCustomer = async (idKhachHang) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/khachhang/${idKhachHang}`);
        listAddress.value = response.data.DanhSachDiaChi;
        maKhachHang.value = response.data.MaKhachHang;

        listDiscountCodes.value = response.data.DanhSachMaGiamGia.map(discountCode => {
            const foundDiscountCode = listDiscountCodes.value.find(dc => dc.IdMaGiamGia === discountCode.IdMaGiamGia);
            return {
                ...discountCode,
                SoLanSuDung: foundDiscountCode ? foundDiscountCode.SoLanSuDung : 0,
            };
        });
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

const deleteLocation = async (maKhachHang, id) => {
    try {
        const response = await axios.delete(`http://localhost:3000/api/khachhang/diachi/${maKhachHang}/${id}`);
        showNotification("Xóa địa chỉ thành công!", "success");
        setTimeout(() => {
            router.push('/profile');
        }, 1000);
    } catch (err) {
        showNotification(err.response?.data?.message || "Xóa địa chỉ thất bại!", "error");
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 1000);
}

const deleteDiscountCode = async (maKhachHang, idMaGiamGia) => {
    console.log(maKhachHang, idMaGiamGia)
    try {
        const response = await axios.delete(`http://localhost:3000/api/khachhang/magiamgia/${maKhachHang}/${idMaGiamGia}`);
        showNotification("Xóa mã giảm giá thành công!", "success");
        setTimeout(() => {
            router.push('/profile');
        }, 3000);
    } catch (err) {
        showNotification(err.response?.data?.message || "Xóa mã giảm giá thất bại!", "error");
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
    fetchDiscountCode();
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
                        <div v-if="listAddress.length > 0" class="px-4 pb-4 pt-2 bg-white rounded-md">
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
                                <button @click.prevent="deleteLocation(maKhachHang, address._id)"
                                    class="flex items-center justify-center self-end lg:self-center w-[40px] h-[40px] bg-[#333] rounded-full text-white font-bold hover:bg-[#DB3F4C] transition-all duration-300"><i
                                        class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                        <div v-else class="flex justify-center items-center m-auto w-full bg-white rounded-md p-4">
                            <div class="flex flex-col items-center justify-center gap-3">
                                <p class="font-semibold text-[#1A1D27] text-[18px] lg:text-[24px] text-center">Hiện tại
                                    không có địa chỉ, hãy cập nhật!</p>
                                <img src="https://res.cloudinary.com/dwcajbc6f/image/upload/v1739607250/astronaut-riding-king-kong-robot-with-gun-cartoon-vector-icon-illustration-science-technology-flat_o4ny7c.png" class="w-[200px]" alt="">
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-4">
                        <h1 class="font-bold text-[20px] uppercase text-white">Danh sách mã giảm giá của bạn</h1>
                        <div v-if="listDiscountCodes.length > 0"
                            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                            <div v-for="(discountCode, index) in listDiscountCodes" :key="index"
                                class="flex flex-col gap-1 border-t-4 border-[#DB3F4C] bg-white p-4 shadow-lg w-full rounded-md">
                                <div class="flex justify-between items-center">
                                    <p class="font-bold text-[20px]">{{ discountCode.TenMaGiamGia }}</p>
                                    <button @click.prevent="deleteDiscountCode(maKhachHang, discountCode.IdMaGiamGia)"
                                        class="w-[35px] h-[35px] border-2 border-[#DB3F4C] flex items-center justify-center self-end rounded-lg">
                                        <i class="fa-solid fa-xmark text-[#DB3F4C]"></i>
                                    </button>
                                </div>
                                <p v-if="discountCode.GiamTien" class="font-semibold text-[#DB3F4C] text-[20px]">Giảm {{
                                    formatCurrency(discountCode.GiamTien) }} VNĐ</p>
                                <p v-else class="font-semibold text-[#DB3F4C] text-[20px]">Giảm {{
                                    discountCode.GiamPhanTram }}%</p>
                                <div class="flex justify-between items-center">
                                    <div>
                                        <div class="flex gap-1 lg:flex-row flex-col lg:justify-between">
                                            <p class="font-semibold text-[14px]">Hạn sử dụng: {{ new
                                                Date(discountCode.NgayHetHan) < new Date() ? 'Hết hạn' : new
                                                    Date(discountCode.NgayHetHan).toLocaleDateString('vi-VN') }}</p>
                                        </div>
                                        <p class="font-semibold text-[14px]">Áp dụng với đơn: <span
                                                class="text-[#DB3F4C]">{{
                                                    formatCurrency(discountCode.GiaApDung) }} VNĐ</span></p>
                                    </div>
                                    <div
                                        class="w-[35px] h-[35px] border-2 border-[#1A1D27] flex items-center justify-center self-end rounded-lg">
                                        <p class="text-[14px] font-semibold">{{ discountCode.SoLanSuDung }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="flex justify-center items-center m-auto w-full bg-white rounded-md p-4">
                            <div class="flex flex-col items-center justify-center gap-3">
                                <p class="font-semibold text-[#1A1D27] text-[18px] lg:text-[24px] text-center">Hiện tại
                                    không có mã giảm giá
                                    nào!</p>
                                <img src="https://res.cloudinary.com/dwcajbc6f/image/upload/v1739607250/astronaut-riding-king-kong-robot-with-gun-cartoon-vector-icon-illustration-science-technology-flat_o4ny7c.png" class="w-[200px]" alt="">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Footer />
        <BackToTop />
        <NotificationClient :message="notification.message" :type="notification.type" />
    </div>
</template>