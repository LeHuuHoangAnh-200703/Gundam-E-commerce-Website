<script setup>
import { ref, onMounted } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import axios from "axios";

const listDiscountCodes = ref([]);

const notification = ref({
    message: '',
    type: ''
});

const TenAdmin = localStorage.getItem("TenAdmin");
const ChucVu = localStorage.getItem("ChucVu");
const ThoiGian = new Date();

const fetchDiscountCode = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/magiamgia');
        listDiscountCodes.value = response.data.map(discountCode => {
            return {
                ...discountCode,
                NgayHetHan: new Date(discountCode.NgayHetHan),
            };
        });
        console.log(listDiscountCodes);
    } catch (error) {
        console.error('Error fetching:', error);
    }
}

const deleteDiscountCode = async (idMaGG, tenMaGG) => {
    const confirmDelete = confirm("Bạn có chắc chắn muốn xóa không?");
    if (!confirmDelete) return;

    try {
        const response = await axios.delete(`http://localhost:3000/api/magiamgia/${idMaGG}`);
        
        const notificationData = {
            ThongBao: `Mã giảm giá ${tenMaGG.toLowerCase()} vừa được xóa!`,
            NguoiChinhSua: TenAdmin,
            ChucVu: ChucVu,
            ThoiGian: ThoiGian,
        };

        await axios.post('http://localhost:3000/api/thongbao', notificationData);

        notification.value = {
            message: "Xóa mã giảm giá thành công!",
            type: "success",
        };
        setTimeout(() => {
            router.push('/admin/discountCode');
        }, 3000);
    } catch (err) {
        notification.value = {
            message: err.response?.data?.message || "Xóa mã mã giảm giá thất bại!",
            type: "error",
        };
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}

function formatCurrency(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
onMounted(() => {
    fetchDiscountCode();
})
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full min-h-screen font-sans">
        <div class="flex gap-3">
            <SideBar />
            <div class="relative p-4 flex flex-col gap-4 w-full overflow-auto">
                <Navbar />
                <div class="w-full relative flex flex-col gap-4 overflow-auto max-h-[calc(100vh-100px)] pb-7">
                    <div class="p-4 rounded-lg flex flex-col gap-6">
                        <div class="flex justify-between items-center">
                            <h1 class="font-bold text-[20px]">Danh sách mã giảm giá</h1>
                            <router-link to="/admin/addDiscountCode"
                                class="bg-[#003171] text-white font-bold w-[50px] h-[50px] rounded-full flex justify-center items-center">
                                <i class="fa-solid fa-plus"></i>
                            </router-link>
                        </div>
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div v-for="(discountCode, index) in listDiscountCodes" :key="index"
                                class="flex flex-col gap-1 border-t-4 border-[#DB3F4C] bg-white p-4 shadow-lg">
                                <p class="font-bold text-[22px]">{{ discountCode.TenMaGiamGia }}</p>
                                <p v-if="discountCode.GiamTien" class="font-semibold text-[#DB3F4C] text-[20px]">Giảm {{
                                    formatCurrency(discountCode.GiamTien) }} VNĐ</p>
                                <p v-else class="font-semibold text-[#DB3F4C] text-[20px]">Giảm {{
                                    discountCode.GiamPhanTram }}%</p>
                                <div class="flex lg:flex-row flex-col lg:justify-between">
                                    <p class="font-semibold text-[14px]">Hạn sử dụng: {{ new
                                        Date(discountCode.NgayHetHan) < new Date() ? 'Hết hạn' :
                                            discountCode.NgayHetHan.toLocaleDateString('vi-VN') }}</p>
                                            <p class="font-semibold text-[14px]">Số lượt sử dụng: {{
                                                discountCode.SoLanSuDung }}
                                            </p>
                                </div>
                                <p class="font-semibold text-[14px]">Áp dụng với đơn: <span class="text-[#DB3F4C]">{{
                                    formatCurrency(discountCode.GiaApDung) }}
                                        VNĐ</span></p>
                                <p class="font-semibold text-[14px]">Mã giảm giá: <span
                                        class="text-[#DB3F4C] uppercase">{{
                                            discountCode.MaGiamGia }}</span></p>
                                <div class="flex justify-end gap-4 mt-3">
                                    <router-link :to="`/admin/editDiscountCode/${discountCode.IdMaGiamGia}`"
                                        class="bg-[#00697F] text-white px-4 py-3 rounded-md transition-all duration-300 hover:bg-[#055565]"><i
                                            class="fa-solid fa-pen-to-square"></i></router-link>
                                    <form @click="deleteDiscountCode(discountCode.IdMaGiamGia, discountCode.TenMaGiamGia)">
                                        <button type="submit"
                                            class="text-white bg-[#DC143C] px-4 py-3 rounded-md transition-all duration-300 hover:bg-[#B22222]"><i
                                                class="fa-solid fa-trash"></i></button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <transition name="slide-fade" mode="out-in">
                        <div v-if="notification.message" :class="['fixed top-4 left-1/2 right-10 transform p-4 bg-white shadow-lg border-t-4 rounded z-10 flex items-center space-x-2 w-full max-w-sm', {
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