<script setup>
import { ref, onMounted, computed } from "vue"
import Header_Home from "@/components/client/Header_Home.vue";
import Footer from "@/components/client/Footer.vue";
import BackToTop from "@/components/client/BackToTop.vue";
import NotificationClient from "@/components/Notification/NotificationClient.vue";
import axios from 'axios';
import { useRouter } from 'vue-router';
import Chat from '../../components/client/Chat.vue';
import ChatBot from '../../components/client/ChatBot.vue';

const router = useRouter();

const arrange = ref([
    {
        name: "Bán chạy nhất",
        type: "BestSeller"
    },
    {
        name: "Giá thấp đến cao",
        type: "LowPrice"
    },
    {
        name: "Giá cao đến thấp",
        type: "HighPrice"
    },
    {
        name: "Sản phẩm giảm giá",
        type: "Sale"
    }
])

const listProducts = ref([]);
const listProductTypes = ref([]);
const searchQuery = ref("");
const selectedType = ref("All");

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

const handleSearch = (query) => {
    searchQuery.value = query;
};

const fectchProducts = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/sanpham');
        listProducts.value = response.data.map(product => {
            return {
                ...product,
                NgayBan: new Date(product.NgayBan)
            }
        })

        const productsNormal = listProducts.value.filter(product => (product.TrangThai !== 'Ngừng kinh doanh' && product.SoLuong > 0));
        const productsSpecial = listProducts.value.filter(product => product.TrangThai === 'Ngừng kinh doanh');
        const productsOutOfStock = listProducts.value.filter(product => product.SoLuong <= 0);
        listProducts.value = [...productsNormal.sort((a, b) => b.NgayBan - a.NgayBan), ...productsSpecial.sort((a, b) => b.NgayBan - a.NgayBan), ...productsOutOfStock.sort((a, b) => b.NgayBan - a.NgayBan)];
    } catch (error) {
        console.log("error fetching: ", error);
    }
}

const fetchProductType = async () => {
    try {
        const response = await axios.get("http://localhost:3000/api/loaisanpham");
        listProductTypes.value = response.data.map(productType => {
            return {
                ...productType
            }
        })
    } catch (error) {
        console.log("error fetching: ", error);
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
        return products.filter(product => product.GiaSale > 0);
    }

    return products.filter(product => {
        const matchesType = selectedType.value === "All" || product.LoaiSanPham === selectedType.value;
        return matchesType;
    });
});

