<script setup>
import axios from "axios";
import { ref, onMounted, watch } from "vue";
import { useRouter } from 'vue-router';
import debounce from "lodash/debounce";

const router = useRouter();
const userInfo = ref({
    MaKhachHang: localStorage.getItem('MaKhachHang') || '',
});
const isLoggedIn = ref(!userInfo.value.MaKhachHang);
const logout = async () => {
    const maKhachHang = localStorage.getItem("MaKhachHang");
    try {
        const response = await axios.post("http://localhost:3000/api/khachhang/logout", {
            maKhachHang
        });
        localStorage.removeItem("SoDienThoai");
        localStorage.removeItem("TenKhachHang");
        localStorage.removeItem("MaKhachHang");
        localStorage.removeItem("HinhAnh");
        localStorage.removeItem('TrangThai');
        isLoggedIn.value = false;
        router.push("/login");
    } catch (error) {
        console.error("Đăng xuất thất bại:", error.response.data.message);
    }
};

const orders_history = () => {
    const MaKhachHang = localStorage.getItem('MaKhachHang');
    if (!MaKhachHang) {
        router.push('/login');
    } else {
        router.push('/orders_history');
    }
}

const profile = () => {
    const MaKhachHang = localStorage.getItem('MaKhachHang');
    if (!MaKhachHang) {
        router.push('/login');
    } else {
        router.push('/profile');
    }
}

const carts = () => {
    const MaKhachHang = localStorage.getItem('MaKhachHang');
    if (!MaKhachHang) {
        router.push('/login');
    } else {
        router.push('/carts');
    }
}

const voucher = () => {
    const MaKhachHang = localStorage.getItem('MaKhachHang');
    if (!MaKhachHang) {
        router.push('/login');
    } else {
        router.push('/voucher');
    }
}
const emit = defineEmits();
const searchQuery = ref("");
const handleSearch = () => {
    if (searchQuery.value.trim()) {
        router.push({
            path: '/seachResults',
            query: { query: searchQuery.value }
        })
    }
};

const cartLists = ref([]);
const fetchCarts = async (maKhachHang) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/giohang/khachhang/${maKhachHang}`);
        cartLists.value = response.data.map(cart => {
            return {
                ...cart
            }
        });
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

const listProducts = ref([]);
const searchProducts = async () => {
    if (!searchQuery.value.trim()) {
        listProducts.value = [];
        return;
    }

    try {
        const response = await axios.get(`http://localhost:3000/api/sanpham/goiy/ketquatimkiem?tenSanPham=${searchQuery.value}`);
        listProducts.value = response.data.map(product => {
            return {
                ...product
            }
        })
        console.log(listProducts.value);
    } catch (err) {
        console.log('Error search: ', err.message);
    }
}

function formatCurrency(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const recognition = ref(null);

const startVoiceSearch = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
        alert("Trình duyệt không hỗ trợ tìm kiếm bằng giọng nói!");
        return;
    }

    // Dừng nhận diện trước khi bắt đầu mới (tránh lỗi xung đột)
    if (recognition.value) {
        recognition.value.stop();
    }

    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition.value = new SpeechRecognition();
    recognition.value.lang = "en-US";
    recognition.value.interimResults = false; // Chỉ lấy kết quả cuối cùng, tránh nhiễu
    recognition.value.maxAlternatives = 1; // Chỉ lấy phương án có độ chính xác cao nhất
    recognition.value.start();

    recognition.value.onresult = (event) => {
        searchQuery.value = event.results[0][0].transcript.trim();
        handleSearch();
    };

    recognition.value.onerror = (event) => {
        console.error("Lỗi nhận diện giọng nói:", event.error);
    };
};

// Sử dụng debounce để giảm tần suất gọi API
const debouncedSearch = debounce(searchProducts, 300);

// Gọi debounce mỗi khi searchQuery thay đổi
watch(searchQuery, () => {
    debouncedSearch();
});

onMounted(() => {
    const openMenu = $(".open-menu");
    const closeMenu = $(".close-menu");
    const sideBar = $(".sidebar");

    openMenu.click(() => {
        sideBar.animate({ left: "0" }, 400);
    })

    closeMenu.click(() => {
        sideBar.animate({ left: "-100%" }, 400);
    })

    const maKhachHang = localStorage.getItem("MaKhachHang");
    fetchCarts(maKhachHang);
});
</script>

