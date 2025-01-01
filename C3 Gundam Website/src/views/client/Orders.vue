<script setup>
import { ref, onMounted } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const errors = ref({});
const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};
const formData = ref({
    address: '',
    phone: '',
    description: '',
    discountCode: '',
    payment: '',
});

const notification = ref({
    message: '',
    type: ''
});

const tenKhachHang = ref(localStorage.getItem("TenKhachHang"));
const emailKhachHang = ref(localStorage.getItem("Email"));

const images = ref([]);
const nameProducts = ref('');
const maSanPham = ref('');
const price = ref('');
const quantity = ref('');
const fetchProduct = async (idProduct) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/sanpham/${idProduct}`);
        images.value = response.data.Images;
        nameProducts.value = response.data.TenSanPham;
        maSanPham.value = response.data.MaSanPham;
        price.value = response.data.GiaBan;
    } catch (err) {
        console.log("error fetching:", err);
    }
}

const addOrders = async () => {
    errors.value = {};
    const phoneRegex = /^0[1-9][0-9]{8}$|^0[1-9]{1}[0-9]{9}$|^(0[1-9]{1}[0-9]{1})( ?|-)?(\\(0[1-9]{1}[0-9]{1}\\))?( ?|-)?[0-9]{3} ?[0-9]{3}$/  

    if (!formData.value.address) {
        errors.value.address = "Địa chỉ không được trống.";
    } else {
        formData.value.address = escapeHtml(formData.value.address);
    }

    if (!formData.value.phone) {
        errors.value.phone = "Điện thoại không được để trống.";
    } else if (!phoneRegex.test(formData.value.phone)) {
        errors.value.phone = "Điện thoại không hợp lệ.";
    } else {
        formData.value.phone = escapeHtml(formData.value.phone);
    }

    if (formData.value.description) {  
        formData.value.description = escapeHtml(formData.value.description);  
    } 
}

function formatCurrency(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

onMounted(() => {
    const idProduct = router.currentRoute.value.params.maSanPham;
    const soluong = router.currentRoute.value.query.quantity;
    quantity.value = soluong;
    console.log(soluong);
    console.log(idProduct);
    fetchProduct(idProduct);
})
</script>


<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth">
        <Header />
        <div class="relative my-5 m-2 lg:mx-[200px] flex justify-center items-center">
            <div class="w-full m-4">
                <div
                    class="bg-[#242424] overflow-hidden px-6 py-3 rounded [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                    <div class="flex flex-col gap-2 justify-center">
                        <form action="" class="flex flex-col justify-end items-end gap-6">
                            <div class="flex flex-col lg:flex-row gap-8 w-full">
                                <div class="flex flex-col gap-4 w-full lg:w-1/2 text-white lg:border-r-2 lg:pr-10">
                                    <p class="text-white font-semibold text-[20px]">Thông tin mua hàng</p>
                                    <hr>
                                    <div class="w-full">
                                        <label for=""
                                            class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Họ
                                            tên</label>
                                        <input type="text" v-model="tenKhachHang" readonly placeholder="Nhập họ tên của bạn ..."
                                            class="w-full px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                    </div>
                                    <div class="w-full">
                                        <label for=""
                                            class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Email</label>
                                        <input type="text" v-model="emailKhachHang" readonly placeholder="test@gmail.com"
                                            class="w-full px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                    </div>
                                    <div class="w-full flex lg:flex-row flex-col gap-4">
                                        <div class="w-full lg:w-[60%]">
                                            <label for=""
                                                class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Địa
                                                chỉ nhận hàng</label>
                                            <input type="text" placeholder="Nhập địa chỉ ..."
                                                class="w-full px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                        </div>
                                        <div class="w-full lg:w-[40%]">
                                            <label for=""
                                                class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Số
                                                điện thoại</label>
                                            <input type="text" placeholder="079-xxx-xxxx"
                                                class="w-full px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                        </div>
                                    </div>
                                    <div class="w-full">
                                        <label for=""
                                            class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Ghi
                                            chú</label>
                                        <textarea type="text" placeholder="Ghi chú ..."
                                            class="w-full px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                    </div>
                                </div>
                                <div class="flex flex-col gap-4 w-full lg:w-1/2">
                                    <p class="text-white font-semibold text-[20px]">Đơn hàng</p>
                                    <hr>
                                    <div class="flex flex-col gap-4 overflow-hidden">
                                        <div class="overflow-y-auto max-h-[200px] flex flex-col gap-4">
                                            <div class="flex gap-4 items-start">
                                                <img :src="`/src/assets/img/${images[0]}`"
                                                    class="w-[50px] lg:w-[80px] border-2" alt="">
                                                <div class="overflow-hidden">
                                                    <div
                                                        class="w-52 lg:w-96 whitespace-nowrap text-ellipsis overflow-hidden">
                                                        <p
                                                            class="text-white text-[14px] overflow-hidden text-ellipsis whitespace-nowrap">
                                                            {{ nameProducts }}</p>
                                                    </div>
                                                    <p class="text-white text-[14px]">Mã sản phẩm: <span
                                                            class="text-[#FFD700]">{{ maSanPham }}</span></p>

                                                    <p class="text-white text-[14px]">Giá: <span
                                                            class="text-[#FFD700]">{{ formatCurrency(price) }}
                                                            VNĐ</span></p>
                                                    <p class="text-white text-[14px]">Số lượng: <span
                                                            class="text-[#FFD700]">{{ quantity }}</span></p>
                                                </div>
                                            </div>
                                        </div>
                                        <hr>
                                        <div class="w-full">
                                            <label for=""
                                                class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Mã
                                                giảm giá</label>
                                            <input type="text" placeholder="Nhập mã giảm giá ..."
                                                class="w-full text-white px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                        </div>
                                        <div class="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                                            <label for="" class="font-semibold text-white mr-4">Hình thức thanh toán:
                                            </label>
                                            <select name="" id=""
                                                class="bg-transparent border-2 px-8 cursor-pointer py-2 text-white rounded-md">
                                                <option class="text-[#333] cursor-pointer"
                                                    value="Thanh toán khi nhận hàng">Thanh toán khi nhận hàng</option>
                                                <option class="text-[#333] cursor-pointer"
                                                    value="Thanh toán qua ví Paypal">Thanh toán qua ví Paypal</option>
                                            </select>
                                        </div>
                                        <hr>
                                        <p class="text-white text-[16px] text-end">Tổng cộng: <span
                                                class="text-[#FFD700]">2.350.000 VNĐ</span></p>
                                        <button type="submit"
                                            class="px-6 py-3 bg-[#DB3F4C] rounded-md text-white font-medium self-end w-auto">Đặt
                                            hàng</button>
                                    </div>
                                </div>
                            </div>
                            <!-- <button type="submit" class="px-5 py-3 bg-[#DB3F4C] rounded-md text-white font-medium">Đặt hàng</button> -->
                        </form>
                    </div>
                </div>
            </div>
            <transition name="slide-fade" mode="out-in">
                <div v-if="notification.message" :class="['fixed top-4 left-1/2 right-10 transform p-4 bg-white shadow-lg border-t-4 rounded z-10 flex items-center space-x-2 w-full max-w-sm', {
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
        <Footer />
        <BackToTop />
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