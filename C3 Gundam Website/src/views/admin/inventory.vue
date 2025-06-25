<script setup>
import { onMounted, ref, computed } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import axios from "axios";
import { StreamBarcodeReader } from '@teckel/vue-barcode-reader';
import NotificationAdmin from "@/components/Notification/NotificationAdmin.vue";
import ConfirmDialog from "@/components/Notification/ConfirmDialog.vue";

const inventoryLists = ref([]);
const searchValue = ref("");
const showScan = ref(false);
const barcode = ref("");
const product = ref(null);
const showForm = ref(false);
const SoLuongNhap = ref(1);
const GiaNhap = ref(0);
const MaNhaCungCap = ref("");
const TenNhaCungCap = ref("");
const suppliers = ref([]);
const notification = ref({ message: "", type: "" });
const ThoiGian = new Date();

const showNotification = (msg, type) => {
    notification.value = { message: msg, type };
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

const fetchInventory = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/quanlykho');
        inventoryLists.value = response.data.map(inventory => ({
            ...inventory,
            NgayCapNhat: new Date(inventory.NgayCapNhat)
        }));
        inventoryLists.value.sort((a, b) => b.NgayCapNhat - a.NgayCapNhat);
    } catch (err) {
        console.log("Error fetching: ", err);
    }
};

const findProducts = computed(() => {
    if (!searchValue.value) {
        return inventoryLists.value;
    }
    return inventoryLists.value.filter(product =>
        product.MaSanPham.toLowerCase().includes(searchValue.value.toLowerCase()) ||
        product.TenSanPham.toLowerCase().includes(searchValue.value.toLowerCase())
    );
});

const formatDate = (date) => {
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' };
    const formattedDate = date.toLocaleString('vi-VN', options);
    const [time, day] = formattedDate.split(', ');
    return `${time}`;
};

function formatCurrency(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const onDecode = async (result) => {
    barcode.value = result;
    try {
        const response = await axios.get(`http://localhost:3000/api/barcode/${result}`);
        product.value = response.data;
        MaNhaCungCap.value = product.value.MaNhaCungCap;
        TenNhaCungCap.value = product.value.TenNhaCungCap;
        showForm.value = true;
        showScan.value = false;
    } catch (error) {
        showNotification(error.response?.data?.message || 'Không tìm thấy sản phẩm', 'error');
    }
};

const addStock = async () => {
    if (!product.value || !SoLuongNhap.value || !GiaNhap.value || !MaNhaCungCap.value) {
        showNotification('Vui lòng điền đầy đủ thông tin', 'error');
        return;
    }
    try {
        showConfirmDialog({
            title: 'Thông báo xác nhận',
            message: 'Bạn có chắc chắn về các thông tin vừa nhập vào chưa?',
            type: 'info',
            confirmText: 'Xác nhận',
            cancelText: 'Hủy bỏ',
            onConfirm: async () => {
                const MaNhanVien = localStorage.getItem("MaAdmin");
                await axios.post('http://localhost:3000/api/barcode', {
                    barcode: product.value.barcode,
                    SoLuongNhap: SoLuongNhap.value,
                    GiaNhap: GiaNhap.value,
                    MaNhaCungCap: MaNhaCungCap.value,
                    TenNhaCungCap: TenNhaCungCap.value,
                    MaNhanVien,
                    TenNhanVien: localStorage.getItem("TenAdmin"),
                });

                const notificationData = {
                    ThongBao: `${localStorage.getItem("TenAdmin")} vừa nhập kho sản phẩm bằng Barcode.`,
                    NguoiChinhSua: localStorage.getItem("TenAdmin"),
                    ThoiGian: ThoiGian,
                };

                await axios.post('http://localhost:3000/api/thongbao', notificationData);

                showNotification('Nhập kho thành công!', 'success');
                product.value = null;
                showForm.value = false;
                SoLuongNhap.value = 1;
                GiaNhap.value = 0;
                MaNhaCungCap.value = '';
                TenNhaCungCap.value = '';
                await fetchInventory();
            }
        });
    } catch (error) {
        showNotification(error.response?.data?.message || 'Nhập kho thất bại', 'error');
    }
};

const fetchSuppliers = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/nhacungcap');
        suppliers.value = response.data;
    } catch (error) {
        console.error('Error fetching suppliers:', error);
    }
};

