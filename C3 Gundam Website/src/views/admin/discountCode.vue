<script setup>
import { ref, onMounted, computed } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import NotificationAdmin from "@/components/Notification/NotificationAdmin.vue";
import ConfirmDialog from "@/components/Notification/ConfirmDialog.vue";
import EmtyStateAdmin from '@/components/Notification/EmtyStateAdmin.vue';
import axios from "axios";

const listDiscountCodes = ref([]);
const searchValue = ref('');
const TenAdmin = localStorage.getItem("TenAdmin");
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

const dialogState = ref({
    visible: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy bỏ',
    onConfirm: null,
    onCancel: null
});

const showConfirmDialog = (config) => {
    dialogState.value = {
        visible: true,
        title: config.title || 'Xác nhận',
        message: config.message || 'Bạn có chắc chắn muốn thực hiện hành động này?',
        type: config.type || 'warning',
        confirmText: config.confirmText || 'Xác nhận',
        cancelText: config.cancelText || 'Hủy bỏ',
        onConfirm: config.onConfirm,
        onCancel: config.onCancel
    };
};

const handleDialogConfirm = () => {
    if (dialogState.value.onConfirm) {
        dialogState.value.onConfirm();
    }
    dialogState.value.visible = false;
};

const handleDialogCancel = () => {
    if (dialogState.value.onCancel) {
        dialogState.value.onCancel();
    }
    dialogState.value.visible = false;
};

const handleDialogClose = () => {
    dialogState.value.visible = false;
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
    showConfirmDialog({
        title: 'Thông báo xác nhận',
        message: 'Bạn có chắc chắn muốn xóa mã giảm giá này không?',
        type: 'error',
        confirmText: 'Xóa',
        cancelText: 'Hủy bỏ',
        onConfirm: async () => {
            try {
                const response = await axios.delete(`http://localhost:3000/api/magiamgia/${idMaGG}`);

                const notificationData = {
                    ThongBao: `Vừa xóa mã giảm giá ${tenMaGG.toLowerCase()}`,
                    NguoiChinhSua: TenAdmin,
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
    });
}

const findDiscountCode = computed(() => {
    return listDiscountCodes.value.filter(discountCode => {
        const matchesSearch = !searchValue.value ||
        discountCode.TenMaGiamGia.toLowerCase().includes(searchValue.value.toLowerCase())
        return matchesSearch;
    });
})

function formatCurrency(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
onMounted(() => {
    fetchDiscountCode();
})
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full h-screen font-sans flex">
        <SideBar />
        <div class="flex-1 flex flex-col h-screen overflow-hidden">
            <div class="flex-shrink-0 p-4">
                <Navbar />
            </div>
            <div class="flex-1 px-4 py-4 overflow-y-auto">
                <div class="flex flex-col gap-4">
                    <div class="rounded-lg flex flex-col gap-6">
                        <div class="flex flex-col gap-4 lg:gap-2">
                            <div class="flex flex-col lg:flex-row gap-4 justify-between items-center">
                                <h1 class="font-bold text-[20px] uppercase">Danh sách mã giảm giá</h1>
                                <router-link to="/admin/addDiscountCode"
                                    class="bg-[#003171] text-white font-bold rounded py-3 px-4 flex justify-center items-center">
                                    <i class="fa-solid fa-plus"></i>
                                    <p class="text-[14px] ml-2">Thêm mã giảm giá</p>
                                </router-link>
                            </div>
                            <div class="relative w-full max-w-md">
                                <input type="text" v-model="searchValue"
                                    class="w-full p-3 pr-12 bg-white border border-gray-400 text-[12px] sm:text-[13px] font-semibold tracking-wider text-black rounded-md focus:outline-none focus:border-[#003171] focus:ring-1 focus:ring-[#003171]"
                                    placeholder="Tìm kiếm mã giảm giá ..." />
                                <i
                                    class="fa-solid fa-magnifying-glass absolute top-1/2 transform -translate-y-1/2 right-3 text-[20px] sm:text-[22px] text-[#003171]"></i>
                            </div>
                        </div>
                        <div v-if="listDiscountCodes.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div v-for="(discountCode, index) in findDiscountCode" :key="index"
                                class="flex flex-col gap-1 border-t-4 border-[#DB3F4C] bg-white p-4 shadow-lg">
                                <div class="flex justify-between items-center">
                                    <p class="font-bold text-[22px]">{{ discountCode.TenMaGiamGia }}</p>
                                    <div
                                        class="w-[30px] h-[30px] rounded-full border-2 border-[#1A1D27] flex justify-center items-center">
                                        <p class="text-[#1A1D27] text-[14px] font-bold">{{ discountCode.SoLanLuuMa }}
                                        </p>
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
                        <div v-else class="flex justify-center items-center m-auto w-full mt-10">
                            <EmtyStateAdmin icon="fa-tags" title="Chưa có mã giảm giá nào" message="Hiện tại chưa có mã giảm giá nào, Hãy tiến hành tạo mã giảm giá mới tại đây!" />
                        </div>
                    </div>
                    <NotificationAdmin :message="notification.message" :type="notification.type" />
                </div>
            </div>
        </div>
        <ConfirmDialog :visible="dialogState.visible" :title="dialogState.title" :message="dialogState.message"
            :type="dialogState.type" :confirmText="dialogState.confirmText" :cancelText="dialogState.cancelText"
            @confirm="handleDialogConfirm" @cancel="handleDialogCancel" @close="handleDialogClose" />
    </div>
</template>

<style scoped>
.active-link {
    background: #DB3F4C;
    color: white;
}
</style>