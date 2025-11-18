<script setup>
import { ref, onMounted, computed } from "vue";
import Header_Home from "@/components/client/Header_Home.vue";
import Footer from "@/components/client/Footer.vue";
import BackToTop from "@/components/client/BackToTop.vue";
import NotificationClient from "@/components/Notification/NotificationClient.vue";
import axios from "axios";
import { useRouter } from "vue-router";
import Chat from "../../components/client/Chat.vue";
import ChatBot from "../../components/client/ChatBot.vue";

const router = useRouter();

// --- CẤU HÌNH URL ĐỘNG ---
// Tự động nhận diện môi trường: Netlify (Production) hoặc Localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// -------------------------

const arrange = ref([
    {
        name: "Bán chạy nhất",
        type: "BestSeller",
    },
    {
        name: "Giá thấp đến cao",
        type: "LowPrice",
    },
    {
        name: "Giá cao đến thấp",
        type: "HighPrice",
    },
    {
        name: "Sản phẩm giảm giá",
        type: "Sale",
    },
]);

const listProducts = ref([]);
const listProductTypes = ref([]);
const searchQuery = ref("");
const selectedType = ref("All");

const notification = ref({
    message: "",
    type: "",
});

const showNotification = (msg, type) => {
    notification.value = { message: msg, type: type };
    setTimeout(() => {
        notification.value.message = "";
    }, 3000);
};

const handleSearch = (query) => {
    searchQuery.value = query;
};

const fectchProducts = async () => {
    try {
        // SỬA 1: Dùng API_URL
        const response = await axios.get(`${API_URL}/api/sanpham`);
        listProducts.value = response.data.map((product) => {
            return {
                ...product,
                NgayBan: new Date(product.NgayBan),
            };
        });

        const productsNormal = listProducts.value.filter(
            (product) =>
                product.TrangThai !== "Ngừng kinh doanh" && product.SoLuong > 0
        );
        const productsSpecial = listProducts.value.filter(
            (product) => product.TrangThai === "Ngừng kinh doanh"
        );
        const productsOutOfStock = listProducts.value.filter(
            (product) => product.SoLuong <= 0
        );
        listProducts.value = [
            ...productsNormal.sort((a, b) => b.NgayBan - a.NgayBan),
            ...productsSpecial.sort((a, b) => b.NgayBan - a.NgayBan),
            ...productsOutOfStock.sort((a, b) => b.NgayBan - a.NgayBan),
        ];
    } catch (error) {
        console.log("error fetching: ", error);
    }
};

const fetchProductType = async () => {
    try {
        // SỬA 2: Dùng API_URL
        const response = await axios.get(`${API_URL}/api/loaisanpham`);
        listProductTypes.value = response.data.map((productType) => {
            return {
                ...productType,
            };
        });
    } catch (error) {
        console.log("error fetching: ", error);
    }
};

const addToCart = async (idProDuct) => {
    const maKhachHang = localStorage.getItem("MaKhachHang");
    if (!maKhachHang) {
        showNotification(
            "Bạn cần đăng nhập trước khi thêm sản phẩm vào giỏ hàng!",
            "error"
        );
        router.push("/login");
        return;
    }
    try {
        // SỬA 3: Dùng API_URL
        const response = await axios.post(
            `${API_URL}/api/giohang/${idProDuct}`,
            {
                MaKhachHang: maKhachHang,
            }
        );
        showNotification("Thêm giỏ hàng thành công!", "success");
        setTimeout(() => {
            router.push("/carts");
        }, 1000);
    } catch (error) {
        showNotification(
            error.response?.data?.message || "Thêm giỏ hàng thất bại!",
            "error"
        );
    }
    setTimeout(() => {
        notification.value.message = "";
    }, 3000);
};

const selectTypeProducts = (type) => {
    selectedType.value = type;
    // Kiểm tra nếu trang hiện tại vượt quá tổng số trang sau khi lọc, đưa về trang gần nhất
    if (currentPage.value > totalPages.value) {
        currentPage.value = totalPages.value;
    }
};

const getActualPrice = (product) => {
    return product.GiaSale > 0 ? product.GiaSale : product.GiaBan;
};

