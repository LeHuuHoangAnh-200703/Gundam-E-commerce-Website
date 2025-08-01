<script setup>
import { ref, onMounted, computed } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import NotificationAdmin from "@/components/Notification/NotificationAdmin.vue";
import ConfirmDialog from "@/components/Notification/ConfirmDialog.vue";
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const TenAdmin = localStorage.getItem("TenAdmin");
const ThoiGian = new Date();
const listProductType = ref([]);
const searchValue = ref('');

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

const fetchProductType = async () => {
    try {
        const response = await axios.get("http://localhost:3000/api/loaisanpham");
        listProductType.value = response.data.map(productType => {
            return {
                ...productType,
                NgayTao: new Date(productType.NgayTao)
            }
        })
        listProductType.value.sort((a, b) => b.NgayTao - a.NgayTao);
    } catch (error) {
        console.log("Error fetching: ", error);
    }
}

const deleteProductType = async (maLoaiSanPham, tenLoaiSanPham) => {
    showConfirmDialog({
        title: 'Thông báo xác nhận',
        message: 'Bạn có chắc chắn muốn xóa loại sản phẩm này không?',
        type: 'error',
        confirmText: 'Xóa',
        cancelText: 'Hủy bỏ',
        onConfirm: async () => {
            try {
                const response = await axios.delete(`http://localhost:3000/api/loaisanpham/${maLoaiSanPham}`);

                const notificationData = {
                    ThongBao: `Vừa xóa loại sản phẩm ${tenLoaiSanPham}`,
                    NguoiChinhSua: TenAdmin,
                    ThoiGian: ThoiGian,
                };

                await axios.post('http://localhost:3000/api/thongbao', notificationData);
                await fetchProductType();
                showNotification(response.data.message, "success");
            } catch (error) {
                showNotification(error.response?.data?.message, "error");
            }
        }
    });
}

const findProductTypes = computed(() => {
    return listProductType.value.filter(productType => {
        const matchesSearch = !searchValue.value ||
        productType.LoaiSanPham.toLowerCase().includes(searchValue.value.toLowerCase())
        return matchesSearch;
    });
})

const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' };
    const formattedDate = date.toLocaleDateString('vi-VN', options);

    return formattedDate;
};

onMounted(() => {
    fetchProductType();
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
                    <div class="flex flex-col gap-4 lg:gap-2">
                        <div class="flex flex-col lg:flex-row gap-4 justify-between items-center">
                            <h1 class="font-bold text-[20px] uppercase">Quản lý loại sản phẩm</h1>
                            <router-link to="/admin/addListProductType"
                                class="bg-[#003171] text-white font-bold rounded py-3 px-4 flex justify-center items-center">
                                <i class="fa-solid fa-plus"></i>
                                <p class="text-[14px] ml-2">Thêm loại sản phẩm</p>
                            </router-link>
                        </div>
                        <div class="relative w-full max-w-md">
                            <input type="text" v-model="searchValue"
                                class="w-full p-3 pr-12 bg-white border border-gray-400 text-[12px] sm:text-[13px] font-semibold tracking-wider text-black rounded-md focus:outline-none focus:border-[#003171] focus:ring-1 focus:ring-[#003171]"
                                placeholder="Tìm kiếm loại sản phẩm ..." />
                            <i
                                class="fa-solid fa-magnifying-glass absolute top-1/2 transform -translate-y-1/2 right-3 text-[20px] sm:text-[22px] text-[#003171]"></i>
                        </div>
                    </div>
                    <div class="shadow-lg rounded-lg border-2 border-gray-300">
                        <table class="w-full bg-white whitespace-nowrap text-center text-gray-500">
                            <thead class="bg-[#1A1D27] text-white">
                                <tr>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mã loại sản phẩm</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Tên loại sản phẩm</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Loại sản phẩm</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Ngày tạo</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Điều chỉnh</th>
                                </tr>
                            </thead>
                            <tbody class="w-full">
                                <tr class="border-t border-slate-500" v-for="(productType, index) in findProductTypes"
                                    :key="index">
                                    <td class="px-6 py-4 font-medium text-gray-900 text-[12px]">{{
                                        productType.MaLoaiSanPham }}</td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-[12px] text-ellipsis overflow-hidden max-w-40">
                                        <p class="overflow-hidden text-ellipsis whitespace-nowrap">{{
                                            productType.TenLoaiSanPham }}</p>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                        {{ productType.LoaiSanPham }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                        {{ formatDate(productType.NgayTao) }}</td>
                                    <td class="flex justify-center gap-2 px-7 py-7">
                                        <router-link :to="`/admin/editListProductType/${productType.MaLoaiSanPham}`"
                                            class="inline-block bg-[#00697F] text-white font-medium py-2 px-4 rounded-md transition-all duration-300 hover:bg-[#055565]"><i
                                                class="fa-solid fa-pen-to-square"></i></router-link>
                                        <form
                                            @submit.prevent="deleteProductType(productType.MaLoaiSanPham, productType.TenLoaiSanPham)">
                                            <button type="submit"
                                                class="inline-block text-white font-medium bg-[#DC143C] py-2 px-4 rounded-md transition-all duration-300 hover:bg-[#B22222] whitespace-nowrap"><i
                                                    class="fa-solid fa-trash"></i></button>
                                        </form>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
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