<script setup>
import { ref, onMounted, computed } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import NotificationAdmin from "@/components/Notification/NotificationAdmin.vue";
import ConfirmDialog from "@/components/Notification/ConfirmDialog.vue";
import EmtyStateAdmin from '@/components/Notification/EmtyStateAdmin.vue';
import axios from 'axios';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Gán font cho pdfMake
pdfMake.vfs = pdfFonts;

const options = [
    {
        name: "Tất cả đơn hàng",
        icon: "fa-solid fa-list"
    },
    {
        name: "Đang chờ xác nhận",
        icon: "fa-solid fa-wallet"
    },
    {
        name: "Đã xác nhận đơn",
        icon: "fa-solid fa-box"
    },
    {
        name: "Đã được chuyển đi",
        icon: "fa-solid fa-truck-fast"
    },
    {
        name: "Đã giao thành công",
        icon: "fa-solid fa-circle-check"
    },
    {
        name: "Đã trả hàng",
        icon: "fa-solid fa-rotate-left"
    },
    {
        name: "Đơn hàng đã hủy",
        icon: "fa-solid fa-times-circle"
    },
]
const TenAdmin = localStorage.getItem("TenAdmin");
const ThoiGian = new Date()

const listOrders = ref([]);
const selectedType = ref("Tất cả đơn hàng");
const searchValue = ref("");
const filterYear = ref("");
const filterMonth = ref("");
const filterDay = ref("");
const refreshKey = ref(0); // Thêm key để force re-render
const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString());
const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

const notification = ref({
    message: '',
    type: ''
});

// Dialog state với props
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

const showNotification = (msg, type) => {
    notification.value = { message: msg, type: type };
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
};

const selectTypeOrders = (type) => {
    selectedType.value = type;
};

const fetchOrders = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/donhang');
        listOrders.value = response.data.map(order => {
            return {
                ...order,
                NgayDatHang: new Date(order.NgayDatHang)
            }
        })

        const ordersNormal = listOrders.value.filter(order => 
            order.TrangThaiDon !== 'Đã trả hàng' && order.TrangThaiDon !== 'Đơn hàng đã hủy'
        );
        const ordersSpecial = listOrders.value.filter(order => 
            order.TrangThaiDon === 'Đã trả hàng' || order.TrangThaiDon === 'Đơn hàng đã hủy'
        );
        
        listOrders.value = [
            ...ordersNormal.sort((a, b) => b.NgayDatHang - a.NgayDatHang), 
            ...ordersSpecial.sort((a, b) => b.NgayDatHang - a.NgayDatHang)
        ];
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

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

// Hàm lấy danh sách trạng thái có thể cập nhật
const getAvailableStatuses = (currentStatus) => {
    // Danh sách tất cả trạng thái (bỏ "Tất cả đơn hàng")
    const allStatuses = options.filter(option => option.name !== "Tất cả đơn hàng");
    
    switch (currentStatus) {
        case "Đang chờ xác nhận":
            // Từ "Đang chờ xác nhận" có thể chuyển thành các trạng thái tiếp theo
            return allStatuses.filter(status => 
                ["Đã xác nhận đơn"].includes(status.name)
            );
            
        case "Đã xác nhận đơn":
            // Có thể tới và lui với "Đã được chuyển đi", có thể quay về "Đang chờ xác nhận"
            return allStatuses.filter(status => 
                ["Đã được chuyển đi", "Đã giao thành công", "Đã trả hàng"].includes(status.name)
            );
            
        case "Đã được chuyển đi":
            // Có thể tới và lui với "Đã xác nhận đơn"
            return allStatuses.filter(status => 
                ["Đã xác nhận đơn", "Đã giao thành công", "Đã trả hàng"].includes(status.name)
            );
            
        case "Đã giao thành công":
            return [];
            
        case "Đã trả hàng":
            return [];
            
        case "Đơn hàng đã hủy":
            return [];
            
        default:
            return [];
    }
};

