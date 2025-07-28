<script setup>
import { onMounted, ref, computed, watch, nextTick, onUnmounted } from "vue";
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
const scannedBarcode = ref("");
const barcodeInputRef = ref(null);
const product = ref(null);
const showForm = ref(false);
const SoLuongNhap = ref(1);
const GiaNhap = ref(0);
const MaNhaCungCap = ref("");
const TenNhaCungCap = ref("");
const suppliers = ref([]);
const notification = ref({ message: "", type: "" });
const ThoiGian = new Date();
const lastBarcode = ref(""); // Lưu barcode lần trước
const scanCount = ref(1); // Đếm số lần quét cùng barcode

// Global scanning variables
const barcodeBuffer = ref("");
const barcodeTimeout = ref(null);
const isGlobalScanEnabled = ref(true);

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

// Xử lý quét barcode từ camera
const onDecode = async (result) => {
    let barcodeValue = result;
    console.log(barcodeValue)
    
    // Nếu không có tham số, lấy từ input
    if (!barcodeValue) {
        barcodeValue = barcode.value || scannedBarcode.value;
    }
    
    if (!barcodeValue) {
        showNotification('Vui lòng quét hoặc nhập barcode!', 'error');
        return;
    }
    
    try {
        // Kiểm tra nếu đang hiển thị form và quét cùng một sản phẩm
        if (showForm.value && product.value && product.value.BarCode === barcodeValue) {
            // Nếu đang mở form cho cùng sản phẩm, chỉ tăng số lượng
            scanCount.value += 1;
            SoLuongNhap.value = scanCount.value;
            showNotification(`Đã tăng số lượng thành ${scanCount.value}`, 'success');
            
            // Clear input values
            barcode.value = "";
            scannedBarcode.value = "";
            return; // Thoát sớm, không cần gọi API
        }

        const response = await axios.get(`http://localhost:3000/api/barcode/${barcodeValue}`);
        const productData = response.data;
        
        // Nếu là sản phẩm khác hoặc chưa mở form
        product.value = productData;
        MaNhaCungCap.value = product.value.MaNhaCungCap || "";
        TenNhaCungCap.value = product.value.TenNhaCungCap || "";

        // Kiểm tra nếu barcode giống lần trước (khi không có form mở)
        if (productData.BarCode === lastBarcode.value && !showForm.value) {
            scanCount.value += 1;
            SoLuongNhap.value = scanCount.value;
        } else {
            scanCount.value = 1;
            SoLuongNhap.value = 1;
            lastBarcode.value = productData.BarCode;
        }

        showForm.value = true;
        showScan.value = false;
        barcode.value = "";
        scannedBarcode.value = "";
        
    } catch (error) {
        showNotification(error.response?.data?.message || 'Không tìm thấy sản phẩm', 'error');
        barcode.value = "";
        scannedBarcode.value = "";
    }
};

// Xử lý input từ máy quét phần cứng trong modal
const handleBarcodeInput = (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        if (scannedBarcode.value.trim()) {
            onDecode(scannedBarcode.value);
        }
    }
};

// Xử lý phím nhấn toàn cục cho máy quét
const handleGlobalKeyPress = (event) => {
    // Bỏ qua nếu không bật chế độ quét toàn cục
    if (!isGlobalScanEnabled.value) return;
    
    // Bỏ qua nếu đang focus vào input/textarea/select
    if (event.target.tagName === 'INPUT' || 
        event.target.tagName === 'TEXTAREA' || 
        event.target.tagName === 'SELECT') {
        return;
    }
    
    // Bỏ qua nếu đang mở modal scanner (nhưng cho phép khi form đang mở)
    if (showScan.value) {
        return;
    }
    
    // Xử lý Enter (kết thúc quét)
    if (event.key === 'Enter') {
        if (barcodeBuffer.value.trim()) {
            onDecode(barcodeBuffer.value);
            barcodeBuffer.value = "";
        }
        return;
    }
    
    // Thêm ký tự vào buffer (chỉ nhận ký tự đơn)
    if (event.key.length === 1) {
        barcodeBuffer.value += event.key;
        
        // Clear buffer sau 100ms nếu không có ký tự mới
        clearTimeout(barcodeTimeout.value);
        barcodeTimeout.value = setTimeout(() => {
            barcodeBuffer.value = "";
        }, 100);
    }
};

// Mở scanner và focus vào input
const openScanner = () => {
    showScan.value = true;
    nextTick(() => {
        if (barcodeInputRef.value) {
            barcodeInputRef.value.focus();
        }
    });
};

// Toggle chế độ quét toàn cục
const toggleGlobalScan = () => {
    isGlobalScanEnabled.value = !isGlobalScanEnabled.value;
    showNotification(
        isGlobalScanEnabled.value ? 'Bật chế độ quét toàn cục' : 'Tắt chế độ quét toàn cục',
        isGlobalScanEnabled.value ? 'success' : 'error'
    );
};

