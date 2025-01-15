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
    description: '',
    discountCode: '',
    payment: '',
});

const notification = ref({
    message: '',
    type: ''
});
const maKhachHang = localStorage.getItem("MaKhachHang");
const nameCustomer = ref('');
const emailCustomer = ref('');
const listAddress = ref([]);
const images = ref([]);
const nameProducts = ref('');
const maSanPham = ref('');
const type = ref('');
const price = ref(0);
const quantity = ref(1);
const totalPrice = ref(0);
const isPayPalReady = ref(false); // Cờ để xác định trạng thái nút PayPal
const fetchProduct = async (idProduct) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/sanpham/${idProduct}`);
        images.value = response.data.Images;
        nameProducts.value = response.data.TenSanPham;
        maSanPham.value = response.data.MaSanPham;
        price.value = Number(response.data.GiaBan);
        type.value = response.data.LoaiSanPham;
    } catch (err) {
        console.log("error fetching:", err);
    }
}

const fetchCustomer = async (idKhachHang) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/khachhang/${idKhachHang}`);
        nameCustomer.value = response.data.TenKhachHang;
        emailCustomer.value = response.data.Email;
        listAddress.value = response.data.DanhSachDiaChi;
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

watch([price, quantity], () => {
    totalPrice.value = price.value * quantity.value;
});

const addOrders = async () => {
    errors.value = {};

    if (!formData.value.address) {
        errors.value.address = "Nếu chưa có địa chỉ vui lòng tạo địa chỉ.";
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

    if (formData.value.payment !== 'Thanh toán qua Paypal') {
        const confirmUpdate = confirm("Vui lòng kiểm tra lại thông tin trước khi đặt hàng?");
        if (!confirmUpdate) return;
    }

    let trangThaiThanhToan = 'Khi nhận được hàng';
    if (formData.value.payment === 'Thanh toán qua Paypal') {
        trangThaiThanhToan = 'Đã thanh toán qua PayPal';
    }

    console.log(formData.value.address)
    try {
        const dataToSend = {
            MaKhachHang: maKhachHang,
            TenKhachHang: nameCustomer.value,
            Email: emailCustomer.value,
            SanPhamDaMua: {
                TenSanPham: nameProducts.value,
                MaSanPham: maSanPham.value,
                Gia: price.value,
                SoLuong: quantity.value,
                LoaiSanPham: type.value,
                HinhAnh: images.value[0]
            },
            DiaChiNhanHang: formData.value.address,
            MaGiamGia: formData.value.discountCode,
            HinhThucThanhToan: formData.value.payment,
            TongDon: totalPrice.value,
            NgayDatHang: new Date(),
            GhiChu: formData.value.description || 'Không có ghi chú',
            TrangThaiThanhToan: trangThaiThanhToan,
        }
        console.log("Dữ liệu gửi đi:", dataToSend);

        const response = await axios.post('http://localhost:3000/api/donhang', dataToSend);
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

const initializePayPalButton = () => {
    if (typeof paypal === 'undefined') {
        console.error('PayPal SDK chưa được tải.');
        return;
    }
    const paypalButtonsContainer = document.getElementById('paypal-button-container');
    if (paypalButtonsContainer) {
        paypalButtonsContainer.innerHTML = '';  // Xóa nội dung cũ
    }
    const vndToUsdRate = 24000; // Tỷ giá cố định (Ví dụ: 1 USD = 24,000 VND)
    paypal.Buttons({
        createOrder: (data, actions) => {
            const usdPrice = (totalPrice.value / vndToUsdRate).toFixed(2); // Chuyển đổi VND sang USD
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: usdPrice, // Giá trị đã chuyển đổi
                        currency_code: 'USD' // Đơn vị tiền tệ là USD
                    },
                }],
            });
        },
        onApprove: async (data, actions) => {
            try {
                const order = await actions.order.capture();
                await addOrders();

                if (notification.value.type === 'success') {
                    notification.value = {
                        message: 'Thanh toán qua PayPal và đặt hàng thành công!',
                        type: 'success',
                    };
                }
            } catch (error) {
                console.error('Lỗi khi xử lý đơn hàng sau thanh toán PayPal:', error);
                notification.value = {
                    message: 'Thanh toán thành công nhưng không thể lưu đơn hàng!',
                    type: 'error',
                };
            }
            setTimeout(() => {
                notification.value.message = '';
            }, 3000);
        },
        onError: (err) => {
            console.error('Lỗi khi thanh toán PayPal:', err);
            notification.value = {
                message: 'Đã xảy ra lỗi khi thanh toán qua PayPal!',
                type: 'error',
            };
        },
    }).render('#paypal-button-container');
};

