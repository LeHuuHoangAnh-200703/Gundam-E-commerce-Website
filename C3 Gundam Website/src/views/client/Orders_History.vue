<script setup>
import { ref, onMounted, computed } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import axios from 'axios';

const options = [
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
]

const listOrders = ref([]);
const fetchOrders = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/donhang');
        listOrders.value = response.data.map(order => {
            const date = new Date(order.NgayDatHang);  
            const formattedDate = date.toLocaleDateString('fr-FR');
            return {
                ...order,
                NgayDatHang: formattedDate
            }
        })
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

function formatCurrency(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

onMounted(() => {
    fetchOrders();
})
</script>

<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="relative mb-5 m-2 lg:mx-[200px] flex items-center flex-col flex-grow">
            <div class="flex flex-col gap-4 justify-center items-center mb-4">
                <h1 class="text-center text-white text-[28px] font-semibold mt-6">Thông tin đơn hàng</h1>
                <div class="flex gap-4">
                    <button v-for="option in options" :key="option"
                        class="border-2 px-5 py-3 bg-white flex justify-start items-center gap-4 rounded-md hover:bg-[#008B8B] hover:text-white transition-all duration-300">
                        <i :class="option.icon"></i> {{ option.name }}
                    </button>
                </div>
            </div>
            <div class="w-full m-4">
                <div v-for="(order, index) in listOrders" :key="index"
                    class="bg-[#242424] flex flex-col mb-5 overflow-hidden px-4 py-3 rounded [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                    <div
                        class="flex flex-col gap-2 lg:flex-row justify-center items-center lg:justify-between text-white font-semibold">
                        <p class="text-[14px]">Ngày đặt hàng: <span class="text-[#FFD700]">{{ order.NgayDatHang }}</span></p>
                        <p class="text-[14px] text-center lg:text-start">
                            {{ order.TrangThaiDon }}</p>
                    </div>
                    <hr class="my-3">
                    <div class="overflow-y-auto max-h-[250px] flex flex-col gap-4">
                        <div class="flex gap-4 border-b-[1px] pb-4 mb-3" v-for="(product, index) in order.SanPhamDaMua" :key="index">
                            <img :src="`/src/assets/img/${product.HinhAnh}`" class="w-[100px]" alt="">
                            <div class="flex flex-col gap-1">
                                <div class="w-44 block lg:hidden whitespace-nowrap text-ellipsis overflow-hidden">
                                    <p
                                        class="text-white font-semibold text-[14px] overflow-hidden text-ellipsis whitespace-nowrap">
                                        {{ product.TenSanPham }}</p>
                                </div>
                                <p class="text-[14px] font-semibold text-white hidden lg:block">{{ product.TenSanPham }}</p>
                                <p class="text-[14px] text-white font-medium">Mã sản phẩm: {{ product.MaSanPham }}</p>
                                <p class="text-[14px] text-white font-medium">Đơn giá: <span
                                        class="text-[#FFD700]">{{ formatCurrency(product.Gia) }} VNĐ</span></p>
                                <p class="text-[14px] text-white font-medium">Số lượng: <span
                                        class="text-[#FFD700]">{{ product.SoLuong }}</span></p>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-1">
                        <h1 class="text-[16px] font-semibold text-white">Thông tin nhận hàng</h1>
                        <div class="flex justify-between items-center">
                            <div>
                                <p class="text-white text-[14px]">Họ tên: {{ order.TenKhachHang }}</p>
                                <p class="text-white text-[14px]">Điện thoại: {{ order.DienThoai }}</p>
                                <p class="text-white text-[14px]">Điạ chỉ: {{ order.DiaChiNhanHang }}</p>
                                <p class="text-white text-[14px]">Ghi chú: {{ order.GhiChu }}</p>
                            </div>
                            <div>
                                <p class="text-white text-[14px]">Email: {{ order.Email }}</p>
                                <p class="text-white text-[14px]">Mã giảm giá: {{ order.MaGiamGia }}</p>
                                <p class="text-white text-[14px]">Hình thức thanh toán: {{ order.HinhThucThanhToan }}</p>
                            </div>
                        </div>
                    </div>
                    <hr class="my-3">
                    <div
                        class="flex flex-col gap-2 lg:flex-row justify-center items-center lg:justify-between text-white font-semibold mb-4">
                        <p class="text-[14px] text-center lg:text-start">Lưu ý: <span
                                class="text-[#FFD700]">Đơn hàng chỉ được hủy khi chưa được chuyển đi</span></p>
                        <p class="text-[14px] text-center lg:text-start">Tổng đơn: <span
                                class="text-[#FFD700]">{{ formatCurrency(order.TongDon) }} VNĐ</span></p>
                    </div>
                    <div class="flex gap-3 justify-end">
                        <button class="bg-[#4169E1] px-5 py-2 rounded-md text-white self-end w-auto">Đánh giá</button>
                        <button class="bg-[#DB3F4C] px-5 py-2 rounded-md text-white self-end w-auto">Hủy đơn
                            hàng</button>
                        <button class="bg-[#008B8B] px-5 py-2 rounded-md text-white self-end w-auto">Đã nhận được
                            hàng</button>
                    </div>
                </div>
            </div>
        </div>
        <!-- <div class="flex justify-center items-center m-auto w-full">
            <div class="flex flex-col items-center justify-center gap-3">
                <p class="font-semibold text-white text-[18px] lg:text-[24px] text-center">Hiện tại không có đơn hàng nào!</p>
                <img src="../../assets/img/banner.png" class="w-[200px]" alt="">
            </div>
        </div> -->
        <Footer />
        <BackToTop />
    </div>
</template>

<style scoped></style>