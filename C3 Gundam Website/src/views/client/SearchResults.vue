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
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header_Home />
        <h1 v-if="listProducts.length > 0" class="mb-10 mt-5 m-5 lg:mx-[210px] text-white font-bold text-[20px]">Kết quả tìm kiếm của "{{ searchQuery
            }}"</h1>
        <div v-if="listProducts.length > 0" class="mt-10 mb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 m-5 lg:mx-[210px]">
            <div v-for="(product, index) in paginatedProducts" :key="index" class="flex flex-col gap-3 items-center">
                <router-link :to="`/details/${product.MaSanPham}`">
                    <img :src="`${product.Images[0]}`" class="w-full [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]"
                        alt="">
                </router-link>
                <router-link :to="`/details/${product.MaSanPham}`"
                    class="text-white text-[14px] text-center flex-grow hover:text-[#DB3F4C] transition-all duration-300">{{
                        product.TenSanPham }}</router-link>
                <p class="text-white text-[14px]">Giá: <span class="text-[#FFD700]">{{ formatCurrency(product.GiaBan) }}
                        VNĐ</span></p>
                <button @click.prevent="addToCart(product.MaSanPham)" v-if="product.TrangThai === 'Đang bán'"
                    class="px-5 py-2 w-full bg-[#DB3F4C] text-white font-medium">Thêm giỏ hàng</button>
                <button v-else-if="product.TrangThai === 'Ngừng kinh doanh'"
                    class="px-5 py-2 w-full bg-gray-600 text-white font-medium">Ngừng kinh doanh</button>
                <button v-else-if="product.SoLuong < 0"
                    class="px-5 py-2 w-full bg-gray-600 text-white font-medium">Hết hàng</button>
            </div>
        </div>
        <div v-else class="flex flex-1 justify-center items-center m-auto w-full">
            <div class="flex flex-col items-center justify-center gap-3">
                <p class="font-semibold text-white text-[18px] lg:text-[24px] text-center">Không có sản phẩm phù hợp với "{{ searchQuery }}"</p>
                <img src="../../assets/img/empty_client.png" class="w-[150px]" alt="">
            </div>
        </div>
        <div class="flex justify-center my-10 space-x-2">
            <button v-for="page in totalPages" :key="page" 
                @click="goToPage(page)" 
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