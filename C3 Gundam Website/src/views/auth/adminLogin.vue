<script setup>
import { ref, onMounted } from "vue";
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
    email: '',
    password: '',
});

const notification = ref({
    message: '',
    type: ''
});
const showPassword = ref(false);
const togglePassword = () => {
    showPassword.value = !showPassword.value;
}
const showNotification = (msg, type) => {
    notification.value = { message: msg, type: type };
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
};

const loginAdmin = async () => {
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
        const response = await axios.post('http://localhost:3000/api/admin/login', {
            email: formData.value.email,
            password: formData.value.password
        });
        localStorage.setItem('TenAdmin', response.data.admin.TenAdmin);
        localStorage.setItem('MaAdmin', response.data.admin.MaAdmin);
        showNotification("Đăng nhập thành công!", "success");
        setTimeout(() => {
            router.push('/admin/adminProducts');
        }, 2000);
    } catch (error) {
        showNotification(error.response?.data?.message || "Có lỗi xảy ra!", "error");
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 2000);
}
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
                    <div class="flex text-white flex-col gap-4 p-5 w-full lg:w-1/2 justify-center items-center lg:items-start">
                        <p class="font-semibold text-[20px] md:text-[24px] text-center lg:text-start">ĐĂNG NHẬP ADMIN</p>
                        <p class="font-medium text-[14px] md:text-[16px] mb-6 text-center lg:text-start">
                            Vui lòng điền đầy đủ thông tin!
                        </p>
                        <form @submit.prevent="loginAdmin" method="POST" class="flex flex-col gap-4 w-full">
                            <div class="w-full">
                                <label for="" class="block font-medium mb-1 text-[14px] md:text-[16px]">Email</label>
                                <input type="text" v-model="formData.email" placeholder="Test@gmail.com"
                                    class="w-full px-4 py-2 md:py-3 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                <p v-if="errors.email" class="text-red-500 text-sm my-2">{{ errors.email }}</p>
                            </div>
                            <div class="w-full relative">
                                <label for="" class="block font-medium mb-1 text-[14px] md:text-[16px]">Mật khẩu</label>
                                <div class="flex gap-2">
                                    <input :type="showPassword ? 'text' : 'password'" v-model="formData.password" placeholder="••••••••"
                                        class="relative w-full px-4 py-2 md:py-3 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                    <button @click.prevent="togglePassword" class="w-[60px] bg-[#DB3F4C] rounded-md flex items-center justify-center"><i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i></button>
                                </div>
                                <p v-if="errors.password" class="text-red-500 text-sm my-2">{{ errors.password }}</p>
                            </div>
                            <button type="submit"
                                class="p-3 inline-block md:px-5 bg-[#DB3F4C] rounded-md font-medium text-[14px] md:text-[16px] transition duration-300 ease-in-out transform hover:scale-105">
                                Đăng nhập
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        <NotificationClient :message="notification.message" :type="notification.type" />
    </div>
</template>