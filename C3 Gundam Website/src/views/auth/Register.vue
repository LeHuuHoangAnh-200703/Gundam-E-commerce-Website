<script setup>
import { ref } from "vue";
import axios from 'axios';
import NotificationClient from "@/components/Notification/NotificationClient.vue";
import { useRouter } from 'vue-router';

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
    phoneCustomer: '',
    password: '',
    confirmPassword: '',
});

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

const register = async () => {
    errors.value = {};
    const phoneRegex = /^(0|\+84)[3-9][0-9]{8}$/;

    if (!formData.value.nameCustomer) {
        errors.value.nameCustomer = "Tên không để trống khi đăng ký!";
    } else {
        formData.value.nameCustomer = escapeHtml(formData.value.nameCustomer);
    }

    if (!formData.value.phoneCustomer) {
        errors.value.phoneCustomer = "Số điện thoại không để trống khi đăng ký!";
    } else if (!phoneRegex.test(formData.value.phoneCustomer)) {
        errors.value.phoneCustomer = "Số điện thoại không hợp lệ!";
    } else {
        formData.value.phoneCustomer = escapeHtml(formData.value.phoneCustomer);
    }

    if (!formData.value.password) {
        errors.value.password = "Mật khẩu không để trống khi đăng ký!";
    } else if (formData.value.password.length < 6) {
        errors.value.password = "Mật khẩu phải tối thiểu 6 ký tự!";
    }

    if (!formData.value.confirmPassword) {
        errors.value.confirmPassword = "Vui lòng không để trống khi đăng ký!";
    } else if (formData.value.confirmPassword.length < 6) {
        errors.value.confirmPassword = "Mật khẩu phải tối thiểu 6 ký tự!";
    } else if (formData.value.confirmPassword !== formData.value.password) {
        errors.value.confirmPassword = "Mật khẩu nhập lại không chính xác!";
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }

    try {
        const dataToSend = {
            TenKhachHang: formData.value.nameCustomer,
            MatKhau: formData.value.password,
            SoDienThoai: formData.value.phoneCustomer,
            NgayTao: new Date()
        };

        const response = await axios.post('http://localhost:3000/api/khachhang', dataToSend);
        showNotification("Đăng ký tài khoản thành công!", "success");
        setTimeout(() => {
            router.push('/login');
        }, 3000);
    } catch (error) {
        showNotification(error.response?.data?.message || "Đăng ký thất bại!", "error");
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
};
</script>

<template>
    <div class="bg-[#1A1D27] relative overflow-hidden flex justify-center items-center min-h-screen font-sans">
        <div class="w-full max-w-4xl m-4">
            <div class="bg-[#242424] overflow-hidden p-2 rounded-md [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                <div class="flex flex-col md:flex-row gap-10">
                    <div class="flex text-white flex-col gap-4 p-5 w-full lg:w-1/2 justify-center items-center lg:items-start">
                        <p class="font-semibold text-[20px] md:text-[24px] text-center lg:text-start">ĐĂNG KÝ</p>
                        <p class="font-medium text-[14px] md:text-[16px] mb-6 text-center lg:text-start">
                            Vui lòng điền đầy đủ thông tin!
                        </p>
                        <form @submit.prevent="register" method="POST" class="flex flex-col gap-4 w-full">
                            <div class="w-full">
                                <label for="" class="block font-medium mb-1 text-[14px] md:text-[16px]">Tên đăng nhập</label>
                                <input type="text" v-model="formData.nameCustomer" placeholder="Nhập tên của bạn ..."
                                    class="w-full px-4 py-2 md:py-3 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                <p v-if="errors.nameCustomer" class="text-red-500 text-sm my-2">{{ errors.nameCustomer }}</p>
                            </div>
                            <div class="w-full">
                                <label for="" class="block font-medium mb-1 text-[14px] md:text-[16px]">Số điện thoại của bạn</label>
                                <input type="text" v-model="formData.phoneCustomer" placeholder="079xxxxxxx"
                                    class="w-full px-4 py-2 md:py-3 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                <p v-if="errors.phoneCustomer" class="text-red-500 text-sm my-2">{{ errors.phoneCustomer }}</p>
                            </div>
                            <div class="w-full">
                                <label for="" class="block font-medium mb-1 text-[14px] md:text-[16px]">Mật khẩu</label>
                                <div class="flex gap-2">
                                    <input :type="showPassword.password ? 'text' : 'password'" v-model="formData.password" placeholder="••••••••"
                                    class="w-full px-4 py-2 md:py-3 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                    <button @click.prevent="togglePassword('password')" class="w-[60px] bg-[#DB3F4C] rounded-md flex items-center justify-center"><i :class="showPassword.password ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i></button>
                                </div>
                                <p v-if="errors.password" class="text-red-500 text-sm my-2">{{ errors.password }}</p>
                            </div>
                            <div class="w-full">
                                <label for="" class="block font-medium mb-1 text-[14px] md:text-[16px]">Nhập lại mật khẩu</label>
                                <div class="flex gap-2">
                                    <input :type="showPassword.confirmPassword ? 'text' : 'password'" v-model="formData.confirmPassword" placeholder="••••••••"
                                    class="w-full px-4 py-2 md:py-3 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                    <button @click.prevent="togglePassword('confirmPassword')" class="w-[60px] bg-[#DB3F4C] rounded-md flex items-center justify-center"><i :class="showPassword.confirmPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i></button>
                                </div>
                                <p v-if="errors.confirmPassword" class="text-red-500 text-sm my-2">{{ errors.confirmPassword }}</p>
                            </div>
                            <button type="submit"
                                class="px-4 py-2 md:px-5 bg-[#DB3F4C] rounded-md font-medium text-[14px] md:text-[16px] transition duration-300 ease-in-out transform hover:scale-105">
                                Đăng ký
                            </button>
                        </form>
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
                        <div class="flex flex-col gap-2 items-center justify-center mt-16">
                            <img src="https://res.cloudinary.com/dwcajbc6f/image/upload/v1739607250/banner_ycqsds.png" class="w-[400px]" alt="banner">
                            <p class="text-[18px] lg:text-[24px] text-white font-semibold uppercase text-center">
                                C3 GUNDAM xin chào!
                            </p>
                            <p class="text-[14px] lg:text-[16px] text-white font-medium text-center">
                                Vũ trụ Gundam đang chờ đón bạn, Hãy đăng ký tài khoản để có được trải nghiệm tốt nhất!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <NotificationClient :message="notification.message" :type="notification.type" />
    </div>
</template>