<script setup>
import { ref, onMounted } from "vue";
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';
import NotificationClient from "@/components/Notification/NotificationClient.vue";
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
const route = useRoute();
const formData = ref({
    email: '',
    password: '',
});
const showPassword = ref(false);
const showForgotPasswordModal = ref(false);
const forgotPasswordStep = ref('email'); // 'email', 'otp', 'password'
const forgotPasswordData = ref({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
});
const forgotPasswordErrors = ref({});
const forgotPasswordLoading = ref(false);

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

const togglePassword = () => {
    showPassword.value = !showPassword.value;
}

// Mở/đóng modal quên mật khẩu
const openForgotPasswordModal = () => {
    showForgotPasswordModal.value = true;
    forgotPasswordStep.value = 'email';
    forgotPasswordData.value = { email: '', otp: '', newPassword: '', confirmPassword: '' };
    forgotPasswordErrors.value = {};
};
const closeForgotPasswordModal = () => {
    showForgotPasswordModal.value = false;
};

const login = async () => {
    errors.value = {};
    const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

    if (!formData.value.email) {
        errors.value.email = "Email không được để trống!";
    } else if (!emailRegex.test(formData.value.email)) {
        errors.value.email = "Email không hợp lệ!";
    } else {
        formData.value.email = escapeHtml(formData.value.email);
    }

    if (!formData.value.password) {
        errors.value.password = "Mật khẩu không được để trống!";
    } else if (formData.value.password.length < 6) {
        errors.value.password = "Mật khẩu phải tối thiểu 6 ký tự!";
    } else {
        formData.value.password = escapeHtml(formData.value.password);
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }

    try {
        const response = await axios.post('http://localhost:3000/api/khachhang/login', {
            email: formData.value.email,
            password: formData.value.password
        });
        localStorage.setItem('Email', response.data.customer.Email);
        localStorage.setItem('TenKhachHang', response.data.customer.TenKhachHang);
        localStorage.setItem('MaKhachHang', response.data.customer.MaKhachHang);
        localStorage.setItem('TrangThai', response.data.customer.TrangThai);
        localStorage.setItem('HinhAnh', response.data.customer.HinhAnh);
        showNotification("Đăng nhập thành công!", "success");
        setTimeout(() => {
            router.push('/');
        }, 2000);
    } catch (error) {
        showNotification(error.response?.data?.message || "Có lỗi xảy ra!", "error");
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 2000);
}

const loginWithGoogle = async () => {
    window.location.href = 'http://localhost:3000/auth/google';
};

const sendOTP = async () => {
    forgotPasswordErrors.value = {};
    const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

    if (!forgotPasswordData.value.email) {
        forgotPasswordErrors.value.email = "Email không được để trống!";
    } else if (!emailRegex.test(forgotPasswordData.value.email)) {
        forgotPasswordErrors.value.email = "Email không hợp lệ!";
    } else {
        forgotPasswordData.value.email = escapeHtml(forgotPasswordData.value.email);
    }

    if (Object.keys(forgotPasswordErrors.value).length > 0) {
        return;
    }

    forgotPasswordLoading.value = true;

    try {
        const response = await axios.post('http://localhost:3000/api/khachhang/send-otp', {
            email: forgotPasswordData.value.email,
        });
        showNotification(response.data.message, 'success');
        forgotPasswordStep.value = 'otp';
        forgotPasswordData.value.otp = ''; // Reset OTP
    } catch (error) {
        showNotification(error.response?.data?.error || 'Lỗi khi gửi OTP', 'error');
    } finally {
        forgotPasswordLoading.value = false;
    }
}

