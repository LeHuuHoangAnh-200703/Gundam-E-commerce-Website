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
    nameAdmin: '',
    emailAdmin: '',
    password: '',
    confirmPassword: '',
});

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

const registerAdmin = async () => {
    errors.value = {};
    const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

    if (!formData.value.nameAdmin) {
        errors.value.nameAdmin = "Tên không để trống khi thêm tài khoản!";
    } else {
        formData.value.nameAdmin = escapeHtml(formData.value.nameAdmin);
    }

    if (!formData.value.emailAdmin) {
        errors.value.emailAdmin = "Email không để trống khi thêm tài khoản!";
    } else if (!emailRegex.test(formData.value.emailAdmin)) {
        errors.value.emailAdmin = "Email không đúng định dạng!";
    } else {
        formData.value.emailAdmin = escapeHtml(formData.value.emailAdmin);
    }

    if (!formData.value.password) {
        errors.value.password = "Mật khẩu không để trống khi thêm tài khoản!";
    } else if (formData.value.password.length < 6) {
        errors.value.password = "Mật khẩu phải tối thiểu 6 ký tự!";
    }

    if (!formData.value.confirmPassword) {
        errors.value.confirmPassword = "Vui lòng không để trống khi thêm tài khoản!";
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
            TenAdmin: formData.value.nameAdmin,
            MatKhau: formData.value.password,
            Email: formData.value.emailAdmin,
            NgayTao: new Date()
        };

        const response = await axios.post('http://localhost:3000/api/admin', dataToSend);
        showNotification("Thêm tài khoản thành công!", "success");
        setTimeout(() => {
            router.push('/admin/adminLogin');
        }, 3000);
    } catch (error) {
        showNotification(error.response?.data?.message || "Thêm tài khoản thất bại!", "error");
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
                        <p class="font-semibold text-[20px] md:text-[24px] text-center lg:text-start">THÊM TÀI KHOẢN</p>
                        <p class="font-medium text-[14px] md:text-[16px] mb-6 text-center lg:text-start">
                            Vui lòng điền đầy đủ thông tin!
                        </p>
                        <form @submit.prevent="registerAdmin" method="POST" class="flex flex-col gap-4 w-full">
                            <div class="w-full">
                                <label for="" class="block font-medium mb-1 text-[14px] md:text-[16px]">Tên đăng
                                    nhập</label>
                                <input type="text" v-model="formData.nameAdmin" placeholder="Nhập tên của bạn ..."
                                    class="w-full px-4 py-2 md:py-3 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                <p v-if="errors.nameAdmin" class="text-red-500 text-sm my-2">{{ errors.nameAdmin }}</p>
                            </div>
                            <div class="w-full">
                                <label for="" class="block font-medium mb-1 text-[14px] md:text-[16px]">Email của
                                    bạn</label>
                                <input type="text" v-model="formData.emailAdmin" placeholder="test@gmail.com"
                                    class="w-full px-4 py-2 md:py-3 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                <p v-if="errors.emailAdmin" class="text-red-500 text-sm my-2">{{ errors.emailAdmin }}</p>
                            </div>
                            <div class="w-full">
                                <label for="" class="block font-medium mb-1 text-[14px] md:text-[16px]">Mật khẩu</label>
                                <input type="password" v-model="formData.password" placeholder="••••••••"
                                    class="w-full px-4 py-2 md:py-3 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                <p v-if="errors.password" class="text-red-500 text-sm my-2">{{ errors.password }}</p>
                            </div>
                            <div class="w-full">
                                <label for="" class="block font-medium mb-1 text-[14px] md:text-[16px]">Nhập lại mật
                                    khẩu</label>
                                <input type="password" v-model="formData.confirmPassword" placeholder="••••••••"
                                    class="w-full px-4 py-2 md:py-3 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                                <p v-if="errors.confirmPassword" class="text-red-500 text-sm my-2">{{ errors.confirmPassword }}</p>
                            </div>
                            <button type="submit"
                                class="px-4 py-2 md:px-5 bg-[#DB3F4C] rounded-md font-medium text-[14px] md:text-[16px] transition duration-300 ease-in-out transform hover:scale-105">
                                Thêm tài khoản
                            </button>
                        </form>
                        <p class="mt-4 md:mt-8 text-center text-[14px] md:text-[16px]">
                            Nếu đã có tài khoản?
                            <router-link to="/admin/adminLogin"
                                class="font-semibold text-[#DB3F4C] hover:text-[#5A2530] transition duration-150 ease-in-out">
                                Đăng nhập
                            </router-link>
                        </p>
                    </div>
                    <div class="hidden lg:block bg-[#DB3F4C] rounded-md p-4 lg:w-1/2">
                        <p class="text-white font-bold text-[24px]">C3 GUNDAM</p>
                        <div class="flex flex-col gap-2 items-center justify-center mt-16">
                            <img src="../../assets/img/banner.png" class="w-[400px]" alt="banner">
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