function formatCurrency(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

onMounted(() => {
    const idProduct = router.currentRoute.value.params.maSanPham;
    const soluong = router.currentRoute.value.query.quantity;
    quantity.value = Number(soluong) || 1;
    fetchProduct(idProduct);
    fetchCustomer(maKhachHang);
})

watch(() => formData.value.payment, (newPayment) => {
    if (newPayment === 'Thanh toán qua Paypal') {
        isPayPalReady.value = true;  // Hiển thị nút PayPal
        initializePayPalButton();
    } else {
        isPayPalReady.value = false;  // Ẩn nút PayPal
    }
});
</script>

<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="relative mb-5 lg:mx-[200px] flex justify-center items-center flex-grow">
            <div class="w-full m-4">
                <h1 class="font-bold text-white text-[20px] my-4">Đoạn chat <i class="fa-solid fa-comments"></i></h1>
                <div
                    class="bg-[#242424] flex flex-col gap-3 overflow-hidden px-6 py-3 rounded [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                    <div class="flex gap-3 items-center text-white">
                        <img src="../../assets/img/avatar.jpg"
                            class="w-[50px] h-[50px] rounded-full [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]"
                            alt="">
                        <div class="flex flex-col">
                            <p class="font-semibold text-[18px]">C3 GUNDAM STORE</p>
                            <p class="text-[12px]">Đang hoạt động</p>
                        </div>
                    </div>
                    <hr>
                    <div class="flex flex-col gap-4 flex-grow overflow-y-auto max-h-[calc(100vh-53vh)]">
                        <div class="bg-[#4169E1] p-2 rounded-t-lg rounded-l-lg self-end">
                            <p class="text-white text-[14px] inline-block">Xin chào bạn! C3 Gundam có thể giúp
                                gì cho bạn?</p>
                        </div>
                        <div class="flex gap-2 items-end">
                            <img src="../../assets/img/avatar.jpg" class="w-[35px] h-[35px] rounded-full" alt="">
                            <div class="bg-gray-200 p-2 rounded-md self-end">
                                <p class="text-[#333] text-[14px] inline-block">Xin chào bạn! C3 Gundam có
                                    thể giúp gì cho bạn?</p>
                            </div>
                        </div>
                        <div class="bg-[#4169E1] p-2 rounded-t-lg rounded-l-lg self-end">
                            <p class="text-white text-[14px] inline-block">Xin chào bạn! C3 Gundam có thể giúp
                                gì cho bạn?</p>
                        </div>
                        <div class="flex gap-2 items-end">
                            <img src="../../assets/img/avatar.jpg" class="w-[35px] h-[35px] rounded-full" alt="">
                            <div class="bg-gray-200 p-2 rounded-md self-end">
                                <p class="text-[#333] text-[14px] inline-block">Xin chào bạn! C3 Gundam có
                                    thể giúp gì cho bạn?</p>
                            </div>
                        </div>
                        <div class="flex gap-2 items-end">
                            <img src="../../assets/img/avatar.jpg" class="w-[35px] h-[35px] rounded-full" alt="">
                            <div class="bg-gray-200 p-2 rounded-md self-end">
                                <p class="text-[#333] text-[14px] inline-block">Xin chào bạn! C3 Gundam có
                                    thể giúp gì cho bạn?</p>
                            </div>
                        </div>
                        <div class="flex gap-2 items-end">
                            <img src="../../assets/img/avatar.jpg" class="w-[35px] h-[35px] rounded-full" alt="">
                            <div class="bg-gray-200 p-2 rounded-md self-end">
                                <p class="text-[#333] text-[14px] inline-block">Xin chào bạn! C3 Gundam có
                                    thể giúp gì cho bạn?</p>
                            </div>
                        </div>
                    </div>
                    <hr>
                    <div class="flex justify-between w-full gap-4 items-center">
                        <input type="text"
                            class="items-center w-full h-full p-3 bg-gray-200 text-[12px] shadow font-semibold tracking-wider text-black rounded-md focus:outline-none"
                            placeholder="Tin nhắn của bạn ...">
                        <button class="flex justify-center items-center bg-[#4169E1] px-5 py-4 text-white rounded-md"><i
                                class="fa-solid fa-arrow-up text-[16px] font-bold"></i></button>
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