const verifyOTP = async () => {
    forgotPasswordErrors.value = {};
    if (!forgotPasswordData.value.otp) {
        forgotPasswordErrors.value.otp = "Mã OTP không được để trống!";
        return;
    }

    forgotPasswordLoading.value = true;
    try {
        const response = await axios.post('http://localhost:3000/api/khachhang/verify-otp', {
            email: forgotPasswordData.value.email,
            otp: forgotPasswordData.value.otp,
        });
        console.log('Phản hồi verifyOTP:', response.data);
        showNotification(response.data.message, 'success');
        forgotPasswordStep.value = 'password';
    } catch (error) {
        showNotification(error.response?.data?.error || 'Lỗi khi xác thực OTP', 'error');
    } finally {
        forgotPasswordLoading.value = false;
    }
};

// Hàm đặt lại mật khẩu
const resetPassword = async () => {
    forgotPasswordErrors.value = {};

    if (!forgotPasswordData.value.newPassword) {
        forgotPasswordErrors.value.newPassword = "Mật khẩu mới không được để trống!";
    } else if (forgotPasswordData.value.newPassword.length < 6) {
        forgotPasswordErrors.value.newPassword = "Mật khẩu phải tối thiểu 6 ký tự!";
    } else if (forgotPasswordData.value.newPassword !== forgotPasswordData.value.confirmPassword) {
        forgotPasswordErrors.value.confirmPassword = "Mật khẩu xác nhận không khớp!";
    }

    if (Object.keys(forgotPasswordErrors.value).length > 0) {
        return;
    }

    forgotPasswordLoading.value = true;
    try {
        const response = await axios.post('http://localhost:3000/api/khachhang/quenmatkhau', {
            email: forgotPasswordData.value.email,
            newPassword: forgotPasswordData.value.newPassword,
        });
        showNotification(response.data.message, 'success');
        setTimeout(() => {
            closeForgotPasswordModal();
            router.push('/login');
        }, 2000);
    } catch (error) {
        showNotification(error.response?.data?.error || 'Lỗi khi đặt lại mật khẩu', 'error');
    } finally {
        forgotPasswordLoading.value = false;
    }
};

// Hàm gửi lại OTP
const resendOTP = async () => {
    forgotPasswordErrors.value = {};
    forgotPasswordLoading.value = true;
    try {
        const response = await axios.post('http://localhost:3000/api/khachhang/send-otp', {
            email: forgotPasswordData.value.email,
        });
        showNotification('OTP mới đã được gửi đến email!', 'success');
    } catch (error) {
        showNotification(error.response?.data?.error || 'Lỗi khi gửi lại OTP', 'error');
    } finally {
        forgotPasswordLoading.value = false;
    }
};

onMounted(async () => {
    const maKhachHang = route.query.maKhachHang;
    const googleSuccess = route.query.googleSuccess === 'true';

    if (googleSuccess && maKhachHang) {
        try {
            const response = await axios.get(`http://localhost:3000/api/khachhang/loginGoogle/google?maKhachHang=${maKhachHang}`);
            localStorage.setItem('Email', response.data.customer.Email);
            localStorage.setItem('TenKhachHang', response.data.customer.TenKhachHang);
            localStorage.setItem('MaKhachHang', response.data.customer.MaKhachHang);
            localStorage.setItem('TrangThai', response.data.customer.TrangThai);
            localStorage.setItem('HinhAnh', response.data.customer.HinhAnh);
            showNotification("Đăng nhập với Google thành công!", "success");
            setTimeout(() => {
                router.push('/');
            }, 2000);
        } catch (error) {
            showNotification(error.response?.data?.message || "Có lỗi xảy ra!", "error");
        }
    } else if (route.query.googleSuccess === 'false') {
        showNotification("Đăng nhập với Google thất bại!", "error");
    }
})
</script>

