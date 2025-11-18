<script setup>
import { ref, onMounted, watch } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import Chat from '../../components/client/Chat.vue';
import ChatBot from '../../components/client/ChatBot.vue';
import EmtyState from '@/components/Notification/EmtyState.vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import NotificationClient from '@/components/Notification/NotificationClient.vue';
import ConfirmDialog from "@/components/Notification/ConfirmDialog.vue";

const router = useRouter()

// --- CẤU HÌNH URL ĐỘNG ---
// Tự động nhận diện môi trường: Netlify (Production) hoặc Localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// -------------------------

const listAddress = ref([]);
const listDiscountCodes = ref([]);
const discountCodeWithCustomer = ref([]);
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
        // SỬA 1: Dùng API_URL
        const response = await axios.get(`${API_URL}/api/magiamgia`);
        listDiscountCodes.value = response.data.map(discountCode => {
            return {
                ...discountCode
            };
        });
    } catch (error) {
        console.error('Error fetching:', error);
    }
}
const fetchCustomer = async (idKhachHang) => {
    try {
        // SỬA 2: Dùng API_URL
        const response = await axios.get(`${API_URL}/api/khachhang/${idKhachHang}`);
        listAddress.value = response.data.DanhSachDiaChi;
        maKhachHang.value = response.data.MaKhachHang;
        const customerDiscountIds = Array.isArray(response.data.DanhSachMaGiamGia)
            ? response.data.DanhSachMaGiamGia.map(item => item.IdMaGiamGia).filter(id => id)
            : [];

        discountCodeWithCustomer.value = listDiscountCodes.value
            .filter(discountCode => customerDiscountIds.includes(discountCode.IdMaGiamGia))
            .map(discountCode => ({
                ...discountCode
            }))
            .sort((a, b) => new Date(b.NgayHetHan) - new Date(a.NgayHetHan));
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

const deleteLocation = async (maKhachHang, id) => {
    showConfirmDialog({
        title: 'Thông báo xác nhận',
        message: 'Bạn có chắc chắn muốn xóa địa chỉ này không?',
        type: 'error',
        confirmText: 'Xóa',
        cancelText: 'Hủy bỏ',
        onConfirm: async () => {
            try {
                // SỬA 3: Dùng API_URL
                const response = await axios.delete(`${API_URL}/api/khachhang/diachi/${maKhachHang}/${id}`);
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
    });
}

const deleteDiscountCode = async (maKhachHang, idMaGiamGia) => {
    showConfirmDialog({
        title: 'Thông báo xác nhận',
        message: 'Bạn có chắc chắn muốn xóa mã giảm giá này không?',
        type: 'error',
        confirmText: 'Xóa',
        cancelText: 'Hủy bỏ',
        onConfirm: async () => {
            try {
                // SỬA 4: Dùng API_URL
                const response = await axios.delete(`${API_URL}/api/khachhang/magiamgia/${maKhachHang}/${idMaGiamGia}`);
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
    });
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
    <div
        class="bg-gradient-to-br from-[#0F1419] via-[#1A1D27] to-[#0F1419] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="relative my-5 m-2 lg:mx-[200px] flex flex-grow">
            <div class="w-full m-4">
                <div class="flex flex-col gap-8 lg:gap-4">
                    <div class="flex flex-col gap-4">
                        <div class="w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                            <h1
                                class="font-bold self-start text-[20px] uppercase text-white text-start border-b-2 border-[#DC143C] pb-2">
                                Danh sách địa chỉ
                            </h1>
                            <div class="w-full lg:w-auto flex justify-end">
                                <router-link :to="`/addInfoOrder/${maKhachHang}`"
                                    class="inline-block px-5 py-3 bg-[#4169E1] text-[14px] rounded-md font-bold text-white whitespace-nowrap">
                                    <i class="fa-solid fa-plus"></i> Thêm địa chỉ
                                </router-link>
                            </div>
                        </div>
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
                        <div v-else
                            class="flex justify-center items-center m-auto w-full border border-gray-100 rounded-md p-4">
                            <EmtyState icon="fa-map" title="Chưa có địa chỉ nào"
                                message="Hãy tiến hành cập nhật địa chỉ của bạn để thuận tiện cho việc đặt hàng nhé!" />
                        </div>
                    </div>
                    <div class="flex flex-col gap-4">
                        <h1
                            class="font-bold self-start text-[20px] uppercase text-white text-start border-b-2 border-[#DC143C] pb-2">
                            Danh sách mã giảm giá</h1>
                        <div v-if="discountCodeWithCustomer.length > 0"
                            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                            <div v-for="(discountCode, index) in discountCodeWithCustomer" :key="index"
                                class="flex flex-col gap-1 border-t-4 border-[#DB3F4C] bg-white p-4 shadow-lg w-full rounded-md">
                                <div class="flex justify-between items-center">
                                    <p class="font-bold text-[20px]">{{ discountCode.TenMaGiamGia }}</p>
                                    <button @click.prevent="deleteDiscountCode(maKhachHang, discountCode.IdMaGiamGia)"
                                        class="w-[35px] h-[35px] border-2 border-[#DB3F4C] flex items-center justify-center self-end rounded-lg">
                                        <i class="fa-solid fa-xmark text-[#DB3F4C]"></i>
                                    </button>
                                </div>
                                <p v-if="discountCode.GiamTien" class="font-semibold text-[#DB3F4C] text-[20px]">Giảm {{
                                    formatCurrency(discountCode.GiamTien) }} <span class="text-[16px] relative -top-[2px] underline">đ</span></p>
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
                                                    formatCurrency(discountCode.GiaApDung) }} <span class="text-[14px] relative -top-[2px] underline">đ</span></span></p>
                                    </div>
                                    <div
                                        class="w-[35px] h-[35px] border-2 border-[#1A1D27] flex items-center justify-center self-end rounded-lg">
                                        <p class="text-[14px] font-semibold">{{ discountCode.SoLanSuDung }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else
                            class="flex justify-center items-center m-auto w-full border border-gray-100 rounded-md p-4">
                            <EmtyState icon="fa-tags" title="Chưa có mã giảm giá nào" message="Hiện tại chưa có mã giảm giá nào được lưu.
                        Hãy truy cập trang giảm giá để săn mã giảm giá nhé!" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Footer />
        <BackToTop />
        <Chat />
        <ChatBot />
        <NotificationClient :message="notification.message" :type="notification.type" />
        <ConfirmDialog :visible="dialogState.visible" :title="dialogState.title" :message="dialogState.message"
            :type="dialogState.type" :confirmText="dialogState.confirmText" :cancelText="dialogState.cancelText"
            @confirm="handleDialogConfirm" @cancel="handleDialogCancel" @close="handleDialogClose" />
    </div>
</template>