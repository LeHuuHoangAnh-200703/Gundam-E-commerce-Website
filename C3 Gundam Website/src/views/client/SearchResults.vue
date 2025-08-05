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
const route = useRoute();

const listProducts = ref([]);
const products = ref([]);
const searchQuery = ref(route.query.query || '');
const categoryId = ref(route.query.categoryId || '');
const categoryName = ref(route.query.categoryName || '');
const categoryType = ref(route.query.categoryType || '');
const isSearchMode = computed(() => !!searchQuery.value);
const isCategoryMode = computed(() => !!categoryId.value);

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
        const response = await axios.get("http://localhost:3000/api/sanpham");
        products.value = response.data.map(product => {
            return {
                ...product,
                NgayBan: new Date(product.NgayBan)
            }
        });
    } catch (err) {
        console.log(err);
    }
}

const fetchProductsBySearch = async () => {
    try {
        const response = await axios.get(`http://localhost:3000/api/sanpham/timkiem/ketquatimkiem?tenSanPham=${searchQuery.value}`);
        listProducts.value = response.data.map(product => {
            return {
                ...product,
                NgayBan: new Date(product.NgayBan)
            }
        })
        const productsNormal = listProducts.value.filter(product => product.TrangThai !== 'Ngừng kinh doanh');
        const productsSpecial = listProducts.value.filter(product => product.TrangThai === 'Ngừng kinh doanh');
        listProducts.value = [...productsNormal.sort((a, b) => b.NgayBan - a.NgayBan), ...productsSpecial];
        console.log(listProducts.value)
    } catch (err) {
        console.log("error fetching: ", err);
    }
}

const fetchProductsByCategory = async () => {
    try {
        let filtered = products.value.filter(product => {
            return product.LoaiSanPham === categoryType.value;
        });

        const productsNormal = filtered.filter(product => product.TrangThai !== 'Ngừng kinh doanh');
        const productsSpecial = filtered.filter(product => product.TrangThai === 'Ngừng kinh doanh');
        listProducts.value = [...productsNormal.sort((a, b) => b.NgayBan - a.NgayBan), ...productsSpecial];
    } catch (err) {
        console.log("error filtering category products: ", err);
    }
}

// Hàm chung để fetch dữ liệu
const fetchData = async () => {
    if (isSearchMode.value) {
        await fetchProductsBySearch();
    } else if (isCategoryMode.value) {
        await fetchProducts();
        await fetchProductsByCategory();
    }
}

