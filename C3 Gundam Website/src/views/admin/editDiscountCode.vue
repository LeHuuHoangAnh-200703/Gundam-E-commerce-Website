<script setup>
import { ref, onMounted } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
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
const ChucVu = localStorage.getItem("ChucVu");
const ThoiGian = new Date();

const notification = ref({
    message: '',
    type: ''
});

const formData = ref({
    idCode: '',
    nameCode: '',
    applyToOrders: '',
    decreaseMoney: '',
    percentReduction: '',
    numberTimeUsed: '',
    expirationDate: '',
    discountCode: '',
})

const fetchDiscountCode = async (idMaGG) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/magiamgia/${idMaGG}`);
        console.log(response.data)
        formData.value.idCode = response.data.IdMaGiamGia;
        formData.value.nameCode = response.data.TenMaGiamGia;
        formData.value.applyToOrders = response.data.GiaApDung;
        formData.value.decreaseMoney = response.data.GiamTien;
        formData.value.percentReduction = response.data.GiamPhanTram;
        formData.value.numberTimeUsed = response.data.SoLanSuDung;
        formData.value.discountCode = response.data.MaGiamGia;
        const date = new Date(response.data.NgayHetHan);
        const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        formData.value.expirationDate = localDate.toISOString().slice(0, 10);
    } catch (err) {
        console.error('Error fetching:', err);
    }
}

const editDiscountCode = async () => {
    errors.value = {};

    if (!formData.value.nameCode) {
        errors.value.nameCode = "Tên mã giảm giá không được trống.";
    } else {
        formData.value.nameCode = escapeHtml(formData.value.nameCode);
    }

    if (!formData.value.applyToOrders) {
        errors.value.applyToOrders = "Giá áp dụng không được trống.";
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

    if (!formData.value.discountCode) {
        errors.value.discountCode = "Mã giảm giá không được để trống.";
    } else if (formData.value.discountCode >= 3) {
        errors.value.discountCode = "Mã giảm giá phải tối thiểu 3 ký tự."
    } else {
        formData.value.discountCode = escapeHtml(formData.value.discountCode);
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
            MaGiamGia: formData.value.discountCode,
        }

        if (formData.value.percentReduction) {
            dataToSend.GiamPhanTram = formData.value.percentReduction;
        } else {
            dataToSend.GiamTien = formData.value.decreaseMoney;
        }

        const response = await axios.put(`http://localhost:3000/api/magiamgia/${formData.value.idCode}`, dataToSend);
        
        const notificationData = {
            ThongBao: `Vừa cập nhật mã giảm giá ${formData.value.nameCode.toLowerCase()}`,
            NguoiChinhSua: TenAdmin,
            ChucVu: ChucVu,
            ThoiGian: ThoiGian,
        };

        await axios.post('http://localhost:3000/api/thongbao', notificationData);
        
        notification.value = {
            message: "Cập nhật mã giảm giá thành công!",
            type: "success",
        };
        setTimeout(() => {
            router.push('/admin/discountCode');
        }, 3000);
    } catch (error) {
        notification.value = {
            message: error.response?.data?.message || "Cập nhật mã giảm giá thất bại!",
            type: "error",
        };
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}

onMounted(() => {
    const idMaGG = router.currentRoute.value.params.idMaGG;
    console.log(idMaGG);
    fetchDiscountCode(idMaGG);
}); 
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full min-h-screen font-sans">
        <div class="flex gap-3">
            <SideBar />
            <div class="relative p-4 flex flex-col gap-4 w-full overflow-auto">
                <Navbar />
                <div class="w-full relative flex flex-col gap-4 overflow-auto max-h-[calc(100vh-120px)] pb-7">
                    <div class="flex lg:flex-row flex-col gap-4 justify-center items-center">
                        <h1 class="font-bold text-[20px] uppercase xl:text-[16px]">Chỉnh sửa mã giảm giá</h1>
                    </div>
                    <div class="bg-white rounded-lg shadow-lg w-full lg:w-[70%] mx-auto p-4">
                        <form @submit.prevent="editDiscountCode" method="POST">
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
                                    <div class="flex flex-col gap-2">
                                        <label for="optionDiscountCode" class="text-[15px] font-semibold">Áp dụng với
                                            đơn</label>
                                        <select v-model="formData.applyToOrders"
                                            class="p-2 border-2 cursor-pointer text-[#003171] rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            name="" id="optionDiscountCode">
                                            <option value="" class="text-[#003171] font-semibold">
                                                Chọn giá áp dụng phù hợp</option>
                                            <option value="6000000" class="text-[#003171] font-semibold">
                                                6.000.000 VNĐ</option>
                                            <option value="3000000" class="text-[#003171] font-semibold">3.000.000 VNĐ
                                            </option>
                                            <option value="1500000" class="text-[#003171] font-semibold">1.500.000 VNĐ
                                            </option>
                                            <option value="500000" class="text-[#003171] font-semibold">500.000 VNĐ
                                            </option>
                                        </select>
                                        <p v-if="errors.applyToOrders" class="text-red-500 text-sm mt-2">{{
                                            errors.applyToOrders }}</p>
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
                                            <label for="timeUsed" class="text-[15px] font-semibold">Số lượt sử
                                                dụng</label>
                                            <input type="number" v-model="formData.numberTimeUsed" id="timeUsed"
                                                class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                                placeholder="Nhập số lượt sử dụng ...">
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
                                    <div class="flex flex-col gap-2">
                                        <label for="discountCode" class="text-[15px] font-semibold">Mã giảm giá</label>
                                        <input type="text" v-model="formData.discountCode" id="discountCode"
                                            class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            placeholder="Nhập mã giảm giá ...">
                                        <p v-if="errors.discountCode" class="text-red-500 text-sm mt-2">{{
                                            errors.discountCode }}</p>
                                    </div>
                                    <div class="flex justify-center lg:justify-end">
                                        <button type="submit"
                                            class="px-5 py-2 rounded-md font-semibold text-white text-[14px] bg-[#1A1D27] transition-all duration-300 hover:bg-[#003171]">Chỉnh
                                            sửa
                                            mã giảm giá</button>
                                    </div>
                                </div>
                            </div>
                        </form>
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