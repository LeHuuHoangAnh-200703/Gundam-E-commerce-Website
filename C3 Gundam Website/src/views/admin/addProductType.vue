<script setup>
import { ref } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import NotificationAdmin from "@/components/Notification/NotificationAdmin.vue";
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
// Hàm mã hóa đầu vào
const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const TenAdmin = localStorage.getItem("TenAdmin");
const ThoiGian = new Date();

const errors = ref({});
const formData = ref({
    nameProductType: '',
    productType: '',
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

const addProductType = async () => {
    errors.value = {};

    if (!formData.value.nameProductType) {
        errors.value.nameProductType = "Tên loại sản phẩm không để trống khi thêm!";
    } else {
        formData.value.nameProductType = escapeHtml(formData.value.nameProductType);
    }

    if (!formData.value.productType) {
        errors.value.productType = "Loại sản phẩm không để trống khi thêm!";
    } else {
        formData.value.productType = escapeHtml(formData.value.productType);
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }

    try {
        const dataToSend = {
            TenLoaiSanPham: formData.value.nameProductType,
            LoaiSanPham: formData.value.productType
        };

        const response = await axios.post('http://localhost:3000/api/loaisanpham', dataToSend);

        const notificationData = {
            ThongBao: `Vừa thêm loại sản phẩm ${formData.value.nameProductType}`,
            NguoiChinhSua: TenAdmin,
            ThoiGian: ThoiGian,
        };

        await axios.post('http://localhost:3000/api/thongbao', notificationData);

        showNotification(response.data.message, "success");
        setTimeout(() => {
            router.push('/admin/listProductType');
        }, 2000);
    } catch (error) {
        console.log(error.message)
        showNotification(error.response?.data?.message || "Thêm nhà cung cấp thất bại! Vui lòng kiểm tra lại thông tin.", "error");
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 2000);
};
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full h-screen font-sans flex">
        <SideBar />
        <div class="flex-1 flex flex-col h-screen overflow-hidden">
            <div class="flex-shrink-0 p-4">
                <Navbar />
            </div>
            <div class="flex-1 px-4 py-4 overflow-y-auto">
                <div class="flex flex-col gap-4">
                    <div class="flex lg:flex-row flex-col gap-4 justify-center items-center">
                        <h1 class="font-bold text-[20px] uppercase">Quản lý loại sản phẩm</h1>
                    </div>
                    <div class="bg-white rounded-lg shadow-lg w-full lg:w-[70%] mx-auto p-4">
                        <form @submit.prevent="addProductType" method="POST">
                            <div class="w-full flex flex-col lg:flex-row gap-8">
                                <div class="w-full flex flex-col gap-4">
                                    <div class="flex flex-col gap-2">
                                        <label for="nameProductType" class="text-[15px] font-semibold">Tên loại sản
                                            phẩm</label>
                                        <input type="text" v-model="formData.nameProductType" id="nameProductType"
                                            class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            placeholder="HG GUNDAM THUNDERBOLT ...">
                                        <p v-if="errors.nameProductType" class="text-red-500 text-sm mt-2">{{
                                            errors.nameProductType }}</p>
                                    </div>
                                    <div class="flex flex-col gap-2">
                                        <label for="productType" class="text-[15px] font-semibold">Loại sản phẩm</label>
                                        <input type="text" v-model="formData.productType" id="productType"
                                            class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            placeholder="HG ...">
                                        <p v-if="errors.productType" class="text-red-500 text-sm mt-2">{{
                                            errors.productType }}</p>
                                    </div>
                                    <div class="flex justify-center lg:justify-end">
                                        <button type="submit"
                                            class="px-5 py-2 rounded-md font-semibold text-white text-[14px] bg-[#1A1D27] transition-all duration-300 hover:bg-[#003171]">Thêm
                                            loại sản phẩm</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <NotificationAdmin :message="notification.message" :type="notification.type" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.active-link {
    background: #DB3F4C;
    color: white;
}
</style>