// Hàm xử lý thay đổi trạng thái
const handleStatusChange = (maDonHang, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return;
    
    showConfirmDialog({
        title: 'Thông báo xác nhận',
        message: `Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng từ "${currentStatus}" thành "${newStatus}" không?`,
        type: 'info',
        confirmText: 'Cập nhật',
        cancelText: 'Hủy bỏ',
        onConfirm: async () => {
            try {
                const response = await axios.patch(`http://localhost:3000/api/donhang/trangthai/${maDonHang}`, {
                    newStatus: newStatus,
                });

                const notificationData = {
                    ThongBao: `Đã cập nhật trạng thái đơn hàng ${maDonHang} từ "${currentStatus}" thành "${newStatus}"`,
                    NguoiChinhSua: TenAdmin,
                    ThoiGian: ThoiGian,
                };

                // Lưu thông báo vào database
                await axios.post('http://localhost:3000/api/thongbao', notificationData);
                
                // Cập nhật trạng thái trực tiếp trong mảng để tránh phải fetch lại toàn bộ
                const orderIndex = listOrders.value.findIndex(order => order.MaDonHang === maDonHang);
                if (orderIndex !== -1) {
                    listOrders.value[orderIndex].TrangThaiDon = newStatus;
                    listOrders.value = [...listOrders.value];
                    refreshKey.value++;
                }
                
                showNotification("Cập nhật trạng thái đơn hàng thành công!", "success");
            } catch (err) {
                showNotification("Lỗi khi cập nhật trạng thái đơn hàng!", "error");
                console.error("Error updating order status:", err);
            }
        }
    });
};

const fetchOrderByDayMonth = async () => {
    try {
        const params = {};
        if (filterYear.value) params.year = filterYear.value;
        if (filterMonth.value) params.month = filterMonth.value;
        if (filterDay.value) params.day = filterDay.value;

        const response = await axios.get('http://localhost:3000/api/donhang/locdonhang/ngaythangnam', { params });
        listOrders.value = response.data.map(order => ({
            ...order,
            NgayDatHang: new Date(order.NgayDatHang)
        }));

        const ordersNormal = listOrders.value.filter(order => 
            order.TrangThaiDon !== 'Đã trả hàng' && order.TrangThaiDon !== 'Đơn hàng đã hủy'
        );
        const ordersSpecial = listOrders.value.filter(order => 
            order.TrangThaiDon === 'Đã trả hàng' || order.TrangThaiDon === 'Đơn hàng đã hủy'
        );

        listOrders.value = [
            ...ordersNormal.sort((a, b) => b.NgayDatHang - a.NgayDatHang),
            ...ordersSpecial.sort((a, b) => b.NgayDatHang - a.NgayDatHang)
        ];
    } catch (err) {
        console.log("Lỗi khi lọc đơn hàng", err);
    }
}