const currentPage = ref(1);
const itemsPerPage = ref(15); // 4 dòng × 4 cột = 16 sản phẩm
const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage.value));

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
})
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
                        Gắn kết đam mê sở thích, <br>
                        <span class="text-yellow-300">Hãy xây dựng thế giới Gundam</span> <br>
                        của riêng bạn
                    </h1>
                    <div class="flex items-center gap-4 w-full">
                        <div
                            class="h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex-1 max-w-[200px]">
                        </div>
                        <div class="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                    <p class="text-white text-[14px] font-medium">Cửa hàng Gundam không chỉ là nơi bày bán mô hình, mà
                        còn là không gian nuôi dưỡng đam mê, nơi giấc mơ về những chiến binh cơ khí trở thành hiện thực.
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
                            style="animation-delay: 1s;"></div>
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
                <p class="text-white font-semibold uppercase text-[22px] lg:text-[26px]">Vũ trụ Gundam thu nhỏ trong
                    từng mô
                    hình, chỉ có tại C3 GUNDAM.</p>
                <p class="text-white font-medium my-1">Tại đây bạn có thể chọn được những mẫu Gundam yêu thích chính
                    hãng từ
                    BANDAI NAMCO.</p>
            </div>
            <div class="w-full my-4 lg:grid grid-cols-4 gap-4 items-center">
                <button v-for="item in arrange" :key="item" @click.prevent="selectTypeProducts(item.type)"
                    class="hidden lg:flex bg-gradient-to-b text-center flex-col gap-2 lg:text-start from-[rgba(219,63,76,0.7)] to-[#1A1D27] p-[17.5px]">
                    <p class="text-white font-semibold text-[18px] uppercase">{{ item.name }}</p>
                    <span class="lg:w-[100px] w-full h-[2px] bg-white"></span>
                    <p class="text-[14px] text-white font-medium">> Hiển thị tất cả</p>
                </button>
                <select v-model="selectedType" name="" id="" class="w-full p-4 font-semibold block lg:hidden">
                    <option value="All">Sắp xếp theo</option>
                    <option :value="item.type" v-for="item in arrange" :key="item">{{ item.name }}</option>
                </select>
                <select v-model="selectedType" name="" id="" class="w-full mt-4 p-4 font-semibold block lg:hidden">
                    <option value="All">Loại sản phẩm</option>
                    <option :value="productType.LoaiSanPham" v-for="(productType, index) in listProductTypes"
                        :key="index">{{ productType.TenLoaiSanPham }}</option>
                </select>
            </div>
            <div class="mb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div class="hidden lg:flex flex-col gap-4 w-full col-span-1 items-start">
                    <p class="text-white font-bold uppercase text-[20px] border-b-4 border-[#DC143C] pb-3">Dòng mô hình
                    </p>
                    <button @click.prevent="selectTypeProducts('All')"
                        class="text-white uppercase font-semibold text-[18px] group">
                        Tất cả sản phẩm
                        <div
                            class="h-[2px] bg-[#DB3F4C] scale-x-0 group-hover:scale-100 rounded-full transition-all ease-out origin-left duration-500">
                        </div>
                    </button>
                    <button v-for="(productType, index) in listProductTypes" :key="index"
                        @click.prevent="selectTypeProducts(productType.LoaiSanPham)"
                        class="text-white font-semibold text-[18px] group">
                        {{ productType.TenLoaiSanPham }}
                        <div
                            class="h-[2px] bg-[#DB3F4C] scale-x-0 group-hover:scale-100 rounded-full transition-all ease-out origin-left duration-500">
                        </div>
                    </button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 col-span-3">
                    <div v-for="(product, index) in paginatedProducts" :key="index"
                        class="flex flex-col gap-3 items-center group">
                        <router-link :to="`/details/${product.MaSanPham}`">
                            <img :src="`${product.Images[0]}`"
                                class="w-full [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]" alt="">
                        </router-link>
                        <router-link :to="`/details/${product.MaSanPham}`"
                            class="py-2 whitespace-nowrap text-[12px] text-ellipsis overflow-hidden max-w-64">
                            <p
                                class="text-white overflow-hidden text-ellipsis whitespace-nowrap text-[14px] text-center flex-grow group-hover:text-[#DB3F4C] transition-all duration-300">
                                {{
                                    product.TenSanPham }}</p>
                        </router-link>
                        <p
                            class="text-[#FFD700] text-[16px] font-semibold flex justify-center gap-4 items-center w-full">
                            <span v-if="product.GiaSale > 0" class="text-[18px]">{{
                                formatCurrencySale(product.GiaSale) }}
                                <span class="text-[14px] relative -top-[2px] underline">đ</span></span>
                            <span :class="{ 'line-through text-white': product.GiaSale }">{{
                                formatCurrency(product.GiaBan) }}
                                <span class="text-[14px] relative -top-[2px] underline">đ</span></span>
                        </p>
                        <button @click.prevent="addToCart(product.MaSanPham)"
                            v-if="(product.TrangThai === 'Đang bán' && product.SoLuong > 0)"
                            class="px-5 py-2 w-full bg-[#DB3F4C] text-white font-medium">Thêm giỏ hàng</button>
                        <button v-else-if="product.TrangThai === 'Ngừng kinh doanh'"
                            class="px-5 py-2 w-full bg-gray-600 text-white font-medium">Ngừng kinh doanh</button>
                        <button v-else-if="product.SoLuong <= 0"
                            class="px-5 py-2 w-full bg-gray-600 text-white font-medium">Hết hàng</button>
                    </div>
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

<style scoped>
/* Minimal CSS cho hiệu ứng nhẹ */
.hover\:scale-105:hover {
    transform: scale(1.05);
}
</style>