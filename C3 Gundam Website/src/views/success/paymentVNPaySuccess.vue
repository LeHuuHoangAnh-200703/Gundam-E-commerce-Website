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
    <div class="bg-gradient-to-br from-[#0F1419] via-[#1A1D27] to-[#2D3748] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <div class="absolute inset-0 opacity-10">
            <div class="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-[#008B8B] to-[#20B2AA] rounded-full blur-3xl animate-pulse"></div>
            <div class="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-[#4169E1] to-[#6495ED] rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div class="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-[#32CD32] to-[#00FF7F] rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        <Header />
        <div class="relative mb-5 m-2 lg:mx-[200px] flex flex-grow gap-6">
            <div class="w-full overflow-y-auto flex items-center justify-center flex-col gap-8 p-8 lg:p-12">
                <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-12 max-w-4xl w-full mx-auto relative overflow-hidden transform hover:scale-105 transition-all duration-500">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#008B8B]/10 to-transparent rounded-full -mr-16 -mt-16"></div>
                    <div class="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#4169E1]/10 to-transparent rounded-full -ml-12 -mb-12"></div>
                    <div class="relative flex justify-center mb-6">
                        <div class="relative">
                            <div class="absolute inset-0 w-24 h-24 border-4 border-[#008B8B]/30 rounded-full animate-spin"></div>
                            <div class="absolute inset-2 w-20 h-20 border-4 border-[#20B2AA]/20 rounded-full animate-spin reverse"></div>
                            <div class="relative z-10 w-24 h-24 bg-gradient-to-br from-[#008B8B] to-[#20B2AA] rounded-full flex items-center justify-center shadow-xl animate-bounce">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-white" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M12 4a8 8 0 1 0 0 16a8 8 0 0 0 0-16zM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12zm14.664-3.247a1 1 0 0 1 .083 1.411l-5.333 6a1 1 0 0 1-1.495 0l-2.666-3a1 1 0 0 1 1.494-1.328l1.92 2.159l4.586-5.16a1 1 0 0 1 1.411-.082z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <h1 class="text-3xl lg:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-[#008B8B] to-[#20B2AA] bg-clip-text text-transparent animate-fadeInUp">
                        THANH TOÁN THÀNH CÔNG
                    </h1>
                    <div class="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] rounded-2xl p-6 mb-6 border border-gray-200/50">
                        <div class="text-[#333] text-xl font-medium flex items-center justify-center gap-3 flex-wrap">
                            <span>Quý khách đã thanh toán thành công với</span>
                            <div class="flex items-center gap-2 bg-white rounded-lg px-3 py-1 shadow-sm">
                                <img src="../../assets/img/vnpay.png" class="w-8 h-8" alt="VNPay" />
                                <span class="font-bold font-bungee text-lg">VN<span class="text-[#DC143C]">Pay</span></span>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gradient-to-r from-[#fff] to-[#f8f9fa] rounded-xl p-4 mb-8 border-l-4 border-[#008B8B] flex gap-1 items-center">
                        <p class="text-gray-600 text-sm font-semibold">Mã đơn hàng: </p>
                        <p class="text-xl font-bold text-[#333] font-mono">{{ maDonHang }}</p>
                    </div>
                    <div class="flex justify-center">
                        <router-link to="/orders_history" 
                            class="relative group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-[#4169E1] to-[#6495ED] rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
                            <div class="absolute inset-0 bg-gradient-to-r from-[#6495ED] to-[#4169E1] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span class="relative z-10 flex items-center gap-2">
                                Kiểm tra đơn hàng
                            </span>
                            <div class="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
        
        <Footer />
        <BackToTop />
        <NotificationClient :message="notification.message" :type="notification.type" />
    </div>
</template>

<style scoped>
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes reverse {
    from {
        transform: rotate(360deg);
    }
    to {
        transform: rotate(0deg);
    }
}

.animate-fadeInUp {
    animation: fadeInUp 0.8s ease-out;
}

.animate-spin.reverse {
    animation: reverse 3s linear infinite;
}

/* Glassmorphism effect */
.backdrop-blur-sm {
    backdrop-filter: blur(8px);
}

/* Hover effects */
.group:hover .group-hover\:translate-x-full {
    transform: translateX(100%);
}

.group:hover .group-hover\:opacity-100 {
    opacity: 1;
}
</style>