onMounted(() => {
    fetchInventory();
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
                    <div class="flex gap-4 justify-between items-center">
                        <div class="flex lg:flex-row flex-col gap-4 justify-center lg:justify-between items-center">
                            <h1 class="font-bold text-[20px] uppercase">Quản lý kho</h1>
                            <div class="relative flex justify-center flex-1 gap-2 max-w-xl">
                                <input type="text" v-model="searchValue"
                                    class="items-center w-full p-3 bg-white border pr-10 border-gray-400 text-[12px] font-semibold tracking-wider text-black rounded-md focus:outline-none"
                                    placeholder="Tìm kiếm sản phẩm ..." />
                                <i
                                    class="fa-solid fa-magnifying-glass absolute top-2 lg:top-3 right-3 text-[22px] text-[#003171]"></i>
                            </div>
                        </div>
                        <div class="flex gap-4">
                            <router-link to="/admin/listEntryForms"
                                class="bg-[#003171] text-white font-bold rounded py-3 px-4 flex justify-center items-center">
                                <i class="fa-solid fa-plus"></i>
                                <p class="text-[14px] ml-2">Nhập kho thủ công</p>
                            </router-link>
                            <button @click="showScan = true"
                                class="bg-[#008B8B] text-white font-bold rounded py-3 px-4 flex justify-center items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"
                                    class="w-5 h-5 font-bold" viewBox="0 0 256 256">
                                    <path fill="currentColor"
                                        d="M232 48v40a8 8 0 0 1-16 0V56h-32a8 8 0 0 1 0-16h40a8 8 0 0 1 8 8ZM72 200H40v-32a8 8 0 0 0-16 0v40a8 8 0 0 0 8 8h40a8 8 0 0 0 0-16Zm152-40a8 8 0 0 0-8 8v32h-32a8 8 0 0 0 0 16h40a8 8 0 0 0 8-8v-40a8 8 0 0 0-8-8ZM32 96a8 8 0 0 0 8-8V56h32a8 8 0 0 0 0-16H32a8 8 0 0 0-8 8v40a8 8 0 0 0 8 8Zm48-16a8 8 0 0 0-8 8v80a8 8 0 0 0 16 0V88a8 8 0 0 0-8-8Zm104 88V88a8 8 0 0 0-16 0v80a8 8 0 0 0 16 0Zm-40-88a8 8 0 0 0-8 8v80a8 8 0 0 0 16 0V88a8 8 0 0 0-8-8Zm-32 0a8 8 0 0 0-8 8v80a8 8 0 0 0 16 0V88a8 8 0 0 0-8-8Z" />
                                </svg>
                                <p class="text-[14px] ml-2">Quét mã barcode</p>
                            </button>
                        </div>
                    </div>
                    <div class="shadow-lg rounded-lg border-2 border-gray-300">
                        <table class="w-full bg-white whitespace-nowrap text-center text-gray-500">
                            <thead class="bg-[#1A1D27] text-white">
                                <tr>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">STT</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mã sản phẩm</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Tên sản phẩm</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Số lượng còn lại</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Giá nhập gần nhất</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Ngày cập nhật</th>
                                </tr>
                            </thead>
                            <tbody class="w-full">
                                <tr class="border-t border-slate-500" v-for="(inventory, index) in findProducts"
                                    :key="index">
                                    <td class="px-6 py-4 font-medium text-gray-900 text-[12px]">{{ index + 1 }}</td>
                                    <td class="px-6 py-4 font-medium text-gray-900 text-[12px]">{{ inventory.MaSanPham
                                    }}</td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-[12px] text-ellipsis overflow-hidden max-w-40">
                                        <p class="overflow-hidden text-ellipsis whitespace-nowrap">{{
                                            inventory.TenSanPham }}</p>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">{{
                                        (inventory.SoLuongTon > 0) ? inventory.SoLuongTon : 'Hết hàng' }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">{{
                                        formatCurrency(inventory.GiaNhapGanNhat) }} VNĐ</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">{{
                                        formatDate(inventory.NgayCapNhat) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <!-- Cửa sổ quét barcode -->
                    <div v-if="showScan"
                        class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                        <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="font-semibold">Quét mã BarCode</h3>
                                <button @click="showScan = false"
                                    class="mt-4 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">
                                    Đóng
                                </button>
                            </div>
                            <StreamBarcodeReader torch no-front-cameras @decode="onDecode"
                                @loaded="() => showNotification('Camera sẵn sàng', 'success')"
                                class="w-full h-full bg-gray-200 rounded-md" />
                        </div>
                    </div>
                    <!-- Form nhập kho -->
                    <div v-if="showForm"
                        class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                        <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                            <h3 class="text-lg font-semibold mb-4">Nhập kho nhanh</h3>
                            <div class="flex flex-col gap-4">
                                <p><strong>Mã sản phẩm:</strong> {{ product.MaSanPham }}</p>
                                <p><strong>Tên sản phẩm:</strong> {{ product.TenSanPham }}</p>
                                <p><strong>Tồn kho hiện tại:</strong> {{ product.SoLuongTon }}</p>
                                <p><strong>Giá nhập gần nhất:</strong> {{ formatCurrency(product.GiaNhapGanNhat) }} VNĐ
                                </p>
                                <label>Nhà cung cấp:</label>
                                <select v-model="MaNhaCungCap"
                                    @change="TenNhaCungCap = suppliers.find(s => s.MaNhaCungCap === MaNhaCungCap)?.TenNhaCungCap || ''"
                                    class="p-2 bg-gray-700 rounded text-white">
                                    <option value="">Chọn nhà cung cấp</option>
                                    <option v-for="supplier in suppliers" :key="supplier.MaNhaCungCap"
                                        :value="supplier.MaNhaCungCap">
                                        {{ supplier.TenNhaCungCap }}
                                    </option>
                                </select>
                                <label>Số lượng nhập:</label>
                                <input v-model.number="SoLuongNhap" type="number" min="1"
                                    class="p-2 bg-gray-700 rounded text-white" />
                                <label>Giá nhập:</label>
                                <input v-model.number="GiaNhap" type="number" min="0"
                                    class="p-2 bg-gray-700 rounded text-white" />
                                <div class="flex gap-4 items-end justify-end">
                                    <button @click="showForm = false"
                                        class="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">
                                        Đóng
                                    </button>
                                    <button @click="addStock"
                                        class="bg-[#003171] text-white py-2 px-4 rounded hover:bg-red-600">
                                        Nhập kho
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <NotificationAdmin :message="notification.message" :type="notification.type" />
                </div>
            </div>
            <ConfirmDialog :visible="dialogState.visible" :title="dialogState.title" :message="dialogState.message"
                :type="dialogState.type" :confirmText="dialogState.confirmText" :cancelText="dialogState.cancelText"
                @confirm="handleDialogConfirm" @cancel="handleDialogCancel" @close="handleDialogClose" />
        </div>
    </div>
</template>

<style scoped>
.active-link {
    background: #DB3F4C;
    color: white;
}
</style>