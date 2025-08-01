<script setup>
import { ref, onMounted, computed } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import NotificationClient from "@/components/Notification/NotificationClient.vue";
import EmtyState from '@/components/Notification/EmtyState.vue';
import Chat from '../../components/client/Chat.vue';
import ChatBot from '../../components/client/ChatBot.vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const carts = ref([]);
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

const fetchCarts = async (maKhachHang) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/giohang/khachhang/${maKhachHang}`);
        carts.value = response.data.map(cart => {
            return {
                ...cart,
                isSelected: false
            }
        });
        const products = carts.value.filter(cart => cart.TrangThai !== 'Ngừng kinh doanh');
        carts.value = [...products];
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

const deleteCart = async (idGioHang) => {
    try {
        const response = await axios.delete(`http://localhost:3000/api/giohang/${idGioHang}`);
        showNotification("Xóa sản phẩm khỏi giỏ hàng thành công!", "success");
        setTimeout(() => {
            router.replace('/carts');
        }, 1000);
    } catch (error) {
        showNotification(error.response?.data?.message || "Xóa sản phẩm khỏi giỏ hàng thất bại!", "error");
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}

const updateCartItemQuantity = async (cart) => {
    try {
        await axios.put("http://localhost:3000/api/giohang", {
            maKhachHang: cart.MaKhachHang,
            maSanPham: cart.MaSanPham,
            soLuong: cart.SoLuong,
        });
    } catch (err) {
        console.log("Error update quantity: ", err);
    }
};

const decreaseQuantity = (cart) => {
    if (cart.SoLuong > 1) {
        cart.SoLuong--;
    }
    console.log(cart)
    updateCartItemQuantity(cart);
};

const increaseQuantity = (cart) => {
    cart.SoLuong++;
    updateCartItemQuantity(cart);
};

const deleteSelectedCarts = async () => {
    // Lọc các sản phẩm đã được chọn (isSelected = true) và lấy danh sách ID của chúng
    const selectedCartIds = carts.value.filter(cart => cart.isSelected).map(cart => cart.MaGioHang);
    if (selectedCartIds.length === 0) {
        showNotification("Vui lòng chọn ít nhất một sản phẩm để xóa!", "error");
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
        showNotification("Vui lòng chọn ít nhất một sản phẩm!", "error");
        setTimeout(() => (notification.value.message = ""), 3000);
        return;
    }

    try {
        const maKhachHang = selectedProducts[0].MaKhachHang; // Vì chắc cùng 1 người mua

        // Gửi danh sách mã sản phẩm cần kiểm tra
        const response = await axios.post(`http://localhost:3000/api/giohang/kiemtra/${maKhachHang}`, {
            sanPhams: selectedProducts.map(p => p.MaSanPham)
        });

        // Nếu không có lỗi, tiếp tục xử lý
        localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
        await deleteSelectedCarts();
        router.push("/orders");
    } catch (err) {
        const error = err.response?.data;
        if (error?.errors) {
            const messages = error.errors.map(e => e.message).join("\n");
            showNotification(messages, "error");
        } else {
            showNotification(error?.message || "Có lỗi xảy ra khi kiểm tra tồn kho!", "error");
        }

        setTimeout(() => (notification.value.message = ""), 3000);
    }
};

const totalPrice = computed(() => {
    return carts.value
        .filter(cart => cart.isSelected)
        .reduce((sum, cart) => {
            const price = cart.GiaSale > 0 ? cart.GiaSale : cart.DonGia;
            return sum + price * cart.SoLuong;
        }, 0);
});

function formatCurrency(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatCurrencySale(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

onMounted(() => {
    const maKhachHang = localStorage.getItem("MaKhachHang");
    fetchCarts(maKhachHang);
})
</script>

<template>
    <div
        class="bg-gradient-to-br from-[#0F1419] via-[#1A1D27] to-[#0F1419] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <h1 class="text-center text-white text-[28px] font-semibold mt-6 uppercase">Giỏ hàng của bạn</h1>
        <div v-if="carts.length > 0" class="relative mb-5 m-2 lg:mx-[200px] flex items-center flex-col flex-grow">
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
                            <img :src="`${cart.HinhAnh}`" class="w-[80px] h-auto" alt="">
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
                                cart.GiaSale > 0 ? formatCurrencySale(cart.GiaSale * cart.SoLuong) : formatCurrency(cart.DonGia * cart.SoLuong) }} <span class="text-[14px] relative -top-[2px] underline">đ</span></span></p>
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
                            formatCurrency(totalPrice) }} <span class="text-[14px] relative -top-[2px] underline">đ</span></span></p>
                        <button @click.prevent="goToOrderPage" type="submit"
                            class="bg-[#DB3F4C] px-5 py-2 rounded-md text-white self-end w-auto">Đặt
                            hàng</button>
                    </div>
                </div>
            </div>
        </div>
        <EmtyState v-else icon="fa-cart-shopping" title="Chưa có sản phẩm nào" message="Hiện tại chưa có sản phẩm nào được thêm vào danh sách.
                        Hãy quay lại sau để khám phá những sản phẩm mới nhất!" />
        <Footer />
        <BackToTop />
        <Chat />
        <ChatBot />
        <NotificationClient :message="notification.message" :type="notification.type" />
    </div>
</template>