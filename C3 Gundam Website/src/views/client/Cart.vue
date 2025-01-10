<script setup>
import { ref, onMounted, computed } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const carts = ref([]);
const notification = ref({
    message: '',
    type: ''
});

const fetchCarts = async (maKhachHang) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/giohang/khachhang/${maKhachHang}`);
        console.log(response.data)
        carts.value = response.data.map(cart => {
            return {
                ...cart,
                isSelected: false
            }
        });
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

const deleteCart = async (idGioHang) => {
    try {
        const response = await axios.delete(`http://localhost:3000/api/giohang/${idGioHang}`);
        notification.value = {
            message: "Xóa sản phẩm khỏi giỏ hàng thành công!",
            type: "success",
        };
        setTimeout(() => {
            router.replace('/carts');
        }, 1000);
    } catch (error) {
        notification.value = {
            message: error.response?.data?.message || "Xóa sản phẩm khỏi giỏ hàng thất bại!",
            type: "error",
        };
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}

const decreaseQuantity = (cart) => {
    if (cart.SoLuong > 1) {
        cart.SoLuong--;
    }
};

const increaseQuantity = (cart) => {
    cart.SoLuong++;
};

const deleteSelectedCarts = async () => {
    // Lọc các sản phẩm đã được chọn (isSelected = true) và lấy danh sách ID của chúng
    const selectedCartIds = carts.value.filter(cart => cart.isSelected).map(cart => cart.MaGioHang);
    if (selectedCartIds.length === 0) {
        notification.value = {
            message: "Vui lòng chọn ít nhất một sản phẩm để xóa!",
            type: "error",
        };
        setTimeout(() => notification.value.message = '', 3000);
        return;
    }

    try {
        // Dùng Promise.all để xóa tất cả các sản phẩm đã chọn cùng lúc
        const deletePromises = selectedCartIds.map(id => axios.delete(`http://localhost:3000/api/giohang/${id}`));
        await Promise.all(deletePromises);
        carts.value = carts.value.filter(cart => !selectedCartIds.includes(cart.MaGioHang));

    } catch (err) {
        console.log("Error delete cart: ", err);
    }
};

const goToOrderPage = async () => {
    const selectedProducts = carts.value.filter(cart => cart.isSelected);
    if (selectedProducts.length === 0) {
        notification.value = {
            message: "Vui lòng chọn ít nhất một sản phẩm!",
            type: "error",
        };
        setTimeout(() => notification.value.message = '', 3000);
        return;
    }
    localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
    await deleteSelectedCarts();
    router.push('/orders');
};

const totalPrice = computed(() => {
    return carts.value
        .filter(cart => cart.isSelected)
        .reduce((sum, cart) => {
            return sum + cart.DonGia * cart.SoLuong;
        }, 0);
});