<template>
    <div class="bg-[#1A1D27] relative overflow-hidden flex justify-center items-center min-h-screen font-sans">
        <div class="w-full max-w-4xl m-4">
            <div class="bg-[#242424] overflow-hidden p-2 rounded-md [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                <div class="flex flex-col md:flex-row gap-10">
                    <div class="hidden lg:block bg-[#DB3F4C] rounded-md p-4 lg:w-1/2">
                        <p class="text-white font-bold text-[24px]">C3 GUNDAM</p>
                        <div class="flex flex-col gap-2 items-center justify-center">
                            <img src="../../assets/img/banner.png" class="w-[200px] lg:w-[300px]" alt="banner">
                            <p class="text-[18px] lg:text-[24px] text-white font-semibold uppercase text-center">
                                C3 GUNDAM xin chào!
                            </p>
                            <p class="text-[14px] lg:text-[16px] text-white font-medium text-center">
                                Vũ trụ Gundam đang chờ đón bạn, chào mừng bạn đã quay trở lại!
                            </p>
                        </div>
                    </div>
                    <div
                        class="flex text-white flex-col gap-4 p-5 w-full lg:w-1/2 justify-center items-center lg:items-start">
                        <p class="font-semibold text-[20px] md:text-[24px] text-center lg:text-start">ĐĂNG NHẬP</p>
                        <p class="font-medium text-[14px] md:text-[16px] mb-6 text-center lg:text-start">
                            Vui lòng điền đầy đủ thông tin!
                        </p>
                        <form @submit.prevent="login" method="POST" class="flex flex-col gap-4 w-full">
                            <div class="w-full">
                                <label for="" class="block font-medium mb-1 text-[14px] md:text-[16px]">Email</label>
                                <input type="text" v-model="formData.email" placeholder="Test@gmail.com"
                                    class="w-full px-4 py-2 md:py-3 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                <p v-if="errors.email" class="text-red-500 text-sm my-2">{{ errors.email }}</p>
                            </div>
                            <div class="w-full relative">
                                <label for="" class="block font-medium mb-1 text-[14px] md:text-[16px]">Mật khẩu</label>
                                <div class="flex gap-2">
                                    <input :type="showPassword ? 'text' : 'password'" v-model="formData.password"
                                        placeholder="••••••••"
                                        class="relative w-full px-4 py-2 md:py-3 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                    <button @click.prevent="togglePassword"
                                        class="w-[60px] bg-[#DB3F4C] rounded-md flex items-center justify-center"><i
                                            :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i></button>
                                </div>
                                <p v-if="errors.password" class="text-red-500 text-sm my-2">{{ errors.password }}</p>
                            </div>
                            <button type="submit"
                                class="p-3 inline-block md:px-5 bg-[#DB3F4C] rounded-md font-medium text-[14px] md:text-[16px] transition duration-300 ease-in-out transform hover:scale-105">
                                Đăng nhập
                            </button>
                        </form>
                        <div class="flex items-center justify-between font-semibold w-full">
                            <p>Hoặc</p>
                            <button @click="openForgotPasswordModal" class="text-[16px] underline text-blue-400">Quên
                                mật khẩu?</button>
                        </div>
                        <button @click="loginWithGoogle"
                            class="w-full p-3 bg-[#4285F4] text-white rounded-md font-medium text-[14px] md:text-[16px] flex justify-center items-center gap-2 transition duration-300 ease-in-out transform hover:scale-105">
                            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo"
                                class="w-6 h-6" />
                            Đăng nhập với Google
                        </button>
                        <p class="mt-4 md:mt-8 text-center text-[14px] md:text-[16px]">
                            Nếu chưa có tài khoản?
                            <router-link to="/register"
                                class="font-semibold text-[#DB3F4C] hover:text-[#5A2530] transition duration-150 ease-in-out">
                                Đăng ký
                            </router-link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="showForgotPasswordModal"
            class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div class="bg-[#242424] p-6 rounded-md w-full max-w-md text-white relative">
                <button @click="closeForgotPasswordModal" class="absolute top-2 right-2 text-gray-400 hover:text-white">
                    <i class="fa-solid fa-times"></i>
                </button>
                <h3 class="text-[20px] font-semibold mb-4 text-center">Quên mật khẩu</h3>
                <!-- Form nhập email -->
                <form v-if="forgotPasswordStep === 'email'" @submit.prevent="sendOTP" class="flex flex-col gap-4">
                    <div class="w-full">
                        <label for="forgot-email" class="block font-medium mb-1 text-[14px]">Email</label>
                        <input v-model="forgotPasswordData.email" type="email" id="forgot-email"
                            placeholder="Nhập email của bạn..."
                            class="w-full px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] transition duration-150 ease-in-out" />
                        <p v-if="forgotPasswordErrors.email" class="text-red-500 text-sm my-2">{{
                            forgotPasswordErrors.email }}</p>
                    </div>
                    <button type="submit" :disabled="forgotPasswordLoading"
                        class="p-3 bg-[#DB3F4C] rounded-md font-medium text-[14px] transition duration-300 ease-in-out transform hover:scale-105">
                        Gửi OTP
                    </button>
                </form>
                <!-- Form nhập OTP -->
                <form v-if="forgotPasswordStep === 'otp'" @submit.prevent="verifyOTP" class="flex flex-col gap-4">
                    <div class="w-full">
                        <label for="otp" class="block font-medium mb-1 text-[14px]">Mã OTP</label>
                        <input v-model="forgotPasswordData.otp" type="text" id="otp" placeholder="Nhập mã OTP"
                            class="w-full px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] transition duration-150 ease-in-out" />
                        <p v-if="forgotPasswordErrors.otp" class="text-red-500 text-sm my-2">{{ forgotPasswordErrors.otp
                            }}</p>
                    </div>
                    <button type="submit" :disabled="forgotPasswordLoading"
                        class="p-3 bg-[#DB3F4C] rounded-md font-medium text-[14px] transition duration-300 ease-in-out transform hover:scale-105">
                        Xác thực OTP
                    </button>
                    <p class="text-[14px] text-center">
                        Chưa nhận được OTP?
                        <a href="#" @click.prevent="resendOTP" class="text-blue-400 underline">Gửi lại OTP</a>
                    </p>
                </form>
                <!-- Form nhập mật khẩu mới -->
                <form v-if="forgotPasswordStep === 'password'" @submit.prevent="resetPassword"
                    class="flex flex-col gap-4">
                    <div class="w-full">
                        <label for="new-password" class="block font-medium mb-1 text-[14px]">Mật khẩu mới</label>
                        <div class="flex gap-2">
                            <input v-model="forgotPasswordData.newPassword" :type="showPassword ? 'text' : 'password'"
                                id="new-password" placeholder="Nhập mật khẩu mới"
                                class="w-full px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] transition duration-150 ease-in-out" />
                            <button @click.prevent="togglePassword"
                                class="w-[60px] bg-[#DB3F4C] rounded-md flex items-center justify-center"><i
                                    :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i></button>
                        </div>
                        <p v-if="forgotPasswordErrors.newPassword" class="text-red-500 text-sm my-2">{{
                            forgotPasswordErrors.newPassword }}</p>
                    </div>
                    <div class="w-full">
                        <label for="confirm-password" class="block font-medium mb-1 text-[14px]">Xác nhận mật
                            khẩu</label>
                        <div class="flex gap-2">
                            <input v-model="forgotPasswordData.confirmPassword"
                                :type="showPassword ? 'text' : 'password'" id="confirm-password"
                                placeholder="Xác nhận mật khẩu"
                                class="w-full px-4 py-2 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] transition duration-150 ease-in-out" />
                            <button @click.prevent="togglePassword"
                                class="w-[60px] bg-[#DB3F4C] rounded-md flex items-center justify-center"><i
                                    :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i></button>
                        </div>
                        <p v-if="forgotPasswordErrors.confirmPassword" class="text-red-500 text-sm my-2">{{
                            forgotPasswordErrors.confirmPassword }}</p>
                    </div>
                    <button type="submit" :disabled="forgotPasswordLoading"
                        class="p-3 bg-[#DB3F4C] rounded-md font-medium text-[14px] transition duration-300 ease-in-out transform hover:scale-105">
                        Cập nhật mật khẩu
                    </button>
                </form>
            </div>
        </div>
        <NotificationClient :message="notification.message" :type="notification.type" />
    </div>
</template>