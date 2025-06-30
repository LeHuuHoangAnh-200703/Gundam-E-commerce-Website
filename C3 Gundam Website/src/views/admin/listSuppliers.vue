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
const listSuppliers = ref([]);
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

const fetchSuppliers = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/nhacungcap');
        listSuppliers.value = response.data.map(supplier => {
            return {
                ...supplier
            };
        });
    } catch (error) {
        console.error('Error fetching:', error);
    }
};

const deleteSupplier = async (maNCC, tenNCC) => {
    showConfirmDialog({
        title: 'Thông báo xác nhận',
        message: 'Bạn có chắc chắn muốn xóa nhà cung cấp này không?',
        type: 'error',
        confirmText: 'Xóa',
        cancelText: 'Hủy bỏ',
        onConfirm: async () => {
            try {
                const response = await axios.delete(`http://localhost:3000/api/nhacungcap/${maNCC}`);

                const notificationData = {
                    ThongBao: `Vừa xóa nhà cung cấp ${tenNCC}`,
                    NguoiChinhSua: TenAdmin,
                    ThoiGian: ThoiGian,
                };

                await axios.post('http://localhost:3000/api/thongbao', notificationData);

                showNotification("Xóa nhà cung cấp thành công!", "success");
                await fetchSuppliers();
                setTimeout(() => {
                    router.push('/admin/listSuppliers');
                }, 3000);
            } catch (err) {
                showNotification(err.response?.data?.message || "Xóa nhà cung cấp thất bại!", "error");
            }
        }
    });
}

const findSupplier = computed(() => {
    return listSuppliers.value.filter(supplier => {
        const matchesSearch = !searchValue.value ||
            supplier.TenNhaCungCap.toLowerCase().includes(searchValue.value.toLowerCase())
        return matchesSearch;
    });
})

onMounted(() => {
    fetchSuppliers();
});
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
                            <h1 class="font-bold text-[20px] uppercase">
                                Quản lý nhà cung cấp
                            </h1>
                            <router-link to="/admin/addSupplier"
                                class="bg-[#003171] text-white font-bold rounded py-3 px-4 flex justify-center items-center">
                                <i class="fa-solid fa-plus text-[16px]"></i>
                                <p class="text-[14px] ml-2">Thêm nhà cung cấp</p>
                            </router-link>
                        </div>
                        <div class="relative w-full max-w-md">
                            <input type="text" v-model="searchValue"
                                class="w-full p-3 pr-12 bg-white border border-gray-400 text-[12px] sm:text-[13px] font-semibold tracking-wider text-black rounded-md focus:outline-none focus:border-[#003171] focus:ring-1 focus:ring-[#003171]"
                                placeholder="Tìm kiếm nhà cung cấp ..." />
                            <i
                                class="fa-solid fa-magnifying-glass absolute top-1/2 transform -translate-y-1/2 right-3 text-[20px] sm:text-[22px] text-[#003171]"></i>
                        </div>
                    </div>
                    <div class="shadow-lg rounded-lg border-2 border-gray-300">
                        <table class="w-full bg-white whitespace-nowrap text-center text-gray-500">
                            <thead class="bg-[#1A1D27] text-white">
                                <tr>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mã nhà cung cấp</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Tên nhà cung cấp</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Số điện thoại</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Địa chỉ</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Điều chỉnh</th>
                                </tr>
                            </thead>
                            <tbody class="w-full">
                                <tr class="border-t border-slate-500" v-for="(supplier, index) in findSupplier"
                                    :key="index">
                                    <td class="px-6 py-4 font-medium text-gray-900 text-[12px]">{{ supplier.MaNhaCungCap
                                        }}</td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-[12px] text-ellipsis overflow-hidden max-w-40">
                                        <p class="overflow-hidden text-ellipsis whitespace-nowrap">{{
                                            supplier.TenNhaCungCap }}</p>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                        {{ supplier.DienThoai }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                        {{ supplier.DiaChi }}</td>
                                    <td class="flex justify-center gap-2 px-7 py-7">
                                        <router-link :to="`/admin/editSupplier/${supplier.MaNhaCungCap}`"
                                            class="inline-block bg-[#00697F] text-white font-medium py-2 px-4 rounded-md transition-all duration-300 hover:bg-[#055565]"><i
                                                class="fa-solid fa-pen-to-square"></i></router-link>
                                        <form
                                            @submit.prevent="deleteSupplier(supplier.MaNhaCungCap, supplier.TenNhaCungCap)">
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