// Thêm hàm reset phiên quét
const resetScanSession = () => {
    scanCount.value = 1;
    lastBarcode.value = "";
    showNotification('Đã reset phiên quét', 'info');
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
                    BarCode: product.value.BarCode,
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
                
                // Reset form nhưng giữ lại lastBarcode và scanCount để tiếp tục quét
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
    
    // Thêm event listener cho quét toàn cục
    document.addEventListener('keypress', handleGlobalKeyPress);
});

onUnmounted(() => {
    // Xóa event listener
    document.removeEventListener('keypress', handleGlobalKeyPress);
    
    // Clear timeout nếu có
    if (barcodeTimeout.value) {
        clearTimeout(barcodeTimeout.value);
    }
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
                    <div class="flex flex-col lg:flex-row gap-4 justify-between items-center">
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
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 w-full lg:w-auto">
                            <button @click="toggleGlobalScan"
                                :class="isGlobalScanEnabled ? 'bg-green-600' : 'bg-gray-600'"
                                class="text-white font-bold rounded py-3 px-4 flex justify-center items-center">
                                <i class="fa-solid fa-globe"></i>
                                <p class="text-[14px] ml-2">{{ isGlobalScanEnabled ? 'Quét ON' : 'Quét OFF' }}</p>
                            </button>
                            <router-link to="/admin/listEntryForms"
                                class="bg-[#003171] text-white font-bold rounded py-3 px-4 flex justify-center items-center">
                                <i class="fa-solid fa-plus"></i>
                                <p class="text-[14px] ml-2">Nhập thủ công</p>
                            </router-link>
                            <button @click="openScanner"
                                class="bg-[#008B8B] text-white font-bold rounded py-3 px-4 flex justify-center items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"
                                    class="w-5 h-5 font-bold" viewBox="0 0 256 256">
                                    <path fill="currentColor"
                                        d="M232 48v40a8 8 0 0 1-16 0V56h-32a8 8 0 0 1 0-16h40a8 8 0 0 1 8 8ZM72 200H40v-32a8 8 0 0 0-16 0v40a8 8 0 0 0 8 8h40a8 8 0 0 0 0-16Zm152-40a8 8 0 0 0-8 8v32h-32a8 8 0 0 0 0 16h40a8 8 0 0 0 8-8v-40a8 8 0 0 0-8-8ZM32 96a8 8 0 0 0 8-8V56h32a8 8 0 0 0 0-16H32a8 8 0 0 0-8 8v40a8 8 0 0 0 8 8Zm48-16a8 8 0 0 0-8 8v80a8 8 0 0 0 16 0V88a8 8 0 0 0-8-8Zm104 88V88a8 8 0 0 0-16 0v80a8 8 0 0 0 16 0Zm-40-88a8 8 0 0 0-8 8v80a8 8 0 0 0 16 0V88a8 8 0 0 0-8-8Zm-32 0a8 8 0 0 0-8 8v80a8 8 0 0 0 16 0V88a8 8 0 0 0-8-8Z" />
                                </svg>
                                <p class="text-[14px] ml-2">Quét barcode</p>
                            </button>
                        </div>
                    </div>
                    <div v-if="isGlobalScanEnabled" class="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded">
                        <i class="fa-solid fa-info-circle mr-2"></i>
                        Chế độ quét toàn cục đang BẬT. Bạn có thể quét mã barcode bất kỳ lúc nào.
                        <span v-if="barcodeBuffer" class="ml-2 font-mono">{{ barcodeBuffer }}</span>
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
                                    <td class="px-6 py-4 font-medium text-gray-900 text-[12px]">{{ inventory.MaSanPham }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] text-ellipsis overflow-hidden max-w-40">
                                        <p class="overflow-hidden text-ellipsis whitespace-nowrap">{{ inventory.TenSanPham }}</p>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                        {{ (inventory.SoLuongTon > 0) ? inventory.SoLuongTon : 'Hết hàng' }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                        {{ formatCurrency(inventory.GiaNhapGanNhat) }} <span class="text-[12px] relative -top-[2px] underline">đ</span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                        {{ formatDate(inventory.NgayCapNhat) }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-if="showScan" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                        <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="font-semibold text-lg">Quét mã BarCode</h3>
                                <button @click="showScan = false"
                                    class="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">
                                    <i class="fa-solid fa-times mr-2"></i>Đóng
                                </button>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="border-2 border-dashed border-blue-300 p-4 rounded-lg">
                                    <h4 class="font-medium mb-3 text-center text-blue-600">
                                        <i class="fa-solid fa-camera mr-2"></i>Camera Scanner
                                    </h4>
                                    <StreamBarcodeReader 
                                        torch 
                                        no-front-cameras 
                                        @decode="onDecode"
                                        @loaded="() => showNotification('Camera sẵn sàng', 'success')"
                                        class="w-full h-48 bg-gray-200 rounded-md" 
                                    />
                                    <p class="text-sm text-gray-500 mt-2 text-center">
                                        Đưa mã barcode vào khung hình
                                    </p>
                                </div>
                                <div class="border-2 border-dashed border-green-300 p-4 rounded-lg">
                                    <h4 class="font-medium mb-3 text-center text-green-600">
                                        <i class="fa-solid fa-barcode mr-2"></i>Máy quét phần cứng
                                    </h4>
                                    <div class="h-48 flex flex-col justify-center">
                                        <input
                                            ref="barcodeInputRef"
                                            v-model="scannedBarcode"
                                            @keydown="handleBarcodeInput"
                                            placeholder="Nhấn vào đây và quét mã barcode..."
                                            class="p-3 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500 text-center text-lg font-mono"
                                            autofocus
                                        />
                                        <button @click="onDecode" 
                                            class="mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                                            <i class="fa-solid fa-search mr-2"></i>Tìm kiếm
                                        </button>
                                    </div>
                                    <p class="text-sm text-gray-500 mt-2 text-center">
                                        Nhấn vào ô input và sử dụng máy quét
                                    </p>
                                </div>
                            </div>
                            <div class="mt-6 border-t pt-4">
                                <h4 class="font-medium mb-3 text-center text-gray-600">
                                    <i class="fa-solid fa-keyboard mr-2"></i>Nhập thủ công
                                </h4>
                                <div class="flex gap-2">
                                    <input
                                        v-model="barcode"
                                        placeholder="Nhập mã barcode thủ công..."
                                        class="flex-1 p-2 border rounded focus:outline-none focus:border-blue-500"
                                    />
                                    <button @click="onDecode" 
                                        class="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                                        <i class="fa-solid fa-search"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="showForm" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                        <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <h3 class="text-lg font-semibold mb-4 text-center">
                                <i class="fa-solid fa-box mr-2"></i>Nhập kho nhanh
                            </h3>
                            <div class="flex flex-col gap-4">
                                <div class="bg-gray-50 p-3 rounded flex flex-col gap-1">
                                    <p><strong>Mã sản phẩm:</strong> {{ product.MaSanPham }}</p>
                                    <p><strong>Tên sản phẩm:</strong> {{ product.TenSanPham }}</p>
                                    <p><strong>Tồn kho hiện tại:</strong> {{ product.SoLuongTon }}</p>
                                    <p><strong>Giá Bán hiện tại:</strong> {{ formatCurrency(product.GiaBan) }} <span class="text-[14px] relative -top-[2px] underline">đ</span></p>
                                    <p><strong>Giá nhập gần nhất:</strong> {{ formatCurrency(product.GiaNhapGanNhat) }} <span class="text-[14px] relative -top-[2px] underline">đ</span></p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">
                                        Nhà cung cấp:
                                    </label>
                                    <select v-model="MaNhaCungCap"
                                        @change="TenNhaCungCap = suppliers.find(s => s.MaNhaCungCap === MaNhaCungCap)?.TenNhaCungCap || ''"
                                        class="w-full p-2 border rounded focus:outline-none focus:border-blue-500">
                                        <option value="">Chọn nhà cung cấp</option>
                                        <option v-for="supplier in suppliers" :key="supplier.MaNhaCungCap"
                                            :value="supplier.MaNhaCungCap">
                                            {{ supplier.TenNhaCungCap }}
                                        </option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium mb-2">
                                        Số lượng nhập:
                                    </label>
                                    <input v-model.number="SoLuongNhap" type="number" min="1"
                                        class="w-full p-2 border rounded focus:outline-none focus:border-blue-500" />
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium mb-2">
                                        Giá nhập:
                                    </label>
                                    <input v-model.number="GiaNhap" type="number" min="0"
                                        class="w-full p-2 border rounded focus:outline-none focus:border-blue-500" />
                                </div>
                                
                                <div class="flex gap-4 justify-end pt-4 border-t">
                                    <button @click="showForm = false"
                                        class="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">
                                        Đóng
                                    </button>
                                    <button @click="addStock"
                                        class="bg-[#003171] text-white py-2 px-4 rounded hover:bg-blue-800">
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

/* Animation for barcode buffer display */
.font-mono {
    font-family: 'Courier New', monospace;
}

/* Focus styles for better UX */
input:focus, select:focus {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Responsive improvements */
@media (max-width: 768px) {
    .grid-cols-1.md\:grid-cols-2 {
        grid-template-columns: 1fr;
    }
}
</style>