<script setup>
import { ref, onMounted, computed } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import NotificationAdmin from "@/components/Notification/NotificationAdmin.vue";
import axios from 'axios';

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
        name: "Đang chờ lấy hàng",
        icon: "fa-solid fa-box"
    },
    {
        name: "Đã được chuyển đi",
        icon: "fa-solid fa-truck-fast"
    },
    {
        name: "Đã nhận được hàng",
        icon: "fa-solid fa-thumbs-up"
    },
    {
        name: "Đã giao thành công",
        icon: "fa-solid fa-circle-check"
    },
    {
        name: "Đơn hàng đã hủy",
        icon: "fa-solid fa-trash"
    },
]

const listOrders = ref([]);
const selectedType = ref("Tất cả đơn hàng");
const searchValue = ref("");
const filterYear = ref("");
const filterMonth = ref("");
const filterDay = ref("");
const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString());
const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

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

        const ordersNormal = listOrders.value.filter(order => order.TrangThaiDon !== 'Đơn hàng đã hủy');
        const ordersLost = listOrders.value.filter(order => order.TrangThaiDon === 'Đơn hàng đã hủy');
        listOrders.value = [...ordersNormal.sort((a, b) => b.NgayDatHang - a.NgayDatHang), ...ordersLost.sort((a, b) => b.NgayDatHang - a.NgayDatHang)];
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

const updatedStatus = async (maDonHang, currentStatus) => {
    const confirmUpdate = confirm('Bạn có chắc chắn cập nhật đơn hàng này chưa?');
    if (!confirmUpdate) return;
    const currentIndex = options.findIndex(option => option.name === currentStatus);
    const nextIndex = currentIndex + 1;

    if (currentStatus === "Đã giao thành công") {
        showNotification("Trạng thái đơn hàng đã ở trạng thái cuối cùng!", "error");
        return;
    }

    if (options[nextIndex]?.name === "Đơn hàng đã hủy") {
        showNotification("Không thể cập nhật trạng thái đơn hàng đã hủy!", "error");
        return;
    }

    if (nextIndex >= options.length) {
        showNotification("Trạng thái đơn hàng đã ở trạng thái cuối cùng!", "error");
        return;
    }

    const newStatus = options[nextIndex].name;

    try {
        const response = await axios.patch(`http://localhost:3000/api/donhang/trangthai/${maDonHang}`, {
            newStatus: newStatus,
        });
        await fetchOrders();
        console.log("Status updated successfully:", response.data);
    } catch (err) {
        console.log("Error updating status:", err);
    }
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

        const ordersNormal = listOrders.value.filter(order => order.TrangThaiDon !== 'Đơn hàng đã hủy');
        const ordersLost = listOrders.value.filter(order => order.TrangThaiDon === 'Đơn hàng đã hủy');

        listOrders.value = [
            ...ordersNormal.sort((a, b) => b.NgayDatHang - a.NgayDatHang),
            ...ordersLost.sort((a, b) => b.NgayDatHang - a.NgayDatHang)
        ];
    } catch (err) {
        console.log("Lỗi khi lọc đơn hàng", err);
    }
}

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
    <div class="relative bg-[#F2F2F7] w-full min-h-screen font-sans">
        <div class="flex gap-3">
            <SideBar />
            <div class="relative p-4 flex flex-col gap-4 w-full overflow-auto">
                <Navbar />
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
                            <select v-model="filterDay" class="p-2 border-2 rounded-md font-semibold outline-none w-full">
                                <option value="">Chọn ngày (tùy chọn)</option>
                                <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
                            </select>
                            <select v-model="filterMonth" class="p-2 border-2 rounded-md font-semibold outline-none w-full">
                                <option value="">Chọn tháng (tùy chọn)</option>
                                <option v-for="month in months" :key="month" :value="month">Tháng {{ month }}</option>
                            </select>
                            <select v-model="filterYear" class="p-2 border-2 rounded-md font-semibold outline-none w-full">
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
                            class="flex flex-col gap-8 w-full overflow-y-auto max-h-[calc(100vh-200px)] xl:max-h-[calc(100vh-180px)]">
                            <div v-for="(order, index) in filteredOrders" :key="index"
                                class="bg-white p-4 w-full border-2 rounded-lg shadow-lg flex flex-col gap-4">
                                <div class="flex flex-col lg:flex-row items-center justify-center lg:justify-between">
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
                                            <div class="whitespace-nowrap text-ellipsis overflow-hidden">
                                                <p
                                                    class="text-[16px] xl:text-[14px] overflow-hidden font-semibold text-ellipsis whitespace-nowrap">
                                                    {{ product.TenSanPham }}</p>
                                            </div>
                                            <p class="text-[14px] xl:text-[12px] font-semibold">Loại sản phẩm: <span
                                                    class="text-[#003171] font-medium">{{ product.LoaiSanPham }}</span>
                                            </p>
                                            <p class="text-[14px] xl:text-[12px] font-semibold">Đơn giá: <span
                                                    class="text-[#003171] font-medium">{{ formatCurrency(product.Gia) }}
                                                    VNĐ</span></p>
                                            <p class="text-[14px] xl:text-[12px] font-semibold">Số lượng: <span
                                                    class="text-[#003171] font-medium">{{ product.SoLuong }}</span></p>
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
                                            <p class="font-medium text-[14px] xl:text-[12px]">Địa chỉ nhận hàng: <span
                                                    class="font-semibold">{{ address.DiaChi }}</span></p>
                                            <p class="font-medium text-[14px] xl:text-[12px]">Hình thức vận chuyển:
                                                <span class="font-semibold text-[#003171]">{{ order.HinhThucVanChuyen
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
                                                    VNĐ</span></p>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex justify-center lg:justify-end">
                                    <button :class="(order.TrangThaiDon === 'Đã được chuyển đi') ? 'hidden' : 'block'"
                                        @click="updatedStatus(order.MaDonHang, order.TrangThaiDon)"
                                        class="px-5 py-2 rounded-md font-semibold text-white text-[14px] bg-[#1A1D27] transition-all duration-300 hover:bg-[#003171]">{{
                                            order.TrangThaiDon }}</button>
                                </div>
                            </div>
                        </div>
                        <div v-else
                            class="bg-white p-4 w-full border-2 rounded-lg shadow-lg flex items-center justify-center">
                            <div class="flex justify-center items-center m-auto w-full h-full">
                                <div class="flex flex-col items-center justify-center gap-3">
                                    <p class="font-semibold text-[18px] lg:text-[24px] text-center">Hiện tại
                                        không có đơn hàng nào!</p>
                                    <img src="../../assets/img/empty_admin.png" class="w-[350px]" alt="">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <NotificationAdmin :message="notification.message" :type="notification.type" />
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