const addToCart = async (idProduct) => {
    const maKhachHang = localStorage.getItem("MaKhachHang");
    if (!maKhachHang) {
        showNotification("Bạn cần đăng nhập trước khi thêm sản phẩm vào giỏ hàng!", "error");
        router.push('/login');
        return;
    }
    try {
        const response = await axios.post(`http://localhost:3000/api/giohang/${idProduct}`, {
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
const itemsPerPage = ref(16);
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

// Tiêu đề hiển thị dựa trên mode
const pageTitle = computed(() => {
    if (isSearchMode.value) {
        return `Kết quả tìm kiếm của "${searchQuery.value}"`;
    } else if (isCategoryMode.value) {
        return `Sản phẩm danh mục "${categoryName.value}"`;
    }
    return 'Sản phẩm';
});

// Watch cho các thay đổi route
watch(() => route.query, (newQuery) => {
    searchQuery.value = newQuery.query || '';
    categoryId.value = newQuery.categoryId || '';
    categoryName.value = newQuery.categoryName || '';
    categoryType.value = newQuery.categoryType || '';
    currentPage.value = 1; // Reset về trang đầu
    fetchData();
}, { deep: true });

onMounted(() => {
    if (!searchQuery.value && !categoryId.value) {
        router.push({ name: 'NotFound' });
    } else {
        fetchData();
    }
})
</script>

<template>
    <div
        class="bg-gradient-to-br from-[#0F1419] via-[#1A1D27] to-[#0F1419] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header_Home />
        <h1 v-if="listProducts.length > 0" class="mb-10 mt-5 m-5 lg:mx-[210px] text-white font-bold text-[20px]">
            {{ pageTitle }}
        </h1>
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
                        {{ product.TenSanPham }}
                    </p>
                </router-link>
                <p class="text-[#FFD700] text-[16px] font-semibold flex justify-center gap-4 items-center w-full">
                    <span v-if="product.GiaSale > 0" class="text-[18px]">{{
                        formatCurrencySale(product.GiaSale) }}
                        <span class="text-[14px] relative -top-[2px] underline">đ</span></span>
                    <span :class="{ 'line-through text-white': product.GiaSale }">{{
                        formatCurrency(product.GiaBan) }}
                        <span class="text-[14px] relative -top-[2px] underline">đ</span></span>
                </p>
                <button @click.prevent="addToCart(product.MaSanPham)"
                    v-if="(product.TrangThai === 'Đang bán' && product.SoLuong > 0)"
                    class="group relative px-6 py-3 w-full bg-gradient-to-r from-[#DB3F4C] via-[#E74C3C] to-[#B91C1C] text-white font-semibold overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#DB3F4C]/40 active:scale-95 transform">
                    <div
                        class="absolute inset-0 rounded-xl bg-gradient-to-r from-[#DB3F4C] to-[#B91C1C] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300">
                    </div>
                    <div class="relative flex items-center justify-center gap-2">
                        <div
                            class="flex items-center justify-center w-5 h-5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
                            <i class="fas fa-cart-plus text-sm"></i>
                        </div>
                        <span
                            class="text-sm font-bold tracking-wide uppercase group-hover:tracking-wider transition-all duration-300">
                            Thêm giỏ hàng
                        </span>
                        <div
                            class="opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300">
                            <i class="fas fa-arrow-right text-xs"></i>
                        </div>
                    </div>
                    <div
                        class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300">
                    </div>
                </button>
                <button v-else-if="product.TrangThai === 'Ngừng kinh doanh'"
                    class="group relative px-6 py-[14px] w-full bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 text-white font-semibold overflow-hidden cursor-not-allowed opacity-80">
                    <div class="absolute inset-0 bg-gradient-to-r from-gray-500/10 to-gray-400/10 transform -skew-x-12">
                    </div>
                    <div
                        class="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-600 to-gray-800 opacity-10 blur-lg">
                    </div>
                    <div class="relative flex items-center justify-center gap-2">
                        <div class="flex items-center justify-center w-5 h-5">
                            <i class="fas fa-ban text-sm text-red-400"></i>
                        </div>
                        <span class="text-sm font-bold tracking-wide uppercase">
                            Ngừng kinh doanh
                        </span>
                        <div class="flex items-center justify-center">
                            <i class="fas fa-exclamation-triangle text-xs text-yellow-400"></i>
                        </div>
                    </div>
                    <div
                        class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 opacity-60">
                    </div>
                </button>
                <button v-else-if="product.SoLuong <= 0"
                    class="group relative px-6 py-[14px] w-full bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 text-white font-semibold overflow-hidden cursor-not-allowed opacity-75">
                    <div class="absolute inset-0 opacity-20">
                        <div class="h-full w-full bg-repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.1) 4px, rgba(255,255,255,0.1) 8px)"
                            style="background-image: repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.1) 4px, rgba(255,255,255,0.1) 8px);">
                        </div>
                    </div>
                    <div
                        class="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-600 to-slate-800 opacity-10 blur-lg">
                    </div>
                    <div class="relative flex items-center justify-center gap-2">
                        <div class="flex items-center justify-center w-5 h-5">
                            <i class="fas fa-times-circle text-sm text-red-400"></i>
                        </div>
                        <span class="text-sm font-bold tracking-wide uppercase">
                            Hết hàng
                        </span>
                        <div class="flex items-center justify-center">
                            <div class="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <div
                        class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-400 to-red-600 opacity-50">
                    </div>
                </button>
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
                        <span v-if="isSearchMode">Không có sản phẩm phù hợp với "{{ searchQuery }}"</span>
                        <span v-else-if="isCategoryMode">Danh mục "{{ categoryName }}" chưa có sản phẩm</span>
                        <span v-else>Không có sản phẩm</span>
                    </h3>
                    <p class="text-gray-300 text-sm lg:text-base leading-relaxed">
                        <span v-if="isSearchMode">
                            Hiện tại chưa có sản phẩm nào phù hợp với từ khóa.
                            Hãy thử tìm kiếm với từ khóa khác!
                        </span>
                        <span v-else-if="isCategoryMode">
                            Danh mục này hiện chưa có sản phẩm nào.
                            Hãy quay lại sau để khám phá những sản phẩm mới nhất!
                        </span>
                        <span v-else>
                            Hãy quay lại trang chủ để khám phá sản phẩm!
                        </span>
                    </p>
                </div>
            </div>
        </div>
        <div v-if="totalPages > 1" class="flex justify-center my-10 space-x-2">
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