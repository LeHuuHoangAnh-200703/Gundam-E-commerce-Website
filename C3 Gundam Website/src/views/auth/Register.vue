<script setup>
import { ref } from "vue";
import axios from 'axios';
import NotificationClient from "@/components/Notification/NotificationClient.vue";
import { useRouter } from 'vue-router';

// --- CẤU HÌNH URL ĐỘNG ---
// Tự động nhận diện môi trường: Netlify (Production) hoặc Localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// -------------------------

// Hàm mã hóa đầu vào
const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const errors = ref({});
const router = useRouter();
const formData = ref({
    nameCustomer: '',
    emailCustomer: '',
    password: '',
    confirmPassword: '',
});

const otp = ref(""); // Biến lưu mã OTP người dùng nhập
const isOtpSent = ref(false); // Kiểm soát trạng thái gửi OTP

// Biến kiểm soát ẩn/hiện mật khẩu
const showPassword = ref({
    password: false,
    confirmPassword: false
});

// Hàm toggle ẩn/hiện mật khẩu
const togglePassword = (field) => {
    showPassword.value[field] = !showPassword.value[field];
};

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

const sendOTP = async () => {
    errors.value = {};
    const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

    if (!formData.value.nameCustomer) {
        errors.value.nameCustomer = "Tên không để trống khi đăng ký!";
    } else {
        formData.value.nameCustomer = escapeHtml(formData.value.nameCustomer);
    }

    if (!formData.value.emailCustomer) {
        errors.value.emailCustomer = "Email không để trống khi đăng ký!";
    } else if (!emailRegex.test(formData.value.emailCustomer)) {
        errors.value.emailCustomer = "Email không hợp lệ!";
    } else {
        formData.value.emailCustomer = escapeHtml(formData.value.emailCustomer);
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }

    try {
        // SỬA 1: Dùng API_URL
        const response = await axios.post(`${API_URL}/api/khachhang/send-otp`, {
            email: formData.value.emailCustomer
        });
        showNotification(response.data.message, "success");
        isOtpSent.value = true;
    } catch (error) {
        showNotification(
            error.response?.data?.error || "Lỗi khi gửi OTP!",
            "error"
        );
    }
}

const verifyOtpAndRegister = async () => {
    errors.value = {};
    const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

    if (!formData.value.nameCustomer) {
        errors.value.nameCustomer = "Tên không để trống khi đăng ký!";
    } else {
        formData.value.nameCustomer = escapeHtml(formData.value.nameCustomer);
    }

    if (!formData.value.emailCustomer) {
        errors.value.emailCustomer = "Email không để trống khi đăng ký!";
    } else if (!emailRegex.test(formData.value.emailCustomer)) {
        errors.value.emailCustomer = "Email không hợp lệ!";
    } else {
        formData.value.emailCustomer = escapeHtml(formData.value.emailCustomer);
    }

    if (!formData.value.password) {
        errors.value.password = "Mật khẩu không để trống khi đăng ký!";
    } else if (formData.value.password.length < 6) {
        errors.value.password = "Mật khẩu phải tối thiểu 6 ký tự!";
    } else {
        formData.value.password = escapeHtml(formData.value.password);
    }

    if (!formData.value.confirmPassword) {
        errors.value.confirmPassword = "Vui lòng không để trống khi đăng ký!";
    } else if (formData.value.confirmPassword.length < 6) {
        errors.value.confirmPassword = "Mật khẩu phải tối thiểu 6 ký tự!";
    } else if (formData.value.confirmPassword !== formData.value.password) {
        errors.value.confirmPassword = "Mật khẩu nhập lại không chính xác!";
    } else {
        formData.value.confirmPassword = escapeHtml(formData.value.confirmPassword);
    }

    if (!otp.value) {
        errors.value.otp = "Vui lòng nhập OTP!";
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }

    try {
        // SỬA 2: Dùng API_URL (Verify OTP)
        const otpResponse = await axios.post(`${API_URL}/api/khachhang/verify-otp`, {
            email: formData.value.emailCustomer,
            otp: otp.value,
        });

        if (otpResponse.data.message === "Xác thực OTP thành công!") {
            const dataToSend = {
                TenKhachHang: formData.value.nameCustomer,
                MatKhau: formData.value.password,
                Email: formData.value.emailCustomer,
                NgayTao: new Date()
            };

            // SỬA 3: Dùng API_URL (Register)
            const response = await axios.post(`${API_URL}/api/khachhang`, dataToSend);
            showNotification("Đăng ký tài khoản thành công!", "success");
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        }
    } catch (error) {
        showNotification(error.response?.data?.message || "Đăng ký thất bại!", "error");
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 2000);
};

