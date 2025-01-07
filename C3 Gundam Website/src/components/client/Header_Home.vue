<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router';

const router = useRouter();
const userInfo = ref({
    MaKhachHang: localStorage.getItem('MaKhachHang') || '',
});
const isLoggedIn = ref(!userInfo.value.MaKhachHang);
const logout = () => {
    localStorage.removeItem('TenKhachHang');
    localStorage.removeItem('MaKhachHang');
    localStorage.removeItem('Email');
    userInfo.value.TenKhachHang = '';
    userInfo.value.Email = '';
    userInfo.value.MaKhachHang = '';
    isLoggedIn.value = false;

    router.push('/login');
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
const emit = defineEmits();
const searchQuery = ref("");
const handleSearch = () => {
    emit('search', searchQuery.value);
};

const cartLists = ref([]);
const fetchCarts = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/giohang');
        cartLists.value = response.data.map(cart => {
            return {
                ...cart,
            }
        })
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

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

    $(".search-input").on("keydown", (event) => {
        if (event.key === "Enter") {
            emit('search', searchQuery.value);
        }
    });

    fetchCarts();
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
                    <li class="group"><button @click.prevent="orders_history">Lịch sử mua hàng</button>
                        <div
                            class="h-[2px] bg-[#DB3F4C] scale-x-0 group-hover:scale-100 rounded-full transition-all ease-out origin-left duration-500">
                        </div>
                    </li>
                    <li class="group"><button @click.prevent="profile">Tài khoản</button>
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
            <div class="flex lg:gap-10 gap-7 items-end">
                <div class="relative lg:block hidden">
                    <input type="text" v-model="searchQuery"
                        class="search-input relative py-3 w-[300px] pr-10 outline-none text-white border-b-2 bg-transparent placeholder:font-semibold placeholder:text-white"
                        placeholder="Tìm kiếm ...">
                    <i class="fa-solid fa-magnifying-glass absolute top-3 right-3 text-[20px] text-white"></i>
                </div>
                <button @click.prevent="carts" class="relative">
                    <i class="fa-solid fa-cart-shopping text-white text-[24px]"></i>
                    <span
                        class="absolute -top-3 -right-2 flex items-center justify-center w-[24px] h-[24px] text-[15px] bg-[#DB3F4C] text-white font-semibold rounded-full">{{ cartLists.length }}</span>
                </button>
                <button class="open-menu lg:hidden block">
                    <i class="fa-solid fa-bars text-white text-[24px]"></i>
                </button>
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
            <div class="relative my-4">
                <input type="text" v-model="searchQuery"
                    class="search-input relative py-3 w-full text-[24px] pr-10 outline-none text-white border-b-2 bg-transparent placeholder:font-semibold placeholder:text-white"
                    placeholder="Tìm kiếm ...">
                <i class="fa-solid fa-magnifying-glass absolute top-3 right-3 text-[20px] text-white"></i>
            </div>
            <ul class="flex flex-col gap-6 text-[20px] text-white font-semibold">
                <li class="group flex gap-3 items-center hover:text-[#DB3F4C] transition-all duration-300"><i
                        class="fa-solid fa-house"></i> <router-link to="/">Trang chủ</router-link></li>
                <li class="group flex gap-3 items-center hover:text-[#DB3F4C] transition-all duration-300"><i
                        class="fa-solid fa-bag-shopping"></i> <button @click.prevent="orders_history">Lịch sử mua
                        hàng</button></li>
                <li class="group flex gap-3 items-center hover:text-[#DB3F4C] transition-all duration-300"><i
                        class="fa-solid fa-user"></i> <button @click.prevent="profile">Tài khoản</button></li>
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