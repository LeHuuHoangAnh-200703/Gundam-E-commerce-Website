<script setup>
import { ref, onMounted } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import NotificationAdmin from "@/components/Notification/NotificationAdmin.vue";
import axios from "axios";

const listDiscountCodes = ref([]);

const TenAdmin = localStorage.getItem("TenAdmin");
const Email = localStorage.getItem("EmailAdmin");
const ThoiGian = new Date();

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
                NgayHetHan: new Date(discountCode.NgayHetHan),
                NgayTao: new Date(discountCode.NgayTao),
            };
        });
        listDiscountCodes.value.sort((a, b) => b.NgayTao - a.NgayTao);
        console.log(listDiscountCodes.value)
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
            ThongBao: `Vừa xóa mã giảm giá ${tenMaGG.toLowerCase()}`,
            NguoiChinhSua: TenAdmin,
            Email: Email,
            ThoiGian: ThoiGian,
        };

        await axios.post('http://localhost:3000/api/thongbao', notificationData);

        showNotification("Xóa mã giảm giá thành công!", "success");
        setTimeout(() => {
            router.push('/admin/discountCode');
        }, 3000);
    } catch (err) {
        showNotification(err.response?.data?.message || "Xóa mã mã giảm giá thất bại!", "error");
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
                            <h1 class="font-bold text-[20px] uppercase">Danh sách mã giảm giá</h1>
                            <router-link to="/admin/addDiscountCode"
                                class="bg-[#003171] text-white font-bold w-[50px] h-[50px] rounded-full flex justify-center items-center">
                                <i class="fa-solid fa-plus"></i>
                            </router-link>
                        </div>
                        <div v-if="listDiscountCodes.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div v-for="(discountCode, index) in listDiscountCodes" :key="index"
                                class="flex flex-col gap-1 border-t-4 border-[#DB3F4C] bg-white p-4 shadow-lg">
                                <div class="flex justify-between items-center">
                                    <p class="font-bold text-[22px]">{{ discountCode.TenMaGiamGia }}</p>
                                    <div
                                        class="w-[30px] h-[30px] rounded-full border-2 border-[#1A1D27] flex justify-center items-center">
                                        <p class="text-[#1A1D27] text-[14px] font-bold">{{ discountCode.SoLanLuuMa }}</p>
                                    </div>
                                </div>
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
                                <div class="flex justify-end gap-4 mt-3">
                                    <router-link :to="`/admin/editDiscountCode/${discountCode.IdMaGiamGia}`"
                                        class="bg-[#00697F] text-white px-4 py-3 rounded-md transition-all duration-300 hover:bg-[#055565]"><i
                                            class="fa-solid fa-pen-to-square"></i></router-link>
                                    <form
                                        @click="deleteDiscountCode(discountCode.IdMaGiamGia, discountCode.TenMaGiamGia)">
                                        <button type="submit"
                                            class="text-white bg-[#DC143C] px-4 py-3 rounded-md transition-all duration-300 hover:bg-[#B22222]"><i
                                                class="fa-solid fa-trash"></i></button>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div v-else class="flex justify-center items-center m-auto w-full mt-32">
                            <div class="flex flex-col items-center justify-center gap-3">
                                <p class="font-semibold text-[18px] lg:text-[24px] text-center">Hiện tại không có mã
                                    giảm giá nào!</p>
                                <img src="https://res.cloudinary.com/dwcajbc6f/image/upload/v1739607250/astronaut-riding-king-kong-robot-with-gun-cartoon-vector-icon-illustration-science-technology-flat_o4ny7c.png" class="w-[200px]" alt="">
                            </div>
                        </div>
                    </div>
                    <NotificationAdmin :message="notification.message" :type="notification.type" />
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
</style>