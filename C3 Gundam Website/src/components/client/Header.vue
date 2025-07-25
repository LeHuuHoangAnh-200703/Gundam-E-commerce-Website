<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const cartLists = ref([]);
const imageCustomer = ref('');
const nameCustomer = ref('');
const emailCustomer = ref('');
const idCustomer = ref('');
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
        localStorage.removeItem("Email");
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

const order = () => {
    const MaKhachHang = localStorage.getItem('MaKhachHang');
    if (!MaKhachHang) {
        router.push('/login');
    } else {
        router.push('/orders_history');
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

const community = () => {
    const MaKhachHang = localStorage.getItem('MaKhachHang');
    if (!MaKhachHang) {
        router.push('/login');
    } else {
        router.push('/communityPost');
    }
}

const checkLogin = () => {
    const MaKhachHang = localStorage.getItem('MaKhachHang');
    if (!MaKhachHang) {
        router.push('/login');
    }
}

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

const fetchCustomer = async (maKhachHang) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/khachhang/${maKhachHang}`);
        imageCustomer.value = response.data.Image;
        nameCustomer.value = response.data.TenKhachHang;
        emailCustomer.value = response.data.Email;
        idCustomer.value = response.data.MaKhachHang;
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

onMounted(() => {
    const openMenu = $(".open-menu");
    const closeMenu = $(".close-menu");
    const sideBar = $(".sidebar");
    const openInfo = $(".open-info");
    const menuUser = $(".menuUser");

    openMenu.click(() => {
        sideBar.animate({ left: "0" }, 400);
    })

    closeMenu.click(() => {
        sideBar.animate({ left: "-100%" }, 400);
    })

    openInfo.click(() => {
        const isOpen = menuUser.css("right") === "20px";
        menuUser.animate({ right: isOpen ? "-100%" : "20px" }, 400);
    });

    const maKhachHang = localStorage.getItem("MaKhachHang");
    fetchCarts(maKhachHang);
    fetchCustomer(maKhachHang);
});
</script>

<template>
    <header>
        <div class="relative px-5 lg:px-10 py-5 flex justify-between items-center">
            <router-link to="/">
                <img src="../../assets/img/LOGO_STORE-removebg-preview.png" class="w-[200px] h-[50px] object-cover" alt="">
            </router-link>
            <ul class="lg:flex hidden gap-5 items-center text-white font-semibold text-[16px]">
                <li class="group"><router-link to="/">Trang chủ</router-link>
                    <div
                        class="h-[2px] bg-[#DB3F4C] scale-x-0 group-hover:scale-100 rounded-full transition-all ease-out origin-left duration-500">
                    </div>
                </li>
                <li class="group"><button @click.prevent="order">Đơn hàng</button>
                    <div
                        class="h-[2px] bg-[#DB3F4C] scale-x-0 group-hover:scale-100 rounded-full transition-all ease-out origin-left duration-500">
                    </div>
                </li>
                <li class="group"><button @click.prevent="voucher" to="/voucher">Giảm giá</button>
                    <div
                        class="h-[2px] bg-[#DB3F4C] scale-x-0 group-hover:scale-100 rounded-full transition-all ease-out origin-left duration-500">
                    </div>
                </li>
                <li class="group"><button @click.prevent="community" to="/community">Cộng đồng Gundam</button>
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
            <div class="flex lg:gap-10 gap-7 items-end">
                <button @click.prevent="carts" class="relative">
                    <i class="fa-solid fa-cart-shopping text-white text-[24px]"></i>
                    <span
                        class="absolute -top-3 -right-2 flex items-center justify-center w-[24px] h-[24px] text-[15px] bg-[#DB3F4C] text-white font-semibold rounded-full">{{
                            cartLists.length }}</span>
                </button>
                <button v-if="!isLoggedIn" class="open-info">
                    <img :src="imageCustomer"
                        class="w-10 h-10 rounded-full object-cover ring-4 ring-blue-500/20 shadow-lg" alt="">
                </button>
                <button v-else @click.prevent="checkLogin">
                    <i class="fa-solid fa-user text-white text-[24px]"></i>
                </button>
                <button class="open-menu lg:hidden block">
                    <i class="fa-solid fa-bars text-white text-[24px]"></i>
                </button>
            </div>
        </div>
        <div class="sidebar fixed top-0 -left-[100%] w-full h-full bg-[#1A1D27] p-4 z-20">
            <div class="flex justify-between items-center">
                <h1 class="font-bold text-white text-[24px] font-bungee"><span class="text-[#DB3F4C]">C3</span>
                    GunDam Store</h1>
                <button class="close-menu p-3 border-2 rounded-full w-[50px] h-[50px] flex items-center justify-center">
                    <i class="fa-solid fa-arrow-left text-white text-[24px]"></i>
                </button>
            </div>
            <ul class="flex flex-col gap-6 text-[20px] text-white font-semibold mt-10">
                <li class="group flex gap-3 items-center hover:text-[#DB3F4C] transition-all duration-300"><i
                        class="fa-solid fa-house"></i> <router-link to="/">Trang chủ</router-link></li>
                <li class="group flex gap-3 items-center hover:text-[#DB3F4C] transition-all duration-300"><i
                        class="fa-solid fa-bag-shopping"></i> <button @click.prevent="order">Đơn hàng</button></li>
                <li class="group flex gap-3 items-center hover:text-[#DB3F4C] transition-all duration-300"><i
                        class="fa-solid fa-tags"></i> <button @click.prevent="voucher">Giảm giá</button></li>
                <li class="group flex gap-3 items-center hover:text-[#DB3F4C] transition-all duration-300"><i
                        class="fa-solid fa-users"></i> <button @click.prevent="community">Cộng đồng Gundam</button></li>
                <li v-if="isLoggedIn"
                    class="group flex gap-3 items-center hover:text-[#DB3F4C] transition-all duration-300"><i
                        class="fa-solid fa-globe"></i> <router-link to="/login">Đăng nhập</router-link></li>
                <li v-else class="group flex gap-3 items-center hover:text-[#DB3F4C] transition-all duration-300"><i
                        class="fa-solid fa-globe"></i> <button @click.prevent="logout">Đăng xuất</button></li>
            </ul>
        </div>
        <div
            class="menuUser fixed top-20 -right-[100%] rounded-md backdrop-blur-sm bg-gradient-to-br from-white to-gray-50 z-50 border border-gray-200 shadow-2xl">
            <div class="flex gap-4 items-center bg-gradient-to-r from-indigo-400 to-purple-600 p-6 rounded-t-md">
                <div class="relative">
                    <img :src="imageCustomer" class="w-12 h-12 rounded-full object-cover ring-4 ring-white/30 shadow-lg"
                        alt="User Avatar">
                    <div class="absolute -bottom-1 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white">
                    </div>
                </div>
                <div class="flex flex-col items-start">
                    <p class="text-[16px] font-semibold text-white">{{ nameCustomer }}</p>
                    <p class="text-[12px] font-medium text-white/80">{{ emailCustomer }}</p>
                </div>
            </div>
            <div class="p-4 space-y-1 flex flex-col">
                <router-link :to="`/profile`"
                    class="group flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-purple-600/10 hover:to-purple-600/5 hover:text-purple-600 transition-all duration-300 transform hover:scale-[1.02]">
                    <div
                        class="w-10 h-10 rounded-lg bg-blue-100 group-hover:bg-indigo-400/30 flex items-center justify-center transition-all duration-300">
                        <i class="fa-solid fa-user text-blue-600 group-hover:text-purple-600"></i>
                    </div>
                    <span class="font-medium">Thông tin cá nhân</span>
                    <i
                        class="fa-solid fa-chevron-right ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"></i>
                </router-link>
                <router-link :to="`/editProfile/${idCustomer}`"
                    class="group flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-purple-600/10 hover:to-purple-600/5 hover:text-purple-600 transition-all duration-300 transform hover:scale-[1.02]">
                    <div
                        class="w-10 h-10 rounded-lg bg-pink-100 group-hover:bg-indigo-400/30 flex items-center justify-center transition-all duration-300">
                        <i class="fa-solid fa-user-edit text-pink-600 group-hover:text-purple-600"></i>
                    </div>
                    <span class="font-medium">Chỉnh sửa hồ sơ</span>
                    <i
                        class="fa-solid fa-chevron-right ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"></i>
                </router-link>
                <router-link :to="`/orders_history`"
                    class="group flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-purple-600/10 hover:to-purple-600/5 hover:text-purple-600 transition-all duration-300 transform hover:scale-[1.02]">
                    <div
                        class="w-10 h-10 rounded-lg bg-orange-100 group-hover:bg-indigo-400/30 flex items-center justify-center transition-all duration-300">
                        <i class="fa-solid fa-bag-shopping text-orange-600 group-hover:text-purple-600"></i>
                    </div>
                    <span class="font-medium">Đơn hàng của bạn</span>
                    <i
                        class="fa-solid fa-chevron-right ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"></i>
                </router-link>
                <router-link :to="`/personalDirectory/${idCustomer}`"
                    class="group flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-purple-600/10 hover:to-purple-600/5 hover:text-purple-600 transition-all duration-300 transform hover:scale-[1.02]">
                    <div
                        class="w-10 h-10 rounded-lg bg-green-100 group-hover:bg-indigo-400/30 flex items-center justify-center transition-all duration-300">
                        <i class="fa-solid fa-folder text-green-600 group-hover:text-purple-600"></i>
                    </div>
                    <span class="font-medium">Danh mục cá nhân</span>
                    <i
                        class="fa-solid fa-chevron-right ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"></i>
                </router-link>
                <router-link :to="`/yourPostLists/${idCustomer}`"
                    class="group flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-purple-600/10 hover:to-purple-600/5 hover:text-purple-600 transition-all duration-300 transform hover:scale-[1.02]">
                    <div
                        class="w-10 h-10 rounded-lg bg-purple-100 group-hover:bg-indigo-400/30 flex items-center justify-center transition-all duration-300">
                        <i class="fa-solid fa-edit text-purple-600 group-hover:text-purple-600"></i>
                    </div>
                    <span class="font-medium">Bài đăng của bạn</span>
                    <i
                        class="fa-solid fa-chevron-right ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"></i>
                </router-link>
                <hr class="my-4">
                <button @click.prevent="logout"
                    class="group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300 transform hover:scale-[1.02]">
                    <div
                        class="w-10 h-10 rounded-lg bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-all duration-300">
                        <i class="fa-solid fa-right-from-bracket text-red-600"></i>
                    </div>
                    <span class="font-medium">Đăng xuất</span>
                    <i
                        class="fa-solid fa-chevron-right ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"></i>
                </button>
            </div>
        </div>
    </header>
</template>

<style></style>