<script setup>
import { ref, onMounted } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

// --- CẤU HÌNH URL ĐỘNG ---
// Tự động nhận diện môi trường: Netlify (Production) hoặc Localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// -------------------------

const errors = ref({});
const idStaff = ref('');
const nameStaff = ref('');
const emailStaff = ref('');
const position = ref('');
const password = ref('');
const confirmPassword = ref('');
const TenAdmin = localStorage.getItem("TenAdmin");
const ChucVu = localStorage.getItem("ChucVu");
const ThoiGian = new Date();
const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};
const notification = ref({
    message: '',
    type: ''
});

const fetchStaff = async (idNhanVien) => {
    try {
        // SỬA 1: Dùng API_URL
        const response = await axios.get(`${API_URL}/api/admin/${idNhanVien}`);
        console.log(response.data);
        idStaff.value = response.data.MaAdmin;
        nameStaff.value = response.data.TenAdmin;
        emailStaff.value = response.data.Email;
        position.value = response.data.ChucVu;
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

const updateStaff = async () => {
    errors.value = {};

    if (!nameStaff.value) {
        errors.value.nameStaff = "Vui lòng nhập tên nhân viên.";
    } else {
        nameStaff.value = escapeHtml(nameStaff.value);
    }

    if (!emailStaff.value) {
        errors.value.emailStaff = "Vui lòng nhập email nhân viên.";
    } else {
        emailStaff.value = escapeHtml(emailStaff.value);
    }

    if (password.value) {
        password.value = escapeHtml(password.value);
    } else if (password.value && password.value < 6) {
        errors.value.password = "Mật khẩu tối thiểu 6 kí tự.";
    }

    if (confirmPassword.value) {
        confirmPassword.value = escapeHtml(confirmPassword.value);
    } else if (confirmPassword.value !== password.value) {
        errors.value.confirmPassword = "Mật khẩu nhập lại không khớp.";
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }

    try {
        const dataToSend = {
            TenAdmin: nameStaff.value,
            Email: emailStaff.value,
            ChucVu: position.value,
        }

        if (password.value !== "") {
            dataToSend.MatKhau = password.value;
        }

        // SỬA 2: Dùng API_URL
        const response = await axios.put(`${API_URL}/api/admin/${idStaff.value}`, dataToSend);

        const notificationData = {
            ThongBao: `Vừa cập nhật thông tin của ${nameStaff.value}`,
            NguoiChinhSua: TenAdmin,
            ChucVu: ChucVu,
            ThoiGian: ThoiGian,
        };

        // SỬA 3: Dùng API_URL
        await axios.post(`${API_URL}/api/thongbao`, notificationData);

        notification.value = {
            message: "Cập nhật thông tin thành công!",
            type: "success",
        };
        setTimeout(() => {
            router.push('/admin/staffList');
        }, 3000);
    } catch (error) {
        notification.value = {
            message: error.response?.data?.message || "Cập nhật thông tin thất bại.",
            type: "error",
        };
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}

onMounted(() => {
    const idNhanVien = router.currentRoute.value.params.maAdmin;
    fetchStaff(idNhanVien);
})
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full min-h-screen font-sans">
        <div class="flex gap-3">
            <SideBar />
            <div class="relative p-4 flex flex-col gap-4 w-full overflow-auto">
                <Navbar />
                <div class="w-full relative flex flex-col gap-4 overflow-auto max-h-[calc(100vh-100px)] pb-7">
                    <div class="flex lg:flex-row flex-col gap-4 justify-center items-center">
                        <h1 class="font-bold text-[20px] uppercase">Cập nhật thông tin</h1>
                    </div>
                    <div class="relative flex flex-col gap-4 w-full overflow-auto max-h-[calc(100vh-150px)]">
                        <div class="flex-grow lg:px-24 p-4">
                            <div class="container max-w-screen-lg mx-auto">
                                <div>
                                    <div class="bg-white rounded-lg shadow-lg p-4 px-4 md:p-8 mb-6">
                                        <div class="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3">
                                            <div class="text-[#333f48] font-semibold">
                                                <p class="text-lg">Cập nhật thông tin nhân viên</p>
                                                <p>Vui lòng điền thông tin đầy đủ.</p>
                                            </div>
                                            <div class="lg:col-span-2">
                                                <form @submit.prevent="updateStaff" method="POST"
                                                    class="grid gap-4 gap-y-3 text-sm grid-cols-1 md:grid-cols-5"
                                                    enctype="multipart/form-data">
                                                    <div class="md:col-span-5">
                                                        <label for="nameStaff" class="font-semibold text-[16px]">Họ
                                                            tên</label>
                                                        <input type="text" name="nameStaff" id="nameStaff"
                                                            v-model="nameStaff"
                                                            class="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                                            placeholder="Nhập họ tên ..." />
                                                        <p v-if="errors.nameStaff" class="text-red-500 text-sm mt-2">{{
                                                            errors.nameStaff }}</p>
                                                    </div>
                                                    <div class="md:col-span-5">
                                                        <label for="email"
                                                            class="font-semibold text-[16px]">Email</label>
                                                        <input type="email" name="email" id="email" v-model="emailStaff"
                                                            class="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                                            placeholder="Nhập email mới ..." />
                                                        <p v-if="errors.emailStaff" class="text-red-500 text-sm mt-2">{{
                                                            errors.emailStaff }}</p>
                                                    </div>
                                                    <div class="md:col-span-5">
                                                        <label for="position" class="font-semibold text-[16px]">Chức
                                                            vụ</label>
                                                        <select id="position" v-model="position"
                                                            class="h-10 border mt-1 cursor-pointer rounded px-4 w-full bg-gray-50">
                                                            <option value="">Chọn chức vụ phù hợp</option>
                                                            <option value="Quản trị viên">Quản trị viên</option>
                                                            <option value="Nhân viên quản lý">Nhân viên quản lý</option>
                                                        </select>
                                                        <p v-if="errors.position" class="text-red-500 text-sm mt-2">{{
                                                            errors.position }}</p>
                                                    </div>
                                                    <div class="md:col-span-5">
                                                        <label for="password" class="font-semibold text-[16px]">Mật
                                                            khẩu</label>
                                                        <input type="password" name="password" id="password"
                                                            v-model="password"
                                                            class="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                                            placeholder="Nhập mật khẩu ...">
                                                        <p v-if="errors.password" class="text-red-500 text-sm mt-2">{{
                                                            errors.password }}</p>
                                                    </div>
                                                    <div class="md:col-span-5">
                                                        <label for="confirmPassword"
                                                            class="font-semibold text-[16px]">Nhập
                                                            lại mật khẩu</label>
                                                        <input type="password" name="confirmPassword"
                                                            id="confirmPassword" v-model="confirmPassword"
                                                            class="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                                            placeholder="Xác nhận mật khẩu ...">
                                                        <p v-if="errors.confirmPassword"
                                                            class="text-red-500 text-sm mt-2">{{
                                                                errors.confirmPassword }}</p>
                                                    </div>
                                                    <div class="md:col-span-5 text-right">
                                                        <div class="inline-flex items-end">
                                                            <button type="submit"
                                                                class="px-5 py-2 rounded-md font-semibold text-white text-[14px] bg-[#1A1D27] transition-all duration-300 hover:bg-[#003171]">Cập
                                                                nhật thông tin</button>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <transition name="slide-fade" mode="out-in">
                    <div v-if="notification.message" :class="['fixed top-4 left-1/2 right-10 transform p-4 bg-white shadow-lg border-t-4 rounded z-10 flex items-center space-x-2 w-full max-w-sm', {
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
        </div>
    </div>
</template>

<style scoped>
.active-link {
    background: #DB3F4C;
    color: white;
}

.fixed {
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
}

.fixed.translate-x-0 {
    transform: translateX(0);
}

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