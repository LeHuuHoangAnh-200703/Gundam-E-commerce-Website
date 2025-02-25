<script setup>
import { ref, onMounted, computed } from "vue"
import Header_Home from "@/components/client/Header_Home.vue";
import Footer from "@/components/client/Footer.vue";
import BackToTop from "@/components/client/BackToTop.vue";
import NotificationClient from "@/components/Notification/NotificationClient.vue";
import axios from 'axios';
import { useRouter, useRoute } from "vue-router";

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
            }
        })
        //Lọc những sản phẩm ngừng kinh doanh đưa xuống hiển thị cuối cùng
        const productsNormal = listProducts.value.filter(product => product.TrangThai !== 'Ngừng kinh doanh');
        const productsSpecial = listProducts.value.filter(product => product.TrangThai === 'Ngừng kinh doanh');
        listProducts.value = [...productsNormal, ...productsSpecial];
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

const chatBox = () => {
    const MaKhachHang = localStorage.getItem('MaKhachHang');
    if (!MaKhachHang) {
        router.push('/login');
    } else {
        router.push('/chatbox');
    }
}

onMounted(() => {
    if (!searchQuery.value) {
        router.push({ name: 'NotFound' });
    } else {
        fectchProducts();
    }
})
</script>

<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth">
        <Header_Home />
        <h1 class="mb-10 mt-5 m-5 lg:mx-[210px] text-white font-bold text-[20px]">Kết quả tìm kiếm của "{{ searchQuery
            }}"</h1>
        <div class="mt-10 mb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 m-5 lg:mx-[210px]">
            <div v-for="(product, index) in listProducts" :key="index" class="flex flex-col gap-3 items-center">
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
                    class="px-5 py-2 w-full rounded-md bg-[#DB3F4C] text-white font-medium">Thêm giỏ hàng</button>
                <button v-else-if="product.TrangThai === 'Ngừng kinh doanh'"
                    class="px-5 py-2 w-full rounded-md bg-gray-600 text-white font-medium">Ngừng kinh doanh</button>
                <button v-else-if="product.SoLuong < 0"
                    class="px-5 py-2 w-full rounded-md bg-gray-600 text-white font-medium">Hết hàng</button>
            </div>
        </div>
        <Footer />
        <BackToTop />
        <button @click.prevent="chatBox" to="/chatbox"
            class="fixed bottom-32 right-10 flex justify-center items-center [box-shadow:0px_0px_10px_rgba(255,255,255,0.8)] bg-[#003171] border-2 rounded-full w-[50px] h-[50px]">
            <i class="fa-solid fa-comments text-white"></i>
        </button>
        <NotificationClient :message="notification.message" :type="notification.type" />
    </div>
</template>