function formatCurrency(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

onMounted(() => {
    const maKhachHang = localStorage.getItem("MaKhachHang");
    fetchCarts(maKhachHang);
})
</script>

<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <h1 class="text-center text-white text-[28px] font-semibold mt-6 uppercase">Giỏ hàng của bạn</h1>
        <div v-if="carts.length > 0" class="relative mb-5 m-2 lg:mx-[200px] xl:mx-[100px] flex items-center flex-col flex-grow">
            <div class="w-full m-4">
                <div
                    class="bg-[#242424] flex flex-col mb-7 overflow-hidden px-4 py-3 rounded [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                    <div v-for="(cart, index) in carts" :key="index"
                        class="flex flex-col items-center gap-5 lg:flex-row space-x-0 lg:space-x-[60px] py-3 lg:items-center lg:justify-between">
                        <div class="flex gap-4 items-center">
                            <div class="inline-flex items-center lg:mr-4">
                                <label class="flex items-center cursor-pointer relative">
                                    <input type="checkbox" v-model="cart.isSelected"
                                        class="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-[#DB3F4C] checked:border-[#DB3F4C]"
                                        id="check2" />
                                    <span
                                        class="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20"
                                            fill="currentColor" stroke="currentColor" stroke-width="1">
                                            <path fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd"></path>
                                        </svg>
                                    </span>
                                </label>
                            </div>
                            <img :src="`/src/assets/img/${cart.HinhAnh}`" class="w-[80px] h-auto" alt="">
                            <div class="flex flex-col gap-1 justify-center">
                                <div class="w-48 lg:w-60 whitespace-nowrap text-ellipsis overflow-hidden">
                                    <p class="text-white text-[14px] overflow-hidden text-ellipsis whitespace-nowrap">{{
                                        cart.TenSanPham }}</p>
                                </div>
                                <p class="text-[14px] text-white font-medium">Loại sản phẩm: {{ cart.LoaiSanPham }}</p>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button @click="decreaseQuantity(cart)"
                                class="w-[40px] h-[40px] bg-[#333] rounded-full text-white font-bold hover:bg-[#DB3F4C]">-</button>
                            <input id="quantity" name="total_amount" value="1" style="appearance: textfield;"
                                type="number" min="1" v-model="cart.SoLuong"
                                class="text-lg bg-transparent border-gray-600 text-white border-2 rounded-md font-semibold h-10 w-16 text-center" />
                            <button @click="increaseQuantity(cart)"
                                class="w-[40px] h-[40px] bg-[#333] rounded-full text-white font-bold hover:bg-[#DB3F4C]">+</button>
                        </div>
                        <div class="flex gap-5 justify-between items-center">
                            <p class="text-[14px] text-white font-medium">Đơn giá: <span class="text-[#FFD700]">{{
                                formatCurrency(cart.DonGia * cart.SoLuong) }} VNĐ</span></p>
                            <form @click="deleteCart(cart.MaGioHang)">
                                <button type="submit"
                                    class="w-[40px] h-[40px] bg-[#333] rounded-full text-white font-bold hover:bg-[#DB3F4C]">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </form>
                        </div>
                    </div>
                    <hr>
                    <div class="flex justify-end items-end flex-col">
                        <p class="text-[16px] text-white font-medium my-3">Tổng đơn: <span class="text-[#FFD700]">{{
                                formatCurrency(totalPrice) }} VNĐ</span></p>
                        <button @click.prevent="goToOrderPage" type="submit"
                            class="bg-[#DB3F4C] px-5 py-2 rounded-md text-white self-end w-auto">Đặt
                            hàng</button>
                    </div>

                </div>
            </div>
        </div>
        <div v-else class="flex justify-center items-center m-auto w-full">
            <div class="flex flex-col items-center justify-center gap-3">
                <p class="font-semibold text-white text-[18px] lg:text-[24px] text-center">Hiện tại không có sản phẩm
                    nào!</p>
                <img src="../../assets/img/banner.png" class="w-[200px]" alt="">
            </div>
        </div>
        <Footer />
        <BackToTop />
        <transition name="slide-fade" mode="out-in">
            <div v-if="notification.message" :class="['fixed top-4 right-4 p-4 bg-white shadow-lg border-t-4 rounded z-10 flex items-center space-x-2', {
                'border-[#DB3F4C]': notification.type === 'error',
                'border-[#40E0D0]': notification.type === 'success',
            }]">
                <div class="flex gap-2 justify-center items-center">
                    <img :src="notification.type === 'success' ? '/src/assets/img/rb_7710.png' : '/src/assets/img/rb_12437.png'"
                        class="w-[50px]" alt="">
                    <p class="text-[16px] font-semibold"
                        :class="notification.type === 'success' ? 'text-[#40E0D0]' : 'text-[#DB3F4C]'">{{
                            notification.message }}</p>
                </div>
            </div>
        </transition>
    </div>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.5s ease;
}

.slide-fade-enter,
.slide-fade-leave-to {
    transform: translateX(100%);
    opacity: 0;
}
</style>