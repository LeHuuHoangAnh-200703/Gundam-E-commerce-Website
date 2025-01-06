<script setup>
import { ref, onMounted, computed } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
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
]

const listOrders = ref([]);
const selectedType = ref("Tất cả đơn hàng");
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
        listOrders.value.sort((a, b) => b.NgayDatHang - a.NgayDatHang);
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

const updatedStatus = async (maDonHang, currentStatus) => {
    const confirmUpdate = confirm('Bạn có chắc chắn cập nhật đơn hàng này chưa?');
    if (!confirmUpdate) return;
    const currentIndex = options.findIndex(option => option.name === currentStatus);
    const nextIndex = currentIndex + 1;

    if (nextIndex >= options.length) {
        notification.value = {
            message: "Trạng thái đơn hàng đã ở trạng thái cuối cùng.",
            type: "error",
        };
        setTimeout(() => {
            notification.value.message = '';
        }, 3000);
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

const filterOrders = computed(() => {
    return listOrders.value.filter(order => {
        const matchesType = selectedType.value === "Tất cả đơn hàng" || order.TrangThaiDon === selectedType.value;
        return matchesType;
    })
})

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
                    <h1 class="font-bold text-[20px]">Quản lý đơn hàng</h1>
                </div>
                <div class="w-full flex lg:flex-row flex-col gap-8 items-start">
                    <div class="flex flex-col gap-5 bg-white p-4 rounded-lg shadow-lg w-full lg:w-1/3">
                        <div class="flex flex-col gap-2">
                            <p class="font-semibold text-[18px]">Điều chỉnh đơn hàng</p>
                            <button v-for="option in options" :key="option"
                                @click.prevent="selectTypeOrders(option.name)"
                                class="border-2 px-5 py-3 flex justify-start items-center gap-4 rounded-md hover:border-[#003171] hover:text-[#003171] transition-all duration-300">
                                <i :class="option.icon"></i> {{ option.name }}
                            </button>
                        </div>
                    </div>
                    <div v-if="filterOrders.length > 0"
                        class="flex flex-col gap-8 w-full overflow-y-auto max-h-[calc(100vh-200px)]">
                        <div v-for="(order, index) in filterOrders" :key="index"
                            class="bg-white p-4 w-full border-2 rounded-lg shadow-lg flex flex-col gap-4">
                            <div class="flex flex-col lg:flex-row items-center justify-center lg:justify-between">
                                <p class="text-[14px] font-semibold">Ngày đặt hàng: <span class="text-[#003171]">{{
                                        formatDate(order.NgayDatHang) }}</span></p>
                                <p class="text-[14px] font-semibold">{{ order.TrangThaiDon }}</p>
                            </div>
                            <hr>
                            <div class="overflow-y-auto max-h-[250px] flex flex-col gap-4">
                                <div class="flex gap-4 border-b-2 pb-4 mb-3 overflow-hidden"
                                    v-for="(product, index) in order.SanPhamDaMua" :key="index">
                                    <img :src="`/src/assets/img/${product.HinhAnh}`" class="w-[100px]" alt="">
                                    <div class="flex flex-col gap-1 overflow-hidden">
                                        <div class="whitespace-nowrap text-ellipsis overflow-hidden">
                                            <p
                                                class="text-[16px] overflow-hidden font-semibold text-ellipsis whitespace-nowrap">
                                                {{ product.TenSanPham }}</p>
                                        </div>
                                        <p class="text-[14px] font-semibold">Loại sản phẩm: <span
                                                class="text-[#003171] font-medium">{{ product.LoaiSanPham }}</span></p>
                                        <p class="text-[14px] font-semibold">Đơn giá: <span
                                                class="text-[#003171] font-medium">{{ formatCurrency(product.Gia) }}
                                                VNĐ</span></p>
                                        <p class="text-[14px] font-semibold">Số lượng: <span
                                                class="text-[#003171] font-medium">{{ product.SoLuong }}</span></p>
                                    </div>
                                </div>
                            </div>
                            <div class="flex flex-col gap-3">
                                <h3 class="text-[18px] font-semibold">Thông tin khách hàng</h3>
                                <div class="flex flex-col lg:flex-row lg:justify-between">
                                    <div>
                                        <p class="font-medium text-[14px]">Mã khách hàng: <span class="font-semibold">{{
                                                order.MaKhachHang }}</span></p>
                                        <p class="font-medium text-[14px]">Tên khách hàng: <span
                                                class="font-semibold">{{ order.TenKhachHang }}</span></p>
                                        <p class="font-medium text-[14px]">Số điện thoại: <span class="font-semibold">{{
                                                order.DienThoai }}</span></p>
                                        <p class="font-medium text-[14px]">Địa chỉ nhận hàng: <span
                                                class="font-semibold">{{ order.DiaChiNhanHang }}</span></p>
                                    </div>
                                    <div>
                                        <p class="font-medium text-[14px]">Trạng thái: <span class="font-semibold">{{
                                                order.TrangThaiThanhToan }}</span></p>
                                        <p class="font-medium text-[14px]">Hình thức thanh toán: <span
                                                class="font-semibold">{{ order.HinhThucThanhToan }}</span></p>
                                        <p class="font-medium text-[14px]">Mã giảm giá: <span class="font-semibold">{{
                                            order.MaGiamGia === "" ? "Không sử dụng" : order.MaGiamGia }}</span></p>
                                        <p class="font-medium text-[14px]">Ghi chú: <span class="font-semibold">{{
                                                order.GhiChu }}</span></p>
                                        <p class="font-medium text-[14px]">Tổng đơn: <span
                                                class="font-semibold text-[#003171]">{{ formatCurrency(order.TongDon) }}
                                                VNĐ</span></p>
                                    </div>
                                </div>
                            </div>
                            <div class="flex justify-center lg:justify-end">
                                <button @click="updatedStatus(order.MaDonHang, order.TrangThaiDon)"
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
                                <img src="../../assets/img/rb_4168.png" class="w-[200px] lg:w-[380px]" alt="">
                            </div>
                        </div>
                    </div>
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

.fixed {
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
}

.fixed.translate-x-0 {
    transform: translateX(0);
}
</style>