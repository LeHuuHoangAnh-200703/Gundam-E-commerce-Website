<script setup>
import { ref, onMounted, computed } from "vue"
import Header_Home from "@/components/client/Header_Home.vue";
import Footer from "@/components/client/Footer.vue";
import BackToTop from "@/components/client/BackToTop.vue";
import NotificationClient from "@/components/Notification/NotificationClient.vue";
import axios from 'axios';
import { useRouter, useRoute } from "vue-router";
import { watch } from 'vue';
import Chat from '../../components/client/Chat.vue';
import ChatBot from '../../components/client/ChatBot.vue';

const router = useRouter();
const route = useRoute(); // Sử dụng useRoute để theo dõi thay đổi của query

const listProducts = ref([]);
const searchQuery = ref(route.query.query || '');
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

const fectchProducts = async () => {
    try {
        const response = await axios.get(`http://localhost:3000/api/sanpham/timkiem/ketquatimkiem?tenSanPham=${searchQuery.value}`);
        console.log(response.data)
        listProducts.value = response.data.map(product => {
            return {
                ...product,
                NgayBan: new Date(product.NgayBan)
            }
        })

        const productsNormal = listProducts.value.filter(product => product.TrangThai !== 'Ngừng kinh doanh');
        const productsSpecial = listProducts.value.filter(product => product.TrangThai === 'Ngừng kinh doanh');
        listProducts.value = [...productsNormal.sort((a, b) => b.NgayBan - a.NgayBan), ...productsSpecial];
    } catch (err) {
        console.log("error fetching: ", err);
    }
}

const addToCart = async (idProDuct) => {
    const maKhachHang = localStorage.getItem("MaKhachHang");
    if (!maKhachHang) {
        showNotification("Bạn cần đăng nhập trước khi thêm sản phẩm vào giỏ hàng!", "error");
        router.push('/login');
        return;
    }
    try {
        const response = await axios.post(`http://localhost:3000/api/giohang/${idProDuct}`, {
            MaKhachHang: maKhachHang,
        });
        showNotification("Thêm giỏ hàng thành công!", "success");
        setTimeout(() => {
            router.push('/carts');
        }, 1000);
    } catch (error) {
        showNotification(error.response?.data?.message || "Thêm giỏ hàng thất bại!", "error");
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}

function formatCurrency(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatCurrencySale(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const currentPage = ref(1);
const itemsPerPage = ref(16); // 4 dòng × 4 cột = 16 sản phẩm
const totalPages = computed(() => Math.ceil(listProducts.value.length / itemsPerPage.value));

const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    return listProducts.value.slice(start, start + itemsPerPage.value);
});

const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
};

watch(() => route.query.query, (newQuery) => {
    searchQuery.value = newQuery;
    fectchProducts();
});

onMounted(() => {
    if (!searchQuery.value) {
        router.push({ name: 'NotFound' });
    } else {
        fectchProducts();
    }
})
</script>

<template>
    <div
        class="bg-gradient-to-br from-[#0F1419] via-[#1A1D27] to-[#0F1419] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header_Home />
        <h1 v-if="listProducts.length > 0" class="mb-10 mt-5 m-5 lg:mx-[210px] text-white font-bold text-[20px]">Kết quả
            tìm kiếm của "{{ searchQuery
            }}"</h1>
        <div v-if="listProducts.length > 0"
            class="mt-10 mb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 m-5 lg:mx-[210px]">
            <div v-for="(product, index) in paginatedProducts" :key="index" class="flex flex-col gap-3 items-center">
                <router-link :to="`/details/${product.MaSanPham}`">
                    <img :src="`${product.Images[0]}`" class="w-full [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]"
                        alt="">
                </router-link>
                <router-link :to="`/details/${product.MaSanPham}`"
                    class="py-2 whitespace-nowrap text-[12px] text-ellipsis overflow-hidden max-w-64 group">
                    <p
                        class="text-white overflow-hidden text-ellipsis whitespace-nowrap text-[14px] text-center flex-grow group-hover:text-[#DB3F4C] transition-all duration-300">
                        {{
                            product.TenSanPham }}</p>
                </router-link>
                <p class="text-[#FFD700] text-[16px] font-semibold flex justify-center gap-4 items-center w-full">
                    <span v-if="product.GiaSale > 0" class="text-[18px]">{{
                        formatCurrencySale(product.GiaSale) }}
                        <span class="text-[14px] relative -top-[2px] underline">đ</span></span>
                    <span :class="{ 'line-through text-white': product.GiaSale }">{{
                        formatCurrency(product.GiaBan) }}
                        <span class="text-[14px] relative -top-[2px] underline">đ</span></span>
                </p>
                <button @click.prevent="addToCart(product.MaSanPham)" v-if="product.TrangThai === 'Đang bán'"
                    class="px-5 py-2 w-full bg-[#DB3F4C] text-white font-medium">Thêm giỏ hàng</button>
                <button v-else-if="product.TrangThai === 'Ngừng kinh doanh'"
                    class="px-5 py-2 w-full bg-gray-600 text-white font-medium">Ngừng kinh doanh</button>
                <button v-else-if="product.SoLuong < 0" class="px-5 py-2 w-full bg-gray-600 text-white font-medium">Hết
                    hàng</button>
            </div>
        </div>
        <div v-else class="flex justify-center items-center m-auto w-full min-h-[400px] p-8">
            <div class="flex flex-col items-center justify-center gap-6 max-w-md mx-auto">
                <div class="relative">
                    <div
                        class="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
                        <svg class="w-12 h-12 lg:w-16 lg:h-16 text-white" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z">
                            </path>
                        </svg>
                    </div>
                    <div class="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full opacity-80 animate-bounce">
                    </div>
                    <div class="absolute -bottom-1 -left-2 w-3 h-3 bg-pink-400 rounded-full opacity-70">
                    </div>
                    <div class="absolute top-1 -left-3 w-2 h-2 bg-green-400 rounded-full opacity-60 animate-pulse">
                    </div>
                </div>
                <div class="text-center space-y-3">
                    <h3 class="font-bold text-white text-xl lg:text-2xl">
                        Không có sản phẩm phù hợp với "{{ searchQuery }}"
                    </h3>
                    <p class="text-gray-300 text-sm lg:text-base leading-relaxed">
                        Hiện tại chưa có sản phẩm nào phù hợp với từ khóa.
                        Hãy quay lại sau để khám phá những sản phẩm mới nhất!
                    </p>
                </div>
            </div>
        </div>
        <div class="flex justify-center my-10 space-x-2">
            <button v-for="page in totalPages" :key="page" @click="goToPage(page)"
                class="px-4 py-2 rounded-md border text-white cursor-pointer"
                :class="page === currentPage ? 'bg-[#DB3F4C] border-[#DB3F4C]' : 'border-gray-500'">
                {{ page }}
            </button>
        </div>
        <Footer />
        <BackToTop />
        <Chat />
        <ChatBot />
        <NotificationClient :message="notification.message" :type="notification.type" />
    </div>
</template>