const exportOrderToPDF = async (order) => {
    // Hiển thị dialog xác nhận xuất PDF
    showConfirmDialog({
        title: 'Thông báo xác nhận',
        message: `Bạn có muốn xuất hóa đơn cho đơn hàng ${order.MaDonHang} không?`,
        type: 'info',
        confirmText: 'Xuất hóa đơn',
        cancelText: 'Hủy bỏ',

        onConfirm: async () => {
            try {
                // Tính thành tiền cho từng sản phẩm
                const productsWithTotal = order.SanPhamDaMua.map(product => ({
                    ...product,
                    ThanhTien: product.SoLuong * product.Gia
                }));

                const docDefinition = {
                    content: [
                        { text: 'C3 GUNDAM STORE', style: 'header' },
                        { text: 'Địa chỉ: Đường 96 - Tân Phú - TX.Long Mỹ - Hậu Giang', style: 'subheader' },
                        { text: 'Điện thoại: 079.965.8592', style: 'subheader' },
                        { text: '_______________________________________________________________________________________________', alignment: 'center' },
                        { text: '\nHÓA ĐƠN BÁN HÀNG', style: 'title' },
                        { text: `Số: ${order.MaDonHang}`, style: 'subheader' },
                        { text: '\nTHÔNG TIN KHÁCH HÀNG & GIAO DỊCH', style: 'sectionHeader' },
                        { text: `Ngày xuất: ${formatDate(order.NgayDatHang)}`, style: 'subheader2' },
                        { text: `Khách hàng: ${order.DiaChiNhanHang[0]?.TenNguoiNhan || 'Không có'}`, style: 'subheader2' },
                        { text: '\nCHI TIẾT SẢN PHẨM', style: 'sectionHeader' },
                        {
                            table: {
                                headerRows: 1,
                                widths: ['*', 'auto', 'auto', 'auto'],
                                body: [
                                    ['Mã sản phẩm', 'Tên sản phẩm', 'Số lượng', 'Đơn giá'],
                                    ...productsWithTotal.map(product => [
                                        product.MaSanPham,
                                        product.TenSanPham || 'N/A',
                                        product.SoLuong || 0,
                                        formatCurrency(product.Gia || 0)
                                    ])
                                ]
                            }
                        },
                        { text: `\nPhí giao hàng: ${order.HinhThucVanChuyen}`, style: 'subheader3' },
                        { text: '_______________________________________________________________________________________________', alignment: 'center' },
                        { text: `\nTỔNG CỘNG THANH TOÁN: ${formatCurrency(order.TongDon || 0)} VND`, style: 'total' },
                        { text: '\n', margin: [0, 10] },
                        {
                            columns: [
                                { text: 'Người lập phiếu', alignment: 'center', margin: [0, 0, 0, 20] },
                                { text: 'Người giao hàng', alignment: 'center', margin: [0, 0, 0, 20] },
                                { text: 'Khách hàng', alignment: 'center', margin: [0, 0, 0, 20] }
                            ]
                        },
                        {
                            columns: [
                                { text: '(Ký, ghi rõ họ tên)', alignment: 'center' },
                                { text: '(Ký, ghi rõ họ tên)', alignment: 'center' },
                                { text: '(Ký, ghi rõ họ tên)', alignment: 'center' }
                            ]
                        },
                        {
                            columns: [
                                { text: '_________________________', alignment: 'center' },
                                { text: '_________________________', alignment: 'center' },
                                { text: '_________________________', alignment: 'center' }
                            ]
                        }
                    ],
                    styles: {
                        header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 5] },
                        title: { fontSize: 16, bold: true, alignment: 'center', margin: [0, 10, 0, 5] },
                        subheader: { fontSize: 10, margin: [0, 2, 0, 2], alignment: 'center' },
                        subheader2: { fontSize: 10, margin: [0, 2, 0, 2] },
                        subheader3: { fontSize: 10, margin: [0, 2, 0, 2], alignment: 'right' },
                        sectionHeader: { fontSize: 12, bold: true, margin: [0, 10, 0, 5] },
                        total: { fontSize: 12, bold: true, alignment: 'right', margin: [0, 2, 0, 5] }
                    }
                };

                // Tạo và tải file PDF
                pdfMake.createPdf(docDefinition).download(`HoaDon_${order.MaDonHang}.pdf`);
                showNotification('Xuất hóa đơn thành công!', 'success');
            } catch (error) {
                console.error('Lỗi khi xuất PDF:', error.message);
                showNotification('Lỗi khi xuất hóa đơn PDF!', 'error');
            }
        }
    });
};

