<script setup>
import { ref, onMounted, computed } from "vue"
import Header_Home from "@/components/client/Header_Home.vue";
import Footer from "@/components/client/Footer.vue";
import BackToTop from "@/components/client/BackToTop.vue";
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const listChoices = [
    {
        name: "TẤT CẢ SẢN PHẨM",
        type: "All",
    },
    {
        name: "MG - HIRM - RE/100 - 1/100",
        type: "MG",
    },
    {
        name: "PG 1/60 - MEGA SIZE 1/48",
        type: "PG",
    },
    {
        name: "RG - REAL GRADE 1/144",
        type: "RG",
    },
]

const listProducts = ref([]);
const notification = ref({
    message: '',
    type: ''
});
const searchQuery = ref("");
const selectedType = ref("All");
const selectTypeProducts = (type) => {
    selectedType.value = type;
};

const handleSearch = (query) => {
    searchQuery.value = query;
};

const fectchProducts = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/sanpham');
        listProducts.value = response.data.map(product => {
            return {
                ...product,
            }
        })
        console.log(listProducts.value)
    } catch (err) {
        console.log("error fetching: ", err);
    }
}

const addToCart = async (idProDuct) => {
    const maKhachHang = localStorage.getItem("MaKhachHang");
    if (!maKhachHang) {
        notification.value = {
            message: "Bạn cần đăng nhập trước khi thêm sản phẩm vào giỏ hàng!",
            type: "error",
        };
        router.push('/login');
        return;
    }
    try {
        const response = await axios.post(`http://localhost:3000/api/giohang/${idProDuct}`, {
            MaKhachHang: maKhachHang,
        });
        notification.value = {
            message: "Thêm giỏ hàng thành công!",
            type: "success",
        };
        setTimeout(() => {
            router.push('/carts');
        }, 1000);
    } catch (error) {
        notification.value = {
            message: error.response?.data?.message || "Thêm giỏ hàng thất bại!",
            type: "error",
        };
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}

const filteredProducts = computed(() => {
    return listProducts.value.filter(product => {
        const matchesType = selectedType.value === "All" || product.LoaiSanPham === selectedType.value;
        const matchesSearch = product.TenSanPham.toLowerCase().includes(searchQuery.value.toLowerCase());
        return matchesType && matchesSearch;
    });
});

function formatCurrency(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

onMounted(() => {
    fectchProducts();
})
</script>

<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth">
        <Header_Home @search="handleSearch" />
        <div class="w-full bg-[#DB3F4C]">
            <div
                class="flex lg:flex-row flex-col justify-center items-center lg:justify-between w-full p-5 lg:px-[210px] xl:px-[100px]">
                <div class="flex flex-col gap-3 w-full lg:w-[50%] justify-center lg:justify-start items-start">
                    <p class="bg-[rgba(52,52,52,0.7)] text-white text-[14px] px-3 py-2 font-medium rounded-md">C3 GUNDAM
                        STORE</p>
                    <p class="text-white font-semibold uppercase text-[26px]">C3 GUNDAM STORE - Gắn kết đam mê, xây dựng
                        thế giới Gundam của riêng bạn.</p>
                    <span class="lg:w-[150px] w-full h-1 bg-white"></span>
                    <p class="text-white text-[14px] font-medium">Cửa hàng Gundam không chỉ là nơi bày bán mô hình, mà
                        còn là không gian nuôi dưỡng đam mê, nơi giấc mơ về những chiến binh cơ khí trở thành hiện thực.
                    </p>
                    <p class="text-white text-[14px] font-semibold">Địa chỉ: Đường 96 - Tân Phú - TX.Long Mỹ - Hậu Giang
                    </p>
                </div>
                <div class="w-full lg:w-[50%] flex justify-end">
                    <img src="../../assets/img/banner.png" class="w-[350px]" alt="">
                </div>
            </div>
        </div>
        <div
            class="my-2 bg-gradient-to-b text-center lg:text-start from-[rgba(219,63,76,0.7)] to-[#1A1D27] p-5 lg:mx-[210px] xl:mx-[100px]">
            <p class="text-white font-semibold uppercase text-[22px] lg:text-[26px]">Vũ trụ Gundam thu nhỏ trong từng mô
                hình, chỉ có tại C3 GUNDAM.</p>
            <p class="text-white font-medium my-1">Tại đây bạn có thể chọn được những mẫu Gundam yêu thích chính hãng từ
                BANDAI NAMCO.</p>
        </div>
        <div class="my-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 m-5 lg:mx-[210px] xl:mx-[100px]">
            <button v-for="(choice, index) in listChoices" :key="index" @click.prevent="selectTypeProducts(choice.type)"
                class="w-full bg-gradient-to-b text-center flex flex-col gap-2 lg:text-start from-[rgba(219,63,76,0.7)] to-[#1A1D27] p-4">
                <p class="text-[18px] font-semibold text-white">{{ choice.name }}</p>
                <span class="lg:w-[100px] w-full h-[2px] bg-white"></span>
                <p class="text-[14px] text-white font-medium">> Hiển thị tất cả</p>
            </button>
        </div>
        <div class="mt-10 mb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 m-5 lg:mx-[210px] xl:mx-[100px]">
            <div v-for="(product, index) in filteredProducts" :key="index" class="flex flex-col gap-3 items-center">
                <router-link :to="`/details/${product.MaSanPham}`">
                    <img :src="`/src/assets/img/${product.Images[0]}`"
                        class="w-full [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]" alt="">
                </router-link>
                <router-link :to="`/details/${product.MaSanPham}`"
                    class="text-white text-[14px] text-center flex-grow hover:text-[#DB3F4C] transition-all duration-300">{{
                        product.TenSanPham }}</router-link>
                <p class="text-white text-[14px]">Giá: <span class="text-[#FFD700]">{{ formatCurrency(product.GiaBan) }}
                        VNĐ</span></p>
                <button @click.prevent="addToCart(product.MaSanPham)" v-if="product.TrangThai === 'Đang bán'"
                    class="px-5 py-2 w-full rounded-md bg-[#DB3F4C] text-white font-medium">Thêm giỏ hàng</button>
                <button v-else-if="product.TrangThai === 'Ngừng kinh doanh'"
                    class="px-5 py-2 w-full rounded-md bg-gray-600 text-white font-medium">Ngừng kinh doanh</button>
                <button v-else-if="product.SoLuong < 0"
                    class="px-5 py-2 w-full rounded-md bg-gray-600 text-white font-medium">Hết hàng</button>
            </div>
        </div>
        <Footer />
        <BackToTop />
        <transition name="slide-fade" mode="out-in">
            <div v-if="notification.message" :class="['fixed top-4 right-4 p-4 bg-white shadow-lg border-t-4 rounded z-10 flex items-center space-x-2', {
                'border-[#DB3F4C]': notification.type === 'error',
                'border-[#40E0D0]': notification.type === 'success',
            }]">
                <div class="flex gap-2 justify-center items-center">
                    <img :src="notification.type === 'success' ? '/src/assets/img/rb_7710.png' : '/src/assets/img/rb_12437.png'"
                        class="w-[50px]" alt="">
                    <p class="text-[16px] font-semibold"
                        :class="notification.type === 'success' ? 'text-[#40E0D0]' : 'text-[#DB3F4C]'">{{
                            notification.message }}</p>
                </div>
            </div>
        </transition>
    </div>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.5s ease;
}

.slide-fade-enter,
.slide-fade-leave-to {
    transform: translateX(100%);
    opacity: 0;
}
</style>