const filteredProducts = computed(() => {
    const products = listProducts.value;
    if (selectedType.value === "BestSeller") {
        return products.slice().sort((a, b) => b.LuotBan - a.LuotBan);
    }

    if (selectedType.value === "LowPrice") {
        return products.slice().sort((a, b) => {
            const priceA = Number(getActualPrice(a));
            const priceB = Number(getActualPrice(b));
            return priceA - priceB;
        });
    }

    if (selectedType.value === "HighPrice") {
        return products.slice().sort((a, b) => {
            const priceA = Number(getActualPrice(a));
            const priceB = Number(getActualPrice(b));
            return priceB - priceA;
        });
    }

    if (selectedType.value === "Sale") {
        return products.filter((product) => product.GiaSale > 0);
    }

    return products.filter((product) => {
        const matchesType =
            selectedType.value === "All" ||
            product.LoaiSanPham === selectedType.value;
        return matchesType;
    });
});

const currentPage = ref(1);
const itemsPerPage = ref(15); // 4 dòng × 4 cột = 16 sản phẩm
const totalPages = computed(() =>
    Math.ceil(filteredProducts.value.length / itemsPerPage.value)
);

// Lấy sản phẩm theo trang hiện tại
const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    return filteredProducts.value.slice(start, start + itemsPerPage.value);
});

// Chuyển trang
const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
};