<template>
    <header>
        <div class="relative px-5 lg:px-10 py-4 flex justify-between items-center">
            <div class="flex gap-6">
                <router-link to="/" class="font-bold text-white text-[24px] font-bungee"><span
                        class="text-[#DB3F4C]">C3</span>
                    GunDam</router-link>
                <ul class="lg:flex hidden gap-5 items-center text-white font-semibold text-[16px]">
                    <li class="group"><router-link to="/">Trang chủ</router-link>
                        <div
                            class="h-[2px] bg-[#DB3F4C] scale-x-0 group-hover:scale-100 rounded-full transition-all ease-out origin-left duration-500">
                        </div>
                    </li>
                    <li class="group"><button @click.prevent="orders_history">Theo dõi đơn hàng</button>
                        <div
                            class="h-[2px] bg-[#DB3F4C] scale-x-0 group-hover:scale-100 rounded-full transition-all ease-out origin-left duration-500">
                        </div>
                    </li>
                    <li class="group"><button @click.prevent="profile">Tài khoản</button>
                        <div
                            class="h-[2px] bg-[#DB3F4C] scale-x-0 group-hover:scale-100 rounded-full transition-all ease-out origin-left duration-500">
                        </div>
                    </li>
                    <li class="group"><button @click.prevent="voucher" to="/voucher">Giảm giá</button>
                        <div
                            class="h-[2px] bg-[#DB3F4C] scale-x-0 group-hover:scale-100 rounded-full transition-all ease-out origin-left duration-500">
                        </div>
                    </li>
                    <li v-if="isLoggedIn" class="group"><router-link to="/login">Đăng nhập</router-link>
                        <div
                            class="h-[2px] bg-[#DB3F4C] scale-x-0 group-hover:scale-100 rounded-full transition-all ease-out origin-left duration-500">
                        </div>
                    </li>
                    <li v-else class="group"><button @click.prevent="logout">Đăng xuất</button>
                        <div
                            class="h-[2px] bg-[#DB3F4C] scale-x-0 group-hover:scale-100 rounded-full transition-all ease-out origin-left duration-500">
                        </div>
                    </li>
                </ul>
            </div>
            <div class="flex lg:gap-10 gap-6 items-end">
                <div class="relative lg:block hidden">
                    <input type="text" v-model="searchQuery" @keydown.enter="handleSearch"
                        class="search-input relative py-3 w-[300px] pr-10 outline-none text-white border-b-2 bg-transparent placeholder:font-semibold placeholder:text-white"
                        placeholder="Tìm kiếm ...">
                    <i class="fa-solid fa-magnifying-glass absolute top-3 right-3 text-[20px] text-white"></i>
                </div>
                <button @click="startVoiceSearch" class="text-white text-[24px] lg:block hidden"><i
                        class="fa-solid fa-microphone"></i></button>
                <button @click.prevent="carts" class="relative">
                    <i class="fa-solid fa-cart-shopping text-white text-[24px]"></i>
                    <span
                        class="absolute -top-3 -right-2 flex items-center justify-center w-[24px] h-[24px] text-[15px] bg-[#DB3F4C] text-white font-semibold rounded-full">{{
                            cartLists.length }}</span>
                </button>
                <button class="open-menu lg:hidden block">
                    <i class="fa-solid fa-bars text-white text-[24px]"></i>
                </button>
            </div>
            <div v-if="listProducts.length"
                class="absolute top-20 right-16 rounded-md bg-white p-6 shadow-md hidden lg:block">
                <div class="flex flex-col gap-4">
                    <router-link :to="`/details/${product.MaSanPham}`" v-for="(product, index) in listProducts"
                        :key="index" class="flex gap-2 items-center border-b-2 pb-3 group">
                        <img :src="`${product.Images[0]}`" class="w-[50px] border-2 rounded-md border-[#1A1D27]" alt="">
                        <div class="flex flex-col">
                            <div class="whitespace-nowrap text-ellipsis overflow-hidden w-[300px]">
                                <p
                                    class="font-semibold text-[12px] overflow-hidden text-ellipsis whitespace-nowrap group-hover:text-[#DB3F4C] transition-all duration-300">
                                    {{ product.TenSanPham }}</p>
                            </div>
                            <p class="text-[12px] font-semibold">Giá: <span class="text-[#DB3F4C]">{{
                                formatCurrency(product.GiaBan) }} VNĐ</span></p>
                        </div>
                    </router-link>
                </div>
            </div>
        </div>
        <div class="sidebar fixed top-0 -left-[100%] w-full h-full bg-[#1A1D27] p-4 z-20">
            <div class="flex justify-between items-center">
                <h1 class="font-bold text-white text-[24px] font-bungee"><span class="text-[#DB3F4C]">C3</span>
                    GunDam</h1>
                <button class="close-menu p-3 border-2 rounded-full w-[50px] h-[50px] flex items-center justify-center">
                    <i class="fa-solid fa-arrow-left text-white text-[24px]"></i>
                </button>
            </div>
            <div class="flex gap-5">
                <div class="relative my-4">
                    <input type="text" v-model="searchQuery" @keydown.enter="handleSearch"
                        class="search-input relative py-3 w-full text-[24px] pr-10 outline-none text-white border-b-2 bg-transparent placeholder:font-semibold placeholder:text-white"
                        placeholder="Tìm kiếm ...">
                    <i class="fa-solid fa-magnifying-glass absolute top-3 right-3 text-[20px] text-white"></i>
                </div>
                <button @click="startVoiceSearch" class="text-white text-[24px]"><i
                        class="fa-solid fa-microphone"></i></button>
            </div>

            <ul class="flex flex-col gap-6 text-[20px] text-white font-semibold">
                <li class="group flex gap-3 items-center hover:text-[#DB3F4C] transition-all duration-300"><i
                        class="fa-solid fa-house"></i> <router-link to="/">Trang chủ</router-link></li>
                <li class="group flex gap-3 items-center hover:text-[#DB3F4C] transition-all duration-300"><i
                        class="fa-solid fa-bag-shopping"></i> <button @click.prevent="orders_history">Theo dõi đơn
                        hàng</button></li>
                <li class="group flex gap-3 items-center hover:text-[#DB3F4C] transition-all duration-300"><i
                        class="fa-solid fa-user"></i> <button @click.prevent="profile">Tài khoản</button></li>
                <li class="group flex gap-3 items-center hover:text-[#DB3F4C] transition-all duration-300"><i
                        class="fa-solid fa-tags"></i> <button @click.prevent="voucher">Giảm giá</button></li>
                <li v-if="isLoggedIn"
                    class="group flex gap-3 items-center hover:text-[#DB3F4C] transition-all duration-300"><i
                        class="fa-solid fa-globe"></i> <router-link to="/login">Đăng nhập</router-link></li>
                <li v-else class="group flex gap-3 items-center hover:text-[#DB3F4C] transition-all duration-300"><i
                        class="fa-solid fa-globe"></i> <router-link to="/login">Đăng xuất</router-link></li>
            </ul>
        </div>
    </header>
</template>

<style></style>