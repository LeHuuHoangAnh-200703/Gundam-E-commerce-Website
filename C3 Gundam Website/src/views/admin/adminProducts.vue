<script setup>
import { ref, onMounted, computed, nextTick, watch } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import ConfirmDialog from "@/components/Notification/ConfirmDialog.vue";
import NotificationAdmin from "@/components/Notification/NotificationAdmin.vue";
import JsBarcode from 'jsbarcode';
import axios from 'axios';

const listProducts = ref([]);
const searchValue = ref('');
const selectedType = ref('');
const listProductTypes = ref('');
const TenAdmin = localStorage.getItem("TenAdmin");
const ThoiGian = new Date();

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

const fetchProducts = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/sanpham');
        listProducts.value = response.data.map(product => {
            return {
                ...product,
                NgayBan: new Date(product.NgayBan)
            };
        });
        listProducts.value.sort((a, b) => b.NgayBan - a.NgayBan);
        // Tạo mã vạch sau khi danh sách sản phẩm được tải
        nextTick(() => {
            generateBarcodes();
        });
    } catch (error) {
        console.error('Error fetching:', error);
    }
};

const fetchProductType = async () => {
    try {
        const response = await axios.get("http://localhost:3000/api/loaisanpham");
        listProductTypes.value = response.data.map(producttype => {
            return {
                ...producttype
            }
        })
    } catch (error) {
        console.error('Error fetching:', error);
    }
}

const updateStatus = async (maSanPham, newStatus, tenSanPham) => {
    showConfirmDialog({
        title: 'Thông báo xác nhận',
        message: 'Bạn có chắc chắn về việc cập nhật trạng thái này không?',
        type: 'info',
        confirmText: 'Cập nhật',
        cancelText: 'Hủy bỏ',
        onConfirm: async () => {
            const nextStatus = newStatus === 'Đang bán' ? 'Ngừng kinh doanh' : 'Đang bán';
            try {
                const response = await axios.patch(`http://localhost:3000/api/sanpham/${maSanPham}`, {
                    TrangThai: nextStatus,
                });

                const notificationData = {
                    ThongBao: `Vừa cập nhật trạng thái ${tenSanPham}`,
                    NguoiChinhSua: TenAdmin,
                    ThoiGian: ThoiGian,
                };

                await axios.post('http://localhost:3000/api/thongbao', notificationData);
                await fetchProducts();
                showNotification("Cập nhật trạng thái thành công!", "success");
            } catch (error) {
                console.error('Error updating order status:', error);
            }
        }
    });
};

const findProducts = computed(() => {
    return listProducts.value.filter(product => {
        const matchesType = selectedType.value === "" || selectedType.value === "All" || product.LoaiSanPham === selectedType.value;
        const matchesSearch = !searchValue.value || 
            product.TenSanPham.toLowerCase().includes(searchValue.value.toLowerCase()) ||
            product.MaSanPham.toLowerCase().includes(searchValue.value.toLowerCase());
        return matchesType && matchesSearch;
    });
});

