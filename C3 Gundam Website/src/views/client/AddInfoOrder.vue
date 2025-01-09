<script setup>
import { ref, onMounted, computed } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import axios from 'axios';
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
const formData = ref({
    phone: '',
    address: ''
});

const notification = ref({
    message: '',
    type: ''
});

const fetchCustomer = async (idKhachHang) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/khachhang/${idKhachHang}`);
        formData.value.name = response.data.TenKhachHang;
        formData.value.email = response.data.Email;
        formData.value.idKhachHang = response.data.MaKhachHang;
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

const addInfoOrder = async () => {
    errors.value = {};

    if (!formData.value.address) {
        errors.value.address = "Vui lòng nhập địa chỉ.";
    } else {
        formData.value.address = escapeHtml(formData.value.address);
    }

    if (!formData.value.phone) {
        errors.value.phone = "Vui lòng nhập số điện thoại.";
    } else {
        formData.value.phone = escapeHtml(formData.value.phone);
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }

    try {
        const dataToSend = {
            DanhSachDiaChi: {
                DienThoai: formData.value.phone,
                DiaChi: formData.value.address
            }
        }

        const response = await axios.post('http://localhost:3000/api/khachhang/thongtin', dataToSend);
        notification.value = {
            message: "Thêm thông tin thành công!",
            type: "success",
        };
        setTimeout(() => {
            router.push('/profile');
        }, 3000);
    } catch (error) {
        notification.value = {
            message: error.response?.data?.message || "Thêm thông tin thất bại!",
            type: "error",
        };
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}

onMounted(() => {
    const idKhachHang = router.currentRoute.value.params.maKhachHang;
    console.log(idKhachHang);
    fetchCustomer(idKhachHang);
})
</script>


<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="relative my-5 m-2 lg:mx-[200px] flex justify-center items-center flex-grow">
            <div class="w-full m-4">
                <div
                    class="bg-[#242424] overflow-hidden px-6 py-3 rounded [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                    <div class="grid gap-8 lg:gap-5 text-sm text-white grid-cols-1 lg:grid-cols-3">
                        <div class="font-semibold">
                            <p class="text-lg">Cập nhật thông tin để đặt hàng</p>
                            <p>Vui lòng điền thông tin đầy đủ.</p>
                        </div>
                        <div class="lg:col-span-2">
                            <form @submit.prevent="addInfoOrder" method="POST"
                                class="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5"
                                enctype="multipart/form-data">
                                <div class="md:col-span-5 mb-2">
                                    <label for="full_name" class="font-semibold text-[16px]">Họ tên</label>
                                    <input v-model="formData.name" type="text" name="name" id="full_name"
                                        placeholder="Nhập họ tên ..."
                                        class="h-10 border font-medium mt-1 rounded px-4 w-full bg-transparent"
                                        value="" />
                                    <p v-if="errors.name" class="text-red-500 text-sm my-2">{{ errors.name }}</p>
                                </div>
                                <div class="md:col-span-5 mb-2">
                                    <label for="email" class="font-semibold text-[16px]">Địa chỉ email</label>
                                    <input v-model="formData.email" type="text" name="email" id="email"
                                        class="h-10 border font-medium mt-1 rounded px-4 w-full bg-transparent" value=""
                                        placeholder="email@domain.com" />
                                    <p v-if="errors.email" class="text-red-500 text-sm my-2">{{ errors.email }}</p>
                                </div>
                                <div class="md:col-span-3 mb-2">
                                    <label for="address" class="font-semibold text-[16px]">Địa chỉ</label>
                                    <input v-model="formData.address" type="text" name="address" id="address"
                                        class="h-10 border font-medium mt-1 rounded px-4 w-full bg-transparent outline-none" value=""
                                        placeholder="Nhập địa chỉ nhận hàng ..." />
                                    <p v-if="errors.address" class="text-red-500 text-sm my-2">{{ errors.address }}
                                    </p>
                                </div>
                                <div class="md:col-span-2 mb-2">
                                    <label for="phone" class="font-semibold text-[16px]">Điện thoại</label>
                                    <input type="text" v-model="formData.phone" placeholder="079-xxx-xxxx"
                                        class="h-10 border font-medium mt-1 rounded px-4 w-full bg-transparent" />
                                    <p v-if="errors.phone" class="text-red-500 text-sm mt-2">{{
                                        errors.phone }}</p>
                                </div>
                                <div class="md:col-span-5 text-right mt-2">
                                    <div class="inline-flex items-end">
                                        <button type="submit"
                                            class="bg-[#333f48] hover:bg-[#DC143C] text-white font-bold py-2 px-4 rounded">Cập
                                            nhật</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <transition name="slide-fade" mode="out-in">
                <div v-if="notification.message" :class="['fixed top-4 right-4 p-4 bg-white shadow-lg border-t-4 rounded z-10 flex items-center space-x-2', {
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
        <Footer />
        <BackToTop />
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