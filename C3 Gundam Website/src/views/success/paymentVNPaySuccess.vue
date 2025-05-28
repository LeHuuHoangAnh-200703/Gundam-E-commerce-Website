<script setup>
import { onMounted, ref, computed } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import NotificationClient from "@/components/Notification/NotificationClient.vue";
import axios from "axios";
import { useRouter } from 'vue-router';

const router = useRouter();
const maDonHang = ref('');
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

onMounted(async () => {
    // Xử lý query params từ VNPAY
    const urlParams = new URLSearchParams(window.location.search);
    const responseCode = urlParams.get('vnp_ResponseCode');
    const transactionNo = urlParams.get('vnp_TransactionNo');
    maDonHang.value = urlParams.get('vnp_TxnRef');
    if (responseCode) {
        try {
            // Gọi API backend để xử lý kết quả thanh toán
            await axios.get('http://localhost:3000/api/thanhtoanvnp/vnpay-return', {
                params: Object.fromEntries(urlParams),
            });
            if (responseCode === '00') {
                showNotification("Thanh toán thành công! Kiểm tra đơn hàng nhé.", 'success');
            } else {
                showNotification('Thanh toán thất bại!', 'error');
            }
        } catch (error) {
            console.error('Error processing VNPAY return:', error);
            showNotification('Lỗi xử lý thanh toán!', 'error');
        }
    }
})
</script>

<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="relative mb-5 m-2 lg:mx-[200px] flex flex-grow gap-6">
            <div class="w-full overflow-y-auto flex items-center justify-center flex-col gap-6 bg-white rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-[70px] h-[70px] text-[#008B8B]" viewBox="0 0 24 24">
                    <path fill="currentColor"
                        d="M12 4a8 8 0 1 0 0 16a8 8 0 0 0 0-16zM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12zm14.664-3.247a1 1 0 0 1 .083 1.411l-5.333 6a1 1 0 0 1-1.495 0l-2.666-3a1 1 0 0 1 1.494-1.328l1.92 2.159l4.586-5.16a1 1 0 0 1 1.411-.082z" />
                </svg>
                <p class="text-[30px] uppercase text-[#008B8B] font-semibold">Thanh toán thành công</p>
                <p class="text-[#333] text-[25px] uppercase font-medium flex gap-2">Quý khách đã thanh toán thành công với <img
                        src="../../assets/img/vnpay.png" class="w-8 h-8" alt="" />
                    <span class="font-bold font-bungee">VN<span class="text-[#DC143C]">Pay</span></span>
                </p>
                <p class="text-[20px]">Mã đơn: {{ maDonHang }}</p>
                <router-link to="/orders_history" class="text-white bg-[#4169E1] p-4 rounded-md font-medium text-[18px]">
                    Kiểm tra đơn hàng
                </router-link>
            </div>
        </div>
        <Footer />
        <BackToTop />
        <NotificationClient :message="notification.message" :type="notification.type" />
    </div>
</template>

<style scoped></style>