const loginWithGoogle = () => {
    // SỬA 4: Dùng API_URL (Google Login Redirect)
    window.location.href = `${API_URL}/auth/google`;
};
</script>

<template>
    <div class="bg-[#1A1D27] relative overflow-hidden flex justify-center items-center min-h-screen font-sans">
        <div class="w-full max-w-4xl m-4">
            <div class="bg-[#242424] overflow-hidden p-2 rounded-md [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                <div class="flex flex-col md:flex-row gap-10">
                    <div
                        class="flex text-white flex-col gap-4 p-5 w-full lg:w-1/2 justify-center items-center lg:items-start">
                        <p class="font-semibold text-[20px] md:text-[24px] text-center lg:text-start">
                            ĐĂNG KÝ
                        </p>
                        <p class="font-medium text-[14px] md:text-[16px] mb-6 text-center lg:text-start">
                            Vui lòng điền đầy đủ thông tin!
                        </p>
                        <form @submit.prevent="isOtpSent ? verifyOtpAndRegister() : sendOTP()" method="POST"
                            class="flex flex-col gap-4 w-full">
                            <div class="w-full">
                                <label for="" class="block font-medium mb-1 text-[14px] md:text-[16px]">
                                    Tên đăng nhập
                                </label>
                                <input type="text" v-model="formData.nameCustomer" placeholder="Nhập tên của bạn ..."
                                    class="w-full px-4 py-2 md:py-3 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out"
                                    :disabled="isOtpSent" />
                                <p v-if="errors.nameCustomer" class="text-red-500 text-sm my-2">
                                    {{ errors.nameCustomer }}
                                </p>
                            </div>
                            <div class="w-full">
                                <label for="" class="block font-medium mb-1 text-[14px] md:text-[16px]">
                                    Email của bạn
                                </label>
                                <input type="text" v-model="formData.emailCustomer" placeholder="Test@gmail.com"
                                    class="w-full px-4 py-2 md:py-3 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out"
                                    :disabled="isOtpSent" />
                                <p v-if="errors.emailCustomer" class="text-red-500 text-sm my-2">
                                    {{ errors.emailCustomer }}
                                </p>
                            </div>
                            <div v-if="isOtpSent" class="w-full">
                                <label for="" class="block font-medium mb-1 text-[14px] md:text-[16px]">
                                    Mã OTP
                                </label>
                                <input type="text" v-model="otp" placeholder="Nhập mã OTP ..."
                                    class="w-full px-4 py-2 md:py-3 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                <p v-if="errors.otp" class="text-red-500 text-sm my-2">
                                    {{ errors.otp }}
                                </p>
                            </div>
                            <div v-if="isOtpSent" class="w-full">
                                <label for="" class="block font-medium mb-1 text-[14px] md:text-[16px]">
                                    Mật khẩu
                                </label>
                                <div class="flex gap-2">
                                    <input :type="showPassword.password ? 'text' : 'password'"
                                        v-model="formData.password" placeholder="••••••••"
                                        class="w-full px-4 py-2 md:py-3 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                    <button @click.prevent="togglePassword('password')"
                                        class="w-[60px] bg-[#DB3F4C] rounded-md flex items-center justify-center">
                                        <i :class="showPassword.password
                                                ? 'fa-solid fa-eye-slash'
                                                : 'fa-solid fa-eye'
                                            "></i>
                                    </button>
                                </div>
                                <p v-if="errors.password" class="text-red-500 text-sm my-2">
                                    {{ errors.password }}
                                </p>
                            </div>
                            <div v-if="isOtpSent" class="w-full">
                                <label for="" class="block font-medium mb-1 text-[14px] md:text-[16px]">
                                    Nhập lại mật khẩu
                                </label>
                                <div class="flex gap-2">
                                    <input :type="showPassword.confirmPassword ? 'text' : 'password'"
                                        v-model="formData.confirmPassword" placeholder="••••••••"
                                        class="w-full px-4 py-2 md:py-3 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                    <button @click.prevent="togglePassword('confirmPassword')"
                                        class="w-[60px] bg-[#DB3F4C] rounded-md flex items-center justify-center">
                                        <i :class="showPassword.confirmPassword
                                                ? 'fa-solid fa-eye-slash'
                                                : 'fa-solid fa-eye'
                                            "></i>
                                    </button>
                                </div>
                                <p v-if="errors.confirmPassword" class="text-red-500 text-sm my-2">
                                    {{ errors.confirmPassword }}
                                </p>
                            </div>
                            <button type="submit"
                                class="p-3 md:px-5 bg-[#DB3F4C] rounded-md font-medium text-[14px] md:text-[16px] transition duration-300 ease-in-out transform hover:scale-105">
                                {{ isOtpSent ? "Xác thực & Đăng ký" : "Gửi OTP" }}
                            </button>
                        </form>
                        <div class="flex items-center justify-center font-semibold">
                            <p>Hoặc</p>
                        </div>
                        <button @click="loginWithGoogle"
                            class="w-full p-3 bg-[#4285F4] text-white rounded-md font-medium text-[14px] md:text-[16px] flex justify-center items-center gap-2 transition duration-300 ease-in-out transform hover:scale-105">
                            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo"
                                class="w-6 h-6" />
                            Đăng ký với Google
                        </button>
                        <p class="mt-4 md:mt-8 text-center text-[14px] md:text-[16px]">
                            Nếu đã có tài khoản?
                            <router-link to="/login"
                                class="font-semibold text-[#DB3F4C] hover:text-[#5A2530] transition duration-150 ease-in-out">
                                Đăng nhập
                            </router-link>
                        </p>
                    </div>
                    <div class="hidden lg:block bg-[#DB3F4C] rounded-md p-4 lg:w-1/2">
                        <p class="text-white font-bold text-[24px]">C3 GUNDAM</p>
                        <div class="flex flex-col gap-2 items-center justify-center">
                            <div class="relative my-2">
                                <div
                                    class="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-2xl blur-2xl -z-10 scale-110">
                                </div>
                                <div
                                    class="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                    <img src="../../assets/img/Register.png" alt="C3 Gundam Store Logo"
                                        class="w-[300px] lg:w-[320px] rounded-xl drop-shadow-xl transition-all duration-300 hover:scale-105" />
                                </div>
                                <div
                                    class="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400/80 rounded-full animate-pulse">
                                </div>
                                <div class="absolute -bottom-4 -left-4 w-6 h-6 bg-orange-400/80 rounded-full animate-pulse"
                                    style="animation-delay: 1s;"></div>
                                <div
                                    class="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-yellow-400/40 rounded-tr-2xl">
                                </div>
                                <div
                                    class="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-orange-400/40 rounded-bl-2xl">
                                </div>
                            </div>
                            <p class="text-[18px] lg:text-[24px] text-white font-semibold uppercase text-center">
                                C3 GUNDAM xin chào!
                            </p>
                            <p class="text-[14px] lg:text-[16px] text-white font-medium text-center">
                                Vũ trụ Gundam đang chờ đón bạn, Hãy đăng ký tài khoản để có được
                                trải nghiệm tốt nhất!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <NotificationClient :message="notification.message" :type="notification.type" />
    </div>
</template>