function formatCurrency(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatCurrencySale(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

onMounted(() => {
    fectchProducts();
    fetchProductType();
});
</script>

<template>
    <div
        class="bg-gradient-to-br from-[#0F1419] via-[#1A1D27] to-[#0F1419] relative overflow-hidden min-h-screen font-sans scroll-smooth">
        <Header_Home @search="handleSearch" />
        <div class="w-full bg-[#DB3F4C]">
            <div
                class="flex lg:flex-row flex-col gap-6 justify-center items-center lg:justify-between w-full p-5 lg:px-[210px]">
                <div class="flex flex-col gap-3 w-full lg:w-[50%] justify-center lg:justify-start items-start">
                    <div
                        class="bg-black/40 backdrop-blur-sm text-white text-sm px-4 py-2 font-medium rounded-full border border-white/20 transition-all duration-300 hover:bg-black/50">
                        <span class="text-red-300 animate-pulse">●</span> C3 GUNDAM STORE
                    </div>
                    <h1 class="text-white font-bold text-2xl lg:text-3xl leading-tight drop-shadow-lg">
                        Gắn kết đam mê sở thích, <br />
                        <span class="text-yellow-300">Hãy xây dựng thế giới Gundam</span>
                        <br />
                        của riêng bạn
                    </h1>
                    <div class="flex items-center gap-4 w-full">
                        <div
                            class="h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex-1 max-w-[200px]">
                        </div>
                        <div class="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                    <p class="text-white text-[14px] font-medium">
                        Cửa hàng Gundam không chỉ là nơi bày bán mô hình, mà còn là không
                        gian nuôi dưỡng đam mê, nơi giấc mơ về những chiến binh cơ khí trở
                        thành hiện thực.
                    </p>
                    <div class="flex items-center gap-3 text-white">
                        <i class="fa-solid fa-location-dot text-yellow-400"></i>
                        <span class="text-sm lg:text-base font-semibold">Đường 96 - Tân Phú - TX.Long Mỹ - Hậu
                            Giang</span>
                    </div>
                </div>
                <div class="w-full lg:w-[50%] flex justify-center lg:justify-end relative">
                    <div class="absolute inset-0 opacity-10">
                        <div class="w-full h-full bg-gradient-to-br from-white/5 to-transparent"></div>
                    </div>
                    <div class="relative">
                        <div
                            class="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-2xl blur-2xl -z-10 scale-110">
                        </div>
                        <div class="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                            <img src="../../assets/img/WELCOME.png" alt="C3 Gundam Store Logo"
                                class="w-[300px] lg:w-[320px] rounded-xl drop-shadow-xl transition-all duration-300 hover:scale-105" />
                        </div>
                        <div class="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400/80 rounded-full animate-pulse"></div>
                        <div class="absolute -bottom-4 -left-4 w-6 h-6 bg-orange-400/80 rounded-full animate-pulse"
                            style="animation-delay: 1s"></div>
                        <div
                            class="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-yellow-400/40 rounded-tr-2xl">
                        </div>
                        <div
                            class="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-orange-400/40 rounded-bl-2xl">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="m-5 lg:mx-[210px]">
            <div class="my-2 bg-gradient-to-b text-center lg:text-start from-[rgba(219,63,76,0.7)] to-[#1A1D27] p-5">
                <p class="text-white font-semibold uppercase text-[22px] lg:text-[26px]">
                    Vũ trụ Gundam thu nhỏ trong từng mô hình, chỉ có tại C3 GUNDAM.
                </p>
                <p class="text-white font-medium my-1">
                    Tại đây bạn có thể chọn được những mẫu Gundam yêu thích chính hãng từ
                    BANDAI NAMCO.
                </p>
            </div>
            <div class="w-full my-4">
                <div class="hidden lg:grid grid-cols-4 gap-4 items-center mb-4">
                    <button v-for="item in arrange" :key="item" @click.prevent="selectTypeProducts(item.type)"
                        class="bg-gradient-to-br from-[#2A2D37] via-[#1A1D27] to-[#0F1419] border border-white/20 p-5 text-center flex flex-col gap-3 hover:border-[#DB3F4C]/50 hover:shadow-lg hover:shadow-[#DB3F4C]/10 transition-all duration-300 group">
                        <div class="flex items-center justify-between">
                            <p
                                class="text-white font-semibold text-[18px] uppercase group-hover:text-[#DB3F4C] transition-colors">
                                {{ item.name }}
                            </p>
                            <i
                                class="fas fa-arrow-right text-[#DB3F4C] opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1"></i>
                        </div>
                        <div
                            class="w-full h-[2px] bg-gradient-to-r from-[#DB3F4C] to-[#B91C1C] rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left">
                        </div>
                        <p
                            class="text-[14px] text-start text-white/70 font-medium group-hover:text-white transition-colors">
                            Hiển thị tất cả
                        </p>
                    </button>
                </div>
                <div class="lg:hidden space-y-4 mb-6">
                    <div class="bg-gradient-to-r from-[#1A1D27] to-[#2A2D37] rounded-xl p-4 border border-white/10">
                        <div class="space-y-3">
                            <label
                                class="text-white font-medium text-sm uppercase tracking-wide flex items-center gap-2">
                                <i class="fas fa-sort text-[#DB3F4C]"></i>
                                Sắp xếp theo
                            </label>
                            <select v-model="selectedType"
                                class="w-full bg-[#0F1419] border border-white/20 rounded-lg px-4 py-3 text-white focus:border-[#DB3F4C] focus:ring-2 focus:ring-[#DB3F4C]/20 transition-all duration-300">
                                <option value="All" class="bg-[#0F1419]">Sắp xếp theo</option>
                                <option :value="item.type" v-for="item in arrange" :key="item" class="bg-[#0F1419]">
                                    {{ item.name }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="bg-gradient-to-r from-[#1A1D27] to-[#2A2D37] rounded-xl p-4 border border-white/10">
                        <div class="space-y-3">
                            <label
                                class="text-white font-medium text-sm uppercase tracking-wide flex items-center gap-2">
                                <i class="fas fa-tags text-[#DB3F4C]"></i>
                                Loại sản phẩm
                            </label>
                            <select v-model="selectedType"
                                class="w-full bg-[#0F1419] border border-white/20 rounded-lg px-4 py-3 text-white focus:border-[#DB3F4C] focus:ring-2 focus:ring-[#DB3F4C]/20 transition-all duration-300">
                                <option value="All" class="bg-[#0F1419]">Loại sản phẩm</option>
                                <option :value="productType.LoaiSanPham"
                                    v-for="(productType, index) in listProductTypes" :key="index" class="bg-[#0F1419]">
                                    {{ productType.TenLoaiSanPham }}
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div class="hidden lg:flex flex-col gap-4 w-full col-span-1 items-start">
                    <div
                        class="bg-gradient-to-br from-[#2A2D37] via-[#1A1D27] to-[#0F1419] p-6 border border-white/10 w-full">
                        <div class="flex items-center gap-2 mb-6">
                            <div class="w-8 h-8 bg-[#DB3F4C] rounded-md flex items-center justify-center">
                                <i class="fas fa-th-list text-white text-sm"></i>
                            </div>
                            <p class="text-white font-bold uppercase text-[20px]">
                                Dòng mô hình
                            </p>
                        </div>
                        <div class="space-y-3">
                            <button @click.prevent="selectTypeProducts('All')"
                                class="w-full text-left text-white uppercase font-semibold text-[14px] group p-3 rounded-lg hover:bg-white/5 transition-all duration-300">
                                <div class="flex items-center justify-between">
                                    <span class="group-hover:text-[#DB3F4C] transition-colors">Tất cả sản phẩm</span>
                                    <i
                                        class="fas fa-chevron-right text-[#DB3F4C] opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm"></i>
                                </div>
                                <div
                                    class="h-[2px] bg-[#DB3F4C] scale-x-0 group-hover:scale-100 rounded-full transition-all ease-out origin-left duration-300 mt-2">
                                </div>
                            </button>
                            <button v-for="(productType, index) in listProductTypes" :key="index"
                                @click.prevent="selectTypeProducts(productType.LoaiSanPham)"
                                class="w-full text-left text-white font-semibold text-[14px] group p-3 rounded-lg hover:bg-white/5 transition-all duration-300">
                                <div class="flex items-center justify-between">
                                    <span class="group-hover:text-[#DB3F4C] transition-colors">{{
                                        productType.TenLoaiSanPham
                                        }}</span>
                                    <i
                                        class="fas fa-chevron-right text-[#DB3F4C] opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm"></i>
                                </div>
                                <div
                                    class="h-[2px] bg-[#DB3F4C] scale-x-0 group-hover:scale-100 rounded-full transition-all ease-out origin-left duration-300 mt-2">
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 col-span-3">
                    <div v-for="(product, index) in paginatedProducts" :key="index"
                        class="flex flex-col gap-3 items-center group relative">
                        <router-link :to="`/details/${product.MaSanPham}`">
                            <img :src="`${product.Images[0]}`"
                                class="w-full [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]" alt="" />
                        </router-link>
                        <div v-if="product.GiaSale > 0"
                            class="absolute top-3 right-3 bg-gradient-to-r from-[#DB3F4C] to-[#B91C1C] text-white text-[14px] px-3 py-1 rounded-full font-bold shadow-lg animate-pulse">
                            <i class="fas fa-fire mr-1"></i>SALE
                        </div>
                        <router-link :to="`/details/${product.MaSanPham}`"
                            class="py-2 whitespace-nowrap text-[12px] text-ellipsis overflow-hidden max-w-64">
                            <p
                                class="text-white overflow-hidden text-ellipsis whitespace-nowrap text-[14px] text-center flex-grow group-hover:text-[#DB3F4C] transition-all duration-300">
                                {{ product.TenSanPham }}
                            </p>
                        </router-link>
                        <p
                            class="text-[#FFD700] text-[16px] font-semibold flex justify-center gap-4 items-center w-full">
                            <span v-if="product.GiaSale > 0" class="text-[18px]">{{ formatCurrencySale(product.GiaSale)
                                }}
                                <span class="text-[14px] relative -top-[2px] underline">đ</span></span>
                            <span :class="(product.GiaSale && product.GiaSale > 0) ? 'line-through text-white' : 'text-[18px]' ">{{
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
                            <div
                                class="absolute inset-0 bg-gradient-to-r from-gray-500/10 to-gray-400/10 transform -skew-x-12">
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
            </div>
        </div>
        <div class="flex justify-center my-10 space-x-2">
            <button v-for="page in totalPages" :key="page" @click="goToPage(page)"
                class="px-4 py-2 rounded-md border text-white cursor-pointer" :class="page === currentPage
                    ? 'bg-[#DB3F4C] border-[#DB3F4C]'
                    : 'border-gray-500'
                    ">
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

<style scoped>
/* Minimal CSS cho hiệu ứng nhẹ */
.hover\:scale-105:hover {
    transform: scale(1.05);
}
</style>
