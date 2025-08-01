<script setup>
import { ref, onMounted } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import NotificationAdmin from "@/components/Notification/NotificationAdmin.vue";
import axios from "axios";
import { useRouter } from 'vue-router';

const router = useRouter();
const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const errors = ref({});

const TenAdmin = localStorage.getItem("TenAdmin");
const ThoiGian = new Date();

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

const formData = ref({
    nameCode: '',
    applyToOrders: '',
    decreaseMoney: '',
    percentReduction: '',
    numberTimeUsed: '',
    expirationDate: '',
    saveCode: '',
})

const addDiscountCode = async () => {
    errors.value = {};

    if (!formData.value.nameCode) {
        errors.value.nameCode = "Tên mã giảm giá không được trống.";
    } else {
        formData.value.nameCode = escapeHtml(formData.value.nameCode);
    }

    if (!formData.value.applyToOrders) {
        errors.value.applyToOrders = "Giá áp dụng không được trống.";
    }

    if (!formData.value.saveCode) {
        errors.value.saveCode = "Số lần lưu mã không được để trống.";
    } else if (formData.value.saveCode < 0) {
        errors.value.saveCode = "Trường không thể nhập số âm."
    }

    if (formData.value.decreaseMoney && formData.value.percentReduction) {
        errors.value.decreaseMoney = "Chỉ được nhập một trong hai.";
        errors.value.percentReduction = "Chỉ được nhập một trong hai.";
    } else if (!formData.value.decreaseMoney && !formData.value.percentReduction) {
        errors.value.decreaseMoney = "Phải nhập ít nhất một trong hai.";
        errors.value.percentReduction = "Phải nhập ít nhất một trong hai.";
    }

    if (formData.value.percentReduction < 0) {
        errors.value.percentReduction = "Trường không thể nhập số âm.";
    }

    if (formData.value.decreaseMoney < 0) {
        errors.value.decreaseMoney = "Trường không thể nhập số âm.";
    }

    if (!formData.value.numberTimeUsed) {
        errors.value.numberTimeUsed = "Số lần sử dụng không được để trống.";
    } else if (formData.value.numberTimeUsed < 0) {
        errors.value.numberTimeUsed = "Trường không thể nhập số âm."
    }

    if (!formData.value.expirationDate) {
        errors.value.expirationDate = "Ngày hết hạn không được để trống.";
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }

    try {
        const dataToSend = {
            TenMaGiamGia: formData.value.nameCode,
            GiaApDung: formData.value.applyToOrders,
            SoLanSuDung: formData.value.numberTimeUsed,
            NgayHetHan: formData.value.expirationDate,
            SoLanLuuMa: formData.value.saveCode,
            NgayTao: new Date(),
        }

        if (formData.value.percentReduction) {
            dataToSend.GiamPhanTram = formData.value.percentReduction;
        } else {
            dataToSend.GiamTien = formData.value.decreaseMoney;
        }

        const response = await axios.post('http://localhost:3000/api/magiamgia', dataToSend);

        const notificationData = {
            ThongBao: `Vừa thêm mã giảm giá ${formData.value.nameCode.toLowerCase()}`,
            NguoiChinhSua: TenAdmin,
            ThoiGian: ThoiGian,
        };

        await axios.post('http://localhost:3000/api/thongbao', notificationData);

        showNotification("Thêm mã giảm giá thành công!", "success");
        setTimeout(() => {
            router.push('/admin/discountCode');
        }, 3000);
    } catch (error) {
        showNotification(error.response?.data?.message || "Thêm mã giảm giá thất bại!", "error");
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}
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
                        <h1 class="font-bold text-[20px] uppercase">Thêm mã giảm giá</h1>
                    </div>
                    <div class="bg-white rounded-lg shadow-lg w-full lg:w-[70%] mx-auto p-4">
                        <form @submit.prevent="addDiscountCode" method="POST">
                            <div class="w-full flex flex-col lg:flex-row gap-8">
                                <div class="w-full flex flex-col gap-4">
                                    <div class="flex flex-col gap-2">
                                        <label for="nameDiscountCode" class="text-[15px] font-semibold">Tên mã giảm
                                            giá</label>
                                        <input type="text" v-model="formData.nameCode" id="nameDiscountCode"
                                            class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            placeholder="Nhập tên mã giảm giá ...">
                                        <p v-if="errors.nameCode" class="text-red-500 text-sm mt-2">{{
                                            errors.nameCode }}</p>
                                    </div>
                                    <div class="flex gap-4">
                                        <div class="flex flex-col gap-2 w-full">
                                            <label for="optionDiscountCode" class="text-[15px] font-semibold">Áp dụng
                                                với
                                                đơn</label>
                                            <select v-model="formData.applyToOrders"
                                                class="p-2 border-2 cursor-pointer text-[#003171] rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                                name="" id="optionDiscountCode">
                                                <option value="" class="text-[#003171] font-semibold">
                                                    Chọn giá áp dụng phù hợp</option>
                                                <option value="6000000" class="text-[#003171] font-semibold">
                                                    6.000.000 đ</option>
                                                <option value="3000000" class="text-[#003171] font-semibold">3.000.000 đ
                                                </option>
                                                <option value="1500000" class="text-[#003171] font-semibold">1.500.000 đ
                                                </option>
                                                <option value="500000" class="text-[#003171] font-semibold">500.000 đ
                                                </option>
                                            </select>
                                            <p v-if="errors.applyToOrders" class="text-red-500 text-sm mt-2">{{
                                                errors.applyToOrders }}</p>
                                        </div>
                                        <div class="flex flex-col gap-2 w-full">
                                            <label for="saveCode" class="text-[15px] font-semibold">Số lần lưu
                                                mã</label>
                                            <input type="number" v-model="formData.saveCode" id="saveCode"
                                                class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                                placeholder="Nhập số lần lưu mã ...">
                                            <p v-if="errors.saveCode" class="text-red-500 text-sm mt-2">{{
                                                errors.saveCode }}</p>
                                        </div>
                                    </div>
                                    <div class="flex gap-4">
                                        <div class="flex flex-col gap-2 w-full">
                                            <label for="priceDiscountCode" class="text-[15px] font-semibold">Giảm với số
                                                tiền</label>
                                            <input type="number" v-model="formData.decreaseMoney" id="priceDiscountCode"
                                                class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                                placeholder="Nhập số tiền giảm ...">
                                            <p v-if="errors.decreaseMoney" class="text-red-500 text-sm mt-2">{{
                                                errors.decreaseMoney }}</p>
                                        </div>
                                        <div class="flex flex-col gap-2 w-full">
                                            <label for="percentDiscountCode" class="text-[15px] font-semibold">Giảm với
                                                %</label>
                                            <input type="number" max="100" v-model="formData.percentReduction"
                                                id="percentDiscountCode"
                                                class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                                placeholder="Nhập số % giảm ...">
                                            <p v-if="errors.percentReduction" class="text-red-500 text-sm mt-2">{{
                                                errors.percentReduction }}</p>
                                        </div>
                                    </div>
                                    <div class="flex gap-4">
                                        <div class="flex flex-col gap-2 w-full">
                                            <label for="timeUsed" class="text-[15px] font-semibold">Số lần sử
                                                dụng</label>
                                            <input type="number" v-model="formData.numberTimeUsed" id="timeUsed"
                                                class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                                placeholder="Nhập số lần sử dụng ...">
                                            <p v-if="errors.numberTimeUsed" class="text-red-500 text-sm mt-2">{{
                                                errors.numberTimeUsed }}</p>
                                        </div>
                                        <div class="flex flex-col gap-2 w-full">
                                            <label for="date" class="text-[15px] font-semibold">Ngày hết hạn</label>
                                            <input type="date" v-model="formData.expirationDate" id="date"
                                                class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]">
                                            <p v-if="errors.expirationDate" class="text-red-500 text-sm mt-2">{{
                                                errors.expirationDate }}</p>
                                        </div>
                                    </div>
                                    <div class="flex justify-center lg:justify-end">
                                        <button type="submit"
                                            class="px-5 py-2 rounded-md font-semibold text-white text-[14px] bg-[#1A1D27] transition-all duration-300 hover:bg-[#003171]">Thêm
                                            mã giảm giá</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <NotificationAdmin :message="notification.message" :type="notification.type" />
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