const filteredOrders = computed(() => {
    return listOrders.value.filter(order => {
        const matchesType = selectedType.value === "Tất cả đơn hàng" || order.TrangThaiDon === selectedType.value;
        const matchesSearch = !searchValue.value || order.DiaChiNhanHang.some(item =>
            item.TenNguoiNhan.toLowerCase().includes(searchValue.value.toLowerCase())
        );
        const nameProducts = !searchValue.value || order.SanPhamDaMua.some(item =>
            item.TenSanPham.toLowerCase().includes(searchValue.value.toLowerCase())
        );
        return matchesType && (matchesSearch || nameProducts);
    });
});

const resetFilter = () => {
    filterYear.value = "";
    filterMonth.value = "";
    filterDay.value = "";
    fetchOrders();
};

const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' };
    const formattedDate = date.toLocaleDateString('vi-VN', options);

    return formattedDate;
};

function formatCurrency(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

onMounted(() => {
    fetchOrders();
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
                    <div class="flex lg:flex-row flex-col gap-4 justify-center lg:justify-between items-center">
                        <h1 class="font-bold text-[20px] uppercase">Quản lý đơn hàng</h1>
                    </div>
                    <div class="w-full flex lg:flex-row flex-col gap-8 items-start">
                        <div class="flex flex-col gap-5 bg-white p-4 rounded-lg shadow-lg w-full lg:w-1/3">
                            <div class="flex flex-col gap-2">
                                <p class="font-semibold text-[18px]">Điều chỉnh đơn hàng</p>
                                <button v-for="option in options" :key="option"
                                    @click.prevent="selectTypeOrders(option.name)"
                                    class="border-2 px-5 py-3 flex xl:text-[14px] justify-start items-center gap-4 rounded-md hover:border-[#003171] hover:text-[#003171] transition-all duration-300">
                                    <i :class="option.icon"></i> {{ option.name }}
                                </button>
                            </div>
                        </div>
                        <div class="flex flex-col gap-6 w-full">
                            <div class="relative flex justify-center gap-2 w-full lg:max-w-[calc(100vw-200px)]">
                                <input type="text" v-model="searchValue"
                                    class="items-center w-full p-3 bg-white border pr-10 border-gray-400 text-[12px] font-semibold tracking-wider text-black rounded-md focus:outline-none"
                                    placeholder="Tìm kiếm đơn hàng ..." />
                                <i
                                    class="fa-solid fa-magnifying-glass absolute top-2 lg:top-3 right-3 text-[22px] text-[#003171]"></i>
                            </div>
                            <div class="flex justify-end items-center gap-4">
                                <select v-model="filterDay"
                                    class="p-2 border-2 border-[#333] rounded-md font-semibold outline-none w-full">
                                    <option value="">Chọn ngày (tùy chọn)</option>
                                    <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
                                </select>
                                <select v-model="filterMonth"
                                    class="p-2 border-2 border-[#333] rounded-md font-semibold outline-none w-full">
                                    <option value="">Chọn tháng (tùy chọn)</option>
                                    <option v-for="month in months" :key="month" :value="month">Tháng {{ month }}
                                    </option>
                                </select>
                                <select v-model="filterYear"
                                    class="p-2 border-2 border-[#333] rounded-md font-semibold outline-none w-full">
                                    <option value="">Chọn năm (tùy chọn)</option>
                                    <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                                </select>
                                <div class="flex gap-2">
                                    <button @click="fetchOrderByDayMonth"
                                        class="px-4 py-2 bg-[#003171] text-white rounded-md hover:bg-[#1A1D27]">Lọc</button>
                                    <button @click="resetFilter"
                                        class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Reset</button>
                                </div>
                            </div>
                            <div v-if="filteredOrders.length > 0"
                                class="flex flex-col gap-8 overflow-y-auto max-h-[calc(100vh-200px)] xl:max-h-[calc(100vh-180px)]">
                                <div v-for="(order) in filteredOrders" :key="`${order.MaDonHang}-${refreshKey}`"
                                    class="bg-white p-4 w-full border-2 rounded-lg shadow-lg flex flex-col gap-4">
                                    <div
                                        class="flex flex-col lg:flex-row items-center justify-center lg:justify-between">
                                        <p class="text-[14px] xl:text-[12px] font-semibold">Ngày đặt hàng: <span
                                                class="text-[#003171]">{{
                                                    formatDate(order.NgayDatHang) }}</span></p>
                                        <p class="text-[14px] xl:text-[12px] font-semibold">{{ order.TrangThaiDon }}</p>
                                    </div>
                                    <hr>
                                    <div class="overflow-y-auto max-h-[300px] flex flex-col gap-4">
                                        <div class="flex gap-4 border-b-2 pb-4 mb-3 overflow-hidden items-start"
                                            v-for="(product, index) in order.SanPhamDaMua" :key="index">
                                            <img :src="`${product.HinhAnh}`" class="w-[100px]" alt="">
                                            <div class="flex flex-col gap-1 overflow-hidden">
                                                <div
                                                    class="whitespace-nowrap text-ellipsis overflow-hidden max-w-52 lg:max-w-[700px]">
                                                    <p
                                                        class="text-[16px] xl:text-[14px] overflow-hidden font-semibold text-ellipsis whitespace-nowrap">
                                                        {{ product.TenSanPham }}</p>
                                                </div>
                                                <p class="text-[14px] xl:text-[12px] font-semibold">Loại sản phẩm: <span
                                                        class="text-[#003171] font-medium">{{ product.LoaiSanPham
                                                        }}</span>
                                                </p>
                                                <p class="text-[14px] xl:text-[12px] font-semibold">Đơn giá: <span
                                                        class="text-[#003171] font-medium">{{
                                                        formatCurrency(product.Gia) }}
                                                        <span class="text-[12px] relative -top-[2px] underline">đ</span></span></p>
                                                <p class="text-[14px] xl:text-[12px] font-semibold">Số lượng: <span
                                                        class="text-[#003171] font-medium">{{ product.SoLuong }}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex flex-col gap-3">
                                        <h3 class="text-[18px] font-semibold">Thông tin khách hàng</h3>
                                        <div class="flex flex-col lg:flex-row lg:justify-between">
                                            <div v-for="(address, index) in order.DiaChiNhanHang" :key="index">
                                                <p class="font-medium text-[14px] xl:text-[12px]">Mã khách hàng: <span
                                                        class="font-semibold">{{
                                                            order.MaKhachHang }}</span></p>
                                                <p class="font-medium text-[14px] xl:text-[12px]">Tên khách hàng: <span
                                                        class="font-semibold">{{ address.TenNguoiNhan }}</span></p>
                                                <p class="font-medium text-[14px] xl:text-[12px]">Số điện thoại: <span
                                                        class="font-semibold">{{
                                                            address.DienThoai }}</span></p>
                                                <p class="font-medium text-[14px] xl:text-[12px]">Địa chỉ nhận hàng:
                                                    <span class="font-semibold">{{ address.DiaChi }}</span></p>
                                                <p class="font-medium text-[14px] xl:text-[12px]">Hình thức vận chuyển:
                                                    <span class="font-semibold text-[#003171]">{{
                                                        order.HinhThucVanChuyen
                                                        }}</span>
                                                </p>
                                            </div>
                                            <div>
                                                <p class="font-medium text-[14px] xl:text-[12px]">Trạng thái: <span
                                                        class="font-semibold">{{
                                                            order.TrangThaiThanhToan }}</span></p>
                                                <p class="font-medium text-[14px] xl:text-[12px]">Hình thức thanh toán:
                                                    <span class="font-semibold">{{ order.HinhThucThanhToan }}</span>
                                                </p>
                                                <p class="font-medium text-[14px] xl:text-[12px]">Mã giảm giá: <span
                                                        class="font-semibold">{{
                                                            order.IdMaGiamGia === "" ? "Không sử dụng" : order.IdMaGiamGia
                                                        }}</span></p>
                                                <p class="font-medium text-[14px] xl:text-[12px]">Ghi chú: <span
                                                        class="font-semibold">{{
                                                            order.GhiChu }}</span></p>
                                                <p class="font-medium text-[14px] xl:text-[12px]">Tổng đơn: <span
                                                        class="font-semibold text-[#003171]">{{
                                                            formatCurrency(order.TongDon) }}
                                                        <span class="text-[12px] relative -top-[2px] underline">đ</span></span></p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex flex-col lg:flex-row justify-center lg:justify-end gap-4 items-center" :key="`actions-${order.MaDonHang}-${refreshKey}`">
                                        <button :class="(order.TrangThaiDon === 'Đã trả hàng' || order.TrangThaiDon === 'Đơn hàng đã hủy') ? 'hidden' : 'block'"
                                            @click="exportOrderToPDF(order)"
                                            class="px-5 py-2 rounded-md font-semibold text-white text-[14px] bg-[#003171] transition-all duration-300 hover:bg-[#1A1D27]">Xuất
                                            hóa đơn</button>
                                        
                                        <!-- Dropdown chọn trạng thái -->
                                        <div v-if="getAvailableStatuses(order.TrangThaiDon).length > 0" class="relative">
                                            <select 
                                                @change="handleStatusChange(order.MaDonHang, order.TrangThaiDon, $event.target.value)"
                                                class="px-5 py-2 rounded-md font-semibold text-white text-[14px] bg-[#1A1D27] hover:bg-[#003171] transition-all duration-300 outline-none cursor-pointer min-w-[200px]"
                                                :key="`select-${order.MaDonHang}-${refreshKey}`"
                                            >
                                                <option :value="order.TrangThaiDon" selected disabled>
                                                    {{ order.TrangThaiDon }}
                                                </option>
                                                <option 
                                                    v-for="status in getAvailableStatuses(order.TrangThaiDon)" 
                                                    :key="status.name" 
                                                    :value="status.name"
                                                    class="bg-white text-black"
                                                >
                                                    {{ status.name }}
                                                </option>
                                            </select>
                                        </div>
                                        
                                        <!-- Hiển thị thông báo khi không thể thay đổi trạng thái -->
                                        <div v-else-if="order.TrangThaiDon === 'Đã trả hàng'" class="px-5 py-2 rounded-md font-semibold text-white text-[14px] bg-orange-500">
                                            Đã trả hàng
                                        </div>
                                        
                                        <!-- Hiển thị thông báo cho đơn hàng đã hủy -->
                                        <div v-else-if="order.TrangThaiDon === 'Đơn hàng đã hủy'" class="px-5 py-2 rounded-md font-semibold text-white text-[14px] bg-red-500">
                                            Đơn hàng đã hủy
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-else
                                class="bg-white p-4 w-full border-2 rounded-lg shadow-lg flex items-center justify-center">
                                <EmtyStateAdmin icon="fa-bag-shopping" title="Chưa có đơn hàng nào" message="Hiện tại chưa có đơn hàng nào hoặc chưa có đơn nào phù hợp với trạng thái vừa chọn!" />
                            </div>
                        </div>
                    </div>
                </div>
                <NotificationAdmin :message="notification.message" :type="notification.type" />
            </div>
        </div>
        <ConfirmDialog
            :visible="dialogState.visible"
            :title="dialogState.title"
            :message="dialogState.message"
            :type="dialogState.type"
            :confirmText="dialogState.confirmText"
            :cancelText="dialogState.cancelText"
            @confirm="handleDialogConfirm"
            @cancel="handleDialogCancel"
            @close="handleDialogClose"
        />
    </div>
</template>

<style scoped>
.active-link {
    background: #DB3F4C;
    color: white;
}

/* Custom styling for select dropdown */
select option {
    padding: 8px 12px;
}

select option:hover {
    background-color: #f3f4f6;
}
</style>