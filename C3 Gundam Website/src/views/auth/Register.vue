<script setup>
import { ref } from "vue";
import axios from 'axios';
import { useRouter } from 'vue-router';

const errors = ref({});
const formData = ref({
    nameCustomer: '',
    emailCustomer: '',
    password: '',
    confirmPassword: '',
});

const notification = ref({
    message: '',
    type: ''
});

const register = async () => {
    console.log(1);
    errors.value = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!formData.value.nameCustomer) {
        errors.value.nameCustomer = "Tên không để trống khi đăng ký!";
    }

    if (!formData.value.emailCustomer) {
        errors.value.emailCustomer = "Email không để trống khi đăng ký!";
    } else if (!emailRegex.test(formData.value.emailCustomer)) {
        errors.value.emailCustomer = "Email không đúng định dạng!";
    }

    if (!formData.value.password) {
        errors.value.password = "Mật khẩu không để trống khi đăng ký!";
    }
    
    if (formData.value.password.length < 6) {
        errors.value.password = "Mật khẩu phải tối thiểu 6 ký tự!";
    }

    if (!formData.value.confirmPassword) {
        errors.value.confirmPassword = "Vui lòng không để trống khi đăng ký!";
    }
    
    if (formData.value.confirmPassword.length < 6) {
        errors.value.confirmPassword = "Mật khẩu phải tối thiểu 6 ký tự!";
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }

    try {
        const dataToSend = {
            TenKhachHang: formData.value.nameCustomer,
            MatKhau: formData.value.password,
            Email: formData.value.emailCustomer,
        };

        const response = await axios.post('http://localhost:3000/api/khachhang', dataToSend);
        notification.value = {
            message: "Đăng ký thành công!",
            type: "success",
        };
    } catch (error) {
        notification.value = {
            message: error.response?.data?.message || "Đăng ký thất bại!",
            type: "error",
        };
    }
};
</script>

<template>
    <div class="bg-[#1A1D27] relative overflow-hidden flex justify-center items-center min-h-screen font-sans">
        <div class="w-full max-w-4xl m-4">
            <div class="bg-[#242424] overflow-hidden p-2 rounded-md [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                <div class="flex flex-col md:flex-row gap-10">
                    <div
                        class="flex text-white flex-col gap-4 p-5 w-full lg:w-1/2 justify-center items-center lg:items-start">
                        <p class="font-semibold text-[20px] md:text-[24px] text-center lg:text-start">ĐĂNG KÝ</p>
                        <p class="font-medium text-[14px] md:text-[16px] mb-6 text-center lg:text-start">
                            Vui lòng điền đầy đủ thông tin!
                        </p>
                        <form @submit.prevent="register" method="POST" class="flex flex-col gap-4 w-full">
                            <div class="w-full">
                                <label for="" class="block font-medium mb-1 text-[14px] md:text-[16px]">Tên đăng
                                    nhập</label>
                                <input type="text" v-model="formData.nameCustomer" placeholder="Nhập tên của bạn ..."
                                    class="w-full px-4 py-2 md:py-3 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                            </div>
                            <div class="w-full">
                                <label for="" class="block font-medium mb-1 text-[14px] md:text-[16px]">Email của
                                    bạn</label>
                                <input type="text" v-model="formData.emailCustomer" placeholder="test@gmail.com"
                                    class="w-full px-4 py-2 md:py-3 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                            </div>
                            <div class="w-full">
                                <label for="" class="block font-medium mb-1 text-[14px] md:text-[16px]">Mật khẩu</label>
                                <input type="password" v-model="formData.password" placeholder="••••••••"
                                    class="w-full px-4 py-2 md:py-3 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
                            </div>
                            <div class="w-full">
                                <label for="" class="block font-medium mb-1 text-[14px] md:text-[16px]">Nhập lại mật
                                    khẩu</label>
                                <input type="password" v-model="formData.confirmPassword" placeholder="••••••••"
                                    class="w-full px-4 py-2 md:py-3 rounded-md bg-transparent outline-none border-2 focus:border-[#DB3F4C] focus:ring-[#DB3F4C] transition duration-150 ease-in-out" />
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
                            <img src="../../assets/img/banner.png" class="w-[400px]" alt="banner">
                            <p class="text-[18px] lg:text-[24px] text-white font-semibold uppercase text-center">
                                C3 GUNDAM xin chào!
                            </p>
                            <p class="text-[14px] lg:text-[16px] text-white font-medium text-center">
                                Vũ trụ Gundam đang chờ đón bạn, Hãy đăng ký tài khoản để có được trãi nghiệm tốt nhất!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <transition name="slide-fade" mode="out-in">
            <div v-if="notification.message"
                :class="`fixed top-4 right-4 p-5 bg-white shadow-lg rounded-lg z-10 flex items-center space-x-2 
                        ${notification.type === 'success' ? 'border-l-8 border-green-500 text-green-600' : 'border-l-8 border-red-500 text-red-600'}`">
                <p class="text-[18px] font-semibold">{{ notification.message }}</p>
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