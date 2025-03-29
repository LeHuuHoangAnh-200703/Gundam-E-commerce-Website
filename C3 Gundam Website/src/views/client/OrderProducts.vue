<script setup>
import { ref, onMounted, watch } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import NotificationClient from '@/components/Notification/NotificationClient.vue';
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
    shippingMethod: "",
});

const selectedProducts = ref([]);

const maKhachHang = localStorage.getItem("MaKhachHang");
const nameCustomer = ref('');
const emailCustomer = ref('');
const listAddress = ref([]);
const listDiscountCodes = ref([]);
const totalPrice = ref(0);
const isPayPalReady = ref(false); // Cờ để xác định trạng thái nút PayPal

const notification = ref({
    message: '',
    type: ''
});

const shippingFee = [
    { fee: 'Giao tiêu chuẩn (20.000đ)' },
    { fee: 'Giao nhanh (30.000đ)' },
    { fee: 'Ship hỏa tốc (50.000đ)' },
]

const showNotification = (msg, type) => {
    notification.value = { message: msg, type: type };
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
};

const fetchCustomer = async (idKhachHang) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/khachhang/${idKhachHang}`);
        nameCustomer.value = response.data.TenKhachHang;
        emailCustomer.value = response.data.SoDienThoai;
        listAddress.value = response.data.DanhSachDiaChi;
        listDiscountCodes.value = response.data.DanhSachMaGiamGia;
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}
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

    let totalProductPrice = selectedProducts.value.reduce((sum, product) => {
        return sum + product.DonGia * product.SoLuong;
    }, 0);

    if (totalProductPrice < 2000000 && !formData.value.shippingMethod) {
        errors.value.shippingMethod = "Vui lòng chọn hình thức giao hàng.";
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

    if (totalPrice.value >= 2000000) {
        formData.value.shippingMethod = "Miễn phí giao hàng";
    }

    try {
        const sanPhamDaMua = selectedProducts.value.map(product => ({
            TenSanPham: product.TenSanPham,
            MaSanPham: product.MaSanPham,
            Gia: product.DonGia,
            SoLuong: product.SoLuong,
            LoaiSanPham: product.LoaiSanPham,
            HinhAnh: product.HinhAnh,
        }));

        const dataToSend = {
            MaKhachHang: maKhachHang,
            DiaChiNhanHang: formData.value.address,
            SanPhamDaMua: sanPhamDaMua,
            IdMaGiamGia: formData.value.discountCode,
            HinhThucThanhToan: formData.value.payment,
            TongDon: totalPrice.value,
            NgayDatHang: new Date(),
            GhiChu: formData.value.description || 'Không có ghi chú',
            TrangThaiThanhToan: trangThaiThanhToan,
            HinhThucVanChuyen: formData.value.shippingMethod
        }

        const response = await axios.post('http://localhost:3000/api/donhang', dataToSend);
        showNotification("Đặt hàng thành công!", "success");
        setTimeout(() => {
            router.push('/orders_history');
        }, 3000);
        localStorage.removeItem("selectedProducts");
    } catch (error) {
        showNotification(error.response?.data?.message || "Đặt hàng thất bại!", "error");
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
                    showNotification("Thanh toán qua PayPal và đặt hàng thành công!", "success");
                }
            } catch (error) {
                console.error('Lỗi khi xử lý đơn hàng sau thanh toán PayPal:', error);
                showNotification("Thanh toán thành công nhưng không thể lưu đơn hàng!", "error");
            }
            setTimeout(() => {
                notification.value.message = '';
            }, 3000);
        },
        onError: (err) => {
            console.error('Lỗi khi thanh toán PayPal:', err);
            showNotification("Đã xảy ra lỗi khi thanh toán qua PayPal!", "error");
        },
    }).render('#paypal-button-container');
};

function formatCurrency(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

onMounted(() => {
    const data = localStorage.getItem('selectedProducts');
    if (data) {
        selectedProducts.value = JSON.parse(data);
    }
    calculateTotalPrice();
    fetchCustomer(maKhachHang);
});

const calculateTotalPrice = () => {
    let costShip = 0;
    let totalProductPrice = selectedProducts.value.reduce((sum, product) => {
        return sum + product.DonGia * product.SoLuong;
    }, 0);

    if (totalProductPrice >= 2000000) {
        costShip = 0;
        formData.value.shippingMethod = "Miễn phí giao hàng";
    } else {
        if (formData.value.shippingMethod === "Giao tiêu chuẩn (20.000đ)") {
            costShip = 20000;
        } else if (formData.value.shippingMethod === "Giao nhanh (30.000đ)") {
            costShip = 30000;
        } else if (formData.value.shippingMethod === "Ship hỏa tốc (50.000đ)") {
            costShip = 50000;
        }
    }

    totalPrice.value = totalProductPrice + costShip;
};

watch(() => formData.value.shippingMethod, () => {
    calculateTotalPrice();
});

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
        <div class="relative my-5 m-2 lg:mx-[200px] flex justify-center items-center flex-grow">
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
                                            class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Người
                                            đặt hàng</label>
                                        <input type="text" v-model="nameCustomer" readonly
                                            placeholder="Nhập họ tên của bạn ..."
                                            class="w-full px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                    </div>
                                    <div class="w-full">
                                        <label for=""
                                            class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Email</label>
                                        <input type="text" v-model="emailCustomer" readonly placeholder="079xxxxxxx"
                                            class="w-full px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                    </div>
                                    <div class="w-full">
                                        <label for=""
                                            class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Địa chỉ
                                            nhận hàng:
                                        </label>
                                        <select name="" id="" v-model="formData.address"
                                            class="w-full text-white px-4 py-2 rounded-md cursor-pointer bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out">
                                            <option class="text-[#333] cursor-pointer" value="">Chọn địa chỉ nhận hàng
                                            </option>
                                            <option v-for="(address, index) in listAddress" :key="index"
                                                :value="address" class="text-[#333] cursor-pointer">
                                                {{ address.TenNguoiNhan }} / {{ address.DienThoai }} / {{ address.DiaChi
                                                }}</option>
                                        </select>
                                        <p v-if="errors.address" class="text-red-500 text-sm mt-2">{{
                                            errors.address }}</p>
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
                                            <div class="flex gap-4 items-start"
                                                v-for="(product, index) in selectedProducts" :key="index">
                                                <img :src="`${product.HinhAnh}`" class="w-[50px] lg:w-[80px] border-2"
                                                    alt="">
                                                <div class="overflow-hidden">
                                                    <div
                                                        class="w-52 lg:w-96 whitespace-nowrap text-ellipsis overflow-hidden">
                                                        <p
                                                            class="text-white text-[14px] overflow-hidden text-ellipsis whitespace-nowrap">
                                                            {{ product.TenSanPham }}</p>
                                                    </div>
                                                    <p class="text-white text-[14px]">Mã sản phẩm: <span
                                                            class="text-[#FFD700]">{{ product.MaSanPham }}</span></p>

                                                    <p class="text-white text-[14px]">Giá: <span
                                                            class="text-[#FFD700]">{{ formatCurrency(product.DonGia) }}
                                                            VNĐ</span></p>
                                                    <p class="text-white text-[14px]">Số lượng: <span
                                                            class="text-[#FFD700]">{{ product.SoLuong }}</span></p>
                                                </div>
                                            </div>
                                        </div>
                                        <hr>
                                        <div class="w-full">
                                            <label for=""
                                                class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">Mã
                                                giảm giá:
                                            </label>
                                            <select name="" id="" v-model="formData.discountCode"
                                                class="w-full text-white px-4 py-2 rounded-md cursor-pointer bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out">
                                                <option class="text-[#333] cursor-pointer" value="">
                                                    Danh sách mã giảm giá của bạn
                                                </option>
                                                <option
                                                    v-for="(discountCode, index) in listDiscountCodes.filter(dc => new Date(dc.NgayHetHan) >= new Date())"
                                                    :key="index" :value="discountCode.IdMaGiamGia"
                                                    class="text-[#333] cursor-pointer">Id Mã: {{
                                                        discountCode.IdMaGiamGia }}
                                                    / Tên mã: {{ discountCode.TenMaGiamGia }} / Giảm:
                                                    {{
                                                        discountCode.GiamTien
                                                            ? `${formatCurrency(discountCode.GiamTien)} VNĐ`
                                                            : `${discountCode.GiamPhanTram}%`
                                                    }}
                                                </option>
                                            </select>
                                            <p v-if="errors.discountCode" class="text-red-500 text-sm mt-2">
                                                {{ errors.discountCode }}
                                            </p>
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
                                                    value="Thanh toán qua Paypal">Thanh toán qua Paypal</option>
                                            </select>
                                            <p v-if="errors.payment" class="text-red-500 text-sm mt-2">{{
                                                errors.payment }}</p>
                                        </div>
                                        <div class="w-full">
                                            <label class="block text-white font-medium mb-2 text-[14px] md:text-[16px]">
                                                Hình thức giao hàng:
                                            </label>
                                            <div v-if="selectedProducts.reduce((sum, product) => sum + product.DonGia * product.SoLuong, 0) >= 2000000"
                                                class="p-3 rounded-lg border border-gray-500 bg-gray-800">
                                                <span class="text-white">Miễn phí giao hàng cho đơn hàng trên 2.000.000
                                                    VNĐ</span>
                                            </div>
                                            <div v-else class="space-y-2">
                                                <label v-for="ship in shippingFee" :key="ship"
                                                    class="flex items-center space-x-2 cursor-pointer p-3 rounded-lg border border-gray-500 bg-gray-800 hover:bg-gray-700 transition">
                                                    <input type="radio" name="shipping"
                                                        v-model="formData.shippingMethod" :value="ship.fee"
                                                        class="hidden" />
                                                    <div :class="{
                                                        'w-5 h-5 rounded-full border-2 flex items-center justify-center border-white': true,
                                                        'bg-blue-500 border-blue-500':
                                                            formData.shippingMethod === ship.fee,
                                                    }">
                                                        <div v-if="formData.shippingMethod === ship.fee"
                                                            class="w-2.5 h-2.5 bg-white rounded-full"></div>
                                                    </div>
                                                    <span class="text-white">{{ ship.fee }}</span>
                                                </label>
                                            </div>
                                            <p v-if="errors.shippingMethod" class="text-red-500 text-sm mt-2">
                                                {{ errors.shippingMethod }}
                                            </p>
                                        </div>
                                        <hr>
                                        <p class="text-white text-[16px] text-end">Tổng cộng: <span
                                                class="text-[#FFD700]"> {{ formatCurrency(totalPrice) }} VNĐ</span></p>
                                        <button type="submit"
                                            :class="(formData.payment === 'Thanh toán khi nhận hàng' || formData.payment === '') ? 'block' : 'hidden'"
                                            class="px-6 py-3 bg-[#DB3F4C] rounded-md text-white font-medium self-end w-full">Đặt
                                            hàng</button>
                                        <div :class="isPayPalReady ? 'block' : 'hidden'" id="paypal-button-container">
                                        </div>
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
        <NotificationClient :message="notification.message" :type="notification.type" />
    </div>
</template>