function formatCurrency(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatCurrencySale(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Hàm tạo mã vạch
const generateBarcodes = () => {
    findProducts.value.forEach(product => {
        const barcodeElement = document.getElementById('barcode' + product.MaSanPham);
        if (barcodeElement && product.BarCode && product.BarCode.trim() !== '') {
            try {
                // Xóa nội dung cũ trước khi tạo mới
                barcodeElement.innerHTML = '';
                JsBarcode(barcodeElement, product.BarCode, {
                    format: 'CODE128',
                    width: 2,
                    height: 50,
                    displayValue: true,
                    fontSize: 12,
                    margin: 0
                });
            } catch (error) {
                console.error('Error generating barcode for product', product.MaSanPham, error);
            }
        } else {
            console.warn('Barcode element or BarCode value not found/missing for product', product.MaSanPham);
        }
    });
};

// Theo dõi thay đổi của findProducts và tạo lại barcode
watch(findProducts, () => {
    nextTick(() => {
        generateBarcodes();
    });
}, { deep: true });

// Theo dõi thay đổi của searchValue và selectedType
watch([searchValue, selectedType], () => {
    nextTick(() => {
        generateBarcodes();
    });
});

onMounted(() => {
    fetchProducts();
    fetchProductType();
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
                    <div class="flex lg:flex-row flex-col gap-4 justify-center lg:justify-between items-center">
                        <h1 class="font-bold text-[20px] uppercase">Quản lý sản phẩm</h1>
                        <div class="flex gap-4 items-center">
                            <div class="relative flex justify-center flex-1 gap-2 max-w-xl w-[60%]">
                                <input type="text" v-model="searchValue"
                                    class="items-center w-full p-3 bg-white border pr-10 border-gray-400 text-[12px] font-semibold tracking-wider text-black rounded-md focus:outline-none"
                                    placeholder="Tìm kiếm sản phẩm ..." />
                                <i
                                    class="fa-solid fa-magnifying-glass absolute top-2 lg:top-3 right-3 text-[22px] text-[#003171]"></i>
                            </div>
                            <select v-model="selectedType" name="" id="" class="w-[40%] p-3 bg-white border pr-10 border-gray-400 text-[12px] font-semibold tracking-wider text-black rounded-md focus:outline-none">
                                <option value="">Tất cả</option>
                                <option :value="productType.LoaiSanPham" v-for="productType in listProductTypes" :key="productType.MaLoaiSanPham">
                                    {{ productType.TenLoaiSanPham }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="shadow-lg border-2 border-gray-300 overflow-auto">
                        <table class="w-full bg-white whitespace-nowrap text-center text-gray-500">
                            <thead class="bg-[#1A1D27] text-white sticky top-0 z-10">
                                <tr>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">STT</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mã sản phẩm</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Ảnh sản phẩm</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Tên sản phẩm</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Giá bán</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Giá sale</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Loại sản phẩm</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Nhà cung cấp</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mã barcode</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Còn lại</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Đã bán</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Trạng thái</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mô tả</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Điều chỉnh</th>
                                </tr>
                            </thead>
                            <tbody class="w-full">
                                <tr class="border-t border-slate-500" v-for="(product, index) in findProducts"
                                    :key="index">
                                    <td class="px-6 py-4 font-medium text-gray-900 text-[12px]">{{ index + 1 }}
                                    </td>
                                    <td class="px-6 py-4 font-medium text-gray-900 text-[12px]">{{ product.MaSanPham }}
                                    </td>
                                    <td>
                                        <img class="w-[100px] py-2 max-w-full ml-7" :src="`${product.Images[0]}`"
                                            alt="Hình ảnh sản phẩm" />
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-[12px] text-ellipsis overflow-hidden max-w-40">
                                        <p class="overflow-hidden text-ellipsis whitespace-nowrap">{{ product.TenSanPham
                                        }}</p>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                        {{ formatCurrency(product.GiaBan) }} <span class="text-[12px] relative -top-[2px] underline">đ</span></td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                        {{ formatCurrencySale(product.GiaSale) }} <span class="text-[12px] relative -top-[2px] underline">đ</span></td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">{{
                                        product.LoaiSanPham }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">{{
                                        product.TenNhaCungCap }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                        <svg :id="'barcode' + product.MaSanPham"
                                            style="width: 150px; height: 50px;"></svg>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                        {{ (product.SoLuong > 0) ? product.SoLuong : 'Hết hàng' }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                        {{ (product.LuotBan) ? product.LuotBan : 0 }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">{{
                                        product.TrangThai }}
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-[12px] text-ellipsis overflow-hidden max-w-40">
                                        <p class="overflow-hidden text-ellipsis text-[12px] whitespace-nowrap">{{
                                            product.MoTa }}</p>
                                    </td>
                                    <td class="flex justify-center items-center gap-2 py-10 pr-4">
                                        <a :href="`/admin/editProduct/${product.MaSanPham}`"
                                            class="inline-block bg-[#00697F] text-white font-medium py-2 px-4 rounded-md transition-all duration-300 hover:bg-[#055565] whitespace-nowrap"><i
                                                class="fa-solid fa-pen-to-square"></i></a>
                                        <button
                                            @click="updateStatus(product.MaSanPham, product.TrangThai, product.TenSanPham)"
                                            class="inline-block text-white font-medium bg-[#003171] py-2 px-4 rounded-md transition-all duration-300 hover:bg-[#1c5ab2] whitespace-nowrap">
                                            <i class="fa-solid fa-repeat"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <NotificationAdmin :message="notification.message" :type="notification.type" />
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