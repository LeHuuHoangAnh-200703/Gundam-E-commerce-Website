<script setup>
import axios from "axios";
import { ref, onMounted, watch } from "vue";
import { useRouter } from 'vue-router';
import debounce from "lodash/debounce";

const router = useRouter();
const cartLists = ref([]);
const emit = defineEmits();
const searchQuery = ref("");
const listProducts = ref([]);
const recognition = ref(null);
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

const handleSearch = () => {
    if (searchQuery.value.trim()) {
        router.push({
            path: '/seachResults',
            query: { query: searchQuery.value }
        })
    }
};

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

const closeProductDisplay = () => {
    return listProducts.value = [];
}

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
            <div v-if="listProducts.length"
                class="absolute top-20 right-16 rounded-md bg-white p-6 shadow-md hidden lg:block z-40">
                <div class="flex items-center justify-between">
                    <p class="font-semibold text-[20px]">Hiện có</p>
                    <button class="group" type="Button" @click.prevent="closeProductDisplay">
                        <i
                            class="fa-solid fa-xmark text-[25px] group-hover:text-[#DB3F4C] transition-all duration-300"></i>
                    </button>
                </div>
                <hr class="mb-4 mt-2 bg-[#1A1D27]">
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
                        class="fa-solid fa-bag-shopping"></i> <button @click.prevent="order">Đơn hàng</button></li>
                <li class="group flex gap-3 items-center hover:text-[#DB3F4C] transition-all duration-300"><i
                        class="fa-solid fa-tags"></i> <button @click.prevent="voucher">Giảm giá</button></li>
                <li class="group flex gap-3 items-center hover:text-[#DB3F4C] transition-all duration-300"><i
                        class="fa-solid fa-users"></i> <button @click.prevent="community">Cộng đồng Gundam</button></li>
                <li v-if="isLoggedIn"
                    class="group flex gap-3 items-center hover:text-[#DB3F4C] transition-all duration-300"><i
                        class="fa-solid fa-globe"></i> <router-link to="/login">Đăng nhập</router-link></li>
                <li v-else class="group flex gap-3 items-center hover:text-[#DB3F4C] transition-all duration-300"><i
                        class="fa-solid fa-globe"></i> <router-link to="/login">Đăng xuất</router-link></li>
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