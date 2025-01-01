<script setup>
import { ref, onMounted, watch } from 'vue';
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
const price = ref(0);
const quantity = ref(1);
const totalPrice = ref(0);
const fetchProduct = async (idProduct) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/sanpham/${idProduct}`);
        images.value = response.data.Images;
        nameProducts.value = response.data.TenSanPham;
        maSanPham.value = response.data.MaSanPham;
        price.value = Number(response.data.GiaBan);
    } catch (err) {
        console.log("error fetching:", err);
    }
}

watch([price, quantity], () => {
    totalPrice.value = price.value * quantity.value;
});
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

    if (formData.value.discountCode) {
        formData.value.discountCode = escapeHtml(formData.value.discountCode);
    }

    if (!formData.value.payment) {
        errors.value.payment = "Chọn phương thức thanh toán phù hợp."
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }

    try {
        const dataToSend = {
            TenKhachHang: tenKhachHang.value,
            Email: emailKhachHang.value,
            DienThoai: formData.value.phone,
            DiaChiNhanHang: formData.value.address,
            SanPhamDaMua: {
                TenSanPham: nameProducts.value,
                MaSanPham: maSanPham.value,
                Gia: price.value,
                SoLuong: quantity.value,
                HinhAnh: images.value[0]
            },
            MaGiamGia: formData.value.discountCode || 'Không sử dụng',
            HinhThucThanhToan: formData.value.payment,
            TongDon: totalPrice.value,
            NgayDatHang: new Date(),
            GhiChu: formData.value.description || 'Không có ghi chú'
        }
        console.log("Dữ liệu gửi đi:", dataToSend);

        const response = await axios.post('http://localhost:3000/api/donhang', dataToSend);
        const confirmUpdate = confirm("Vui lòng kiểm tra lại thông tin trước khi đặt hàng?");
        if (!confirmUpdate) return;
        notification.value = {
            message: "Đặt hàng thành công!",
            type: "success",
        };
        setTimeout(() => {
            router.push('/orders_history');
        }, 3000);
    } catch (error) {
        notification.value = {
            message: error.response?.data?.message || "Đặt hàng thất bại!",
            type: "error",
        };
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}

function formatCurrency(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

onMounted(() => {
    const idProduct = router.currentRoute.value.params.maSanPham;
    const soluong = router.currentRoute.value.query.quantity;
    quantity.value = Number(soluong) || 1;
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
                        <form @submit.prevent="addOrders" method="POST"
                            class="flex flex-col justify-end items-end gap-6">
                            <div class="flex flex-col lg:flex-row gap-8 w-full">
                                <div class="flex flex-col gap-4 w-full lg:w-1/2 text-white lg:border-r-2 lg:pr-10">
                                    <p class="text-white font-semibold text-[20px]">Thông tin mua hàng</p>
                                    <hr>
                                    <div class="w-full">
                                        <label for=""
                                            class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Họ
                                            tên</label>
                                        <input type="text" v-model="tenKhachHang" readonly
                                            placeholder="Nhập họ tên của bạn ..."
                                            class="w-full px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                    </div>
                                    <div class="w-full">
                                        <label for=""
                                            class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Email</label>
                                        <input type="text" v-model="emailKhachHang" readonly
                                            placeholder="test@gmail.com"
                                            class="w-full px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                    </div>
                                    <div class="w-full flex lg:flex-row flex-col gap-4">
                                        <div class="w-full lg:w-[60%]">
                                            <label for=""
                                                class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Địa
                                                chỉ nhận hàng</label>
                                            <input type="text" v-model="formData.address" placeholder="Nhập địa chỉ ..."
                                                class="w-full px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                            <p v-if="errors.address" class="text-red-500 text-sm mt-2">{{
                                                errors.address }}</p>
                                        </div>
                                        <div class="w-full lg:w-[40%]">
                                            <label for=""
                                                class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Số
                                                điện thoại</label>
                                            <input type="text" v-model="formData.phone" placeholder="079-xxx-xxxx"
                                                class="w-full px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                            <p v-if="errors.phone" class="text-red-500 text-sm mt-2">{{
                                                errors.phone }}</p>
                                        </div>
                                    </div>
                                    <div class="w-full">
                                        <label for=""
                                            class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Ghi
                                            chú</label>
                                        <textarea type="text" v-model="formData.description" placeholder="Ghi chú ..."
                                            class="w-full px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                        <p v-if="errors.description" class="text-red-500 text-sm mt-2">{{
                                            errors.description }}</p>
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
                                                giảm giá:</label>
                                            <input type="text" v-model="formData.discountCode"
                                                placeholder="Nhập mã giảm giá ..."
                                                class="w-full text-white px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                            <p v-if="errors.discountCode" class="text-red-500 text-sm mt-2">{{
                                                errors.discountCode }}</p>
                                        </div>
                                        <div class="w-full">
                                            <label for=""
                                                class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Hình
                                                thức thanh toán:
                                            </label>
                                            <select name="" id="" v-model="formData.payment"
                                                class="w-full text-white px-4 py-2 rounded-md cursor-pointer bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out">
                                                <option class="text-[#333] cursor-pointer" value="">Chọn phương thức
                                                    thanh toán</option>
                                                <option class="text-[#333] cursor-pointer"
                                                    value="Thanh toán khi nhận hàng">Thanh toán khi nhận hàng</option>
                                                <option class="text-[#333] cursor-pointer"
                                                    value="Thanh toán qua ví Paypal">Thanh toán qua ví Paypal</option>
                                            </select>
                                            <p v-if="errors.payment" class="text-red-500 text-sm mt-2">{{
                                                errors.payment }}</p>
                                        </div>
                                        <hr>
                                        <p class="text-white text-[16px] text-end">Tổng cộng: <span
                                                class="text-[#FFD700]"> {{ formatCurrency(totalPrice) }} VNĐ</span></p>
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
                        :class="notification.type === 'success' ? 'text-[#40E0D0]' : 'text-[#DB3F4C]'">{{ notification.message }}</p>
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