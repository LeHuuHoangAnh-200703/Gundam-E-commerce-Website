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
    idKhachHang: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    image: [],
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

const editProfile = async () => {
    errors.value = {};
    const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

    if (formData.value.name !== '') {
        formData.value.name = escapeHtml(formData.value.name);
    }

    if (formData.value.email !== '') {
        if (!emailRegex.test(formData.value.email)) {
            errors.value.email = "Email không đúng định dạng!";
        } else {
            formData.value.email = escapeHtml(formData.value.email);
        }
    }

    if (formData.value.password !== "" || formData.value.confirmPassword !== "") {
        if (formData.value.password.length < 6) {
            errors.value.password = "Mật khẩu phải tối thiểu 6 ký tự!";
        }
        if (formData.value.confirmPassword.length < 6) {
            errors.value.confirmPassword = "Mật khẩu phải tối thiểu 6 ký tự!";
        } else if (formData.value.confirmPassword !== formData.value.password) {
            errors.value.confirmPassword = "Mật khẩu nhập lại không chính xác!";
        }
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }

    try {
        const dataToSend = {
            TenKhachHang: formData.value.name,
            Email: formData.value.email
        }

        if (formData.value.password !== "") {
            dataToSend.password = formData.value.password;
        }

        if (formData.value.image.length > 0) {
            dataToSend.Image = formData.value.image[0];
        }

        const response = await axios.put(`http://localhost:3000/api/khachhang/${formData.value.idKhachHang}`, dataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        notification.value = {
            message: "Cập nhật thông tin thành công!",
            type: "success",
        };
        setTimeout(() => {
            router.push('/profile');
        }, 3000);
    } catch (error) {
        notification.value = {
            message: error.response?.data?.message || "Cập nhật thông tin thất bại!",
            type: "error",
        };
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}

const imageUrls = computed(() => {
    return formData.value.image.map(img => URL.createObjectURL(img));
});

onMounted(() => {
    const idKhachHang = router.currentRoute.value.params.maKhachHang;
    console.log(idKhachHang);
    fetchCustomer(idKhachHang);
})
</script>


<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth">
        <Header />
        <div class="relative my-5 m-2 lg:mx-[200px] xl:mx-[100px] flex justify-center items-center">
            <div class="w-full m-4">
                <div
                    class="bg-[#242424] overflow-hidden px-6 py-3 rounded [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                    <div class="grid gap-8 lg:gap-5 text-sm text-white grid-cols-1 lg:grid-cols-3">
                        <div class="font-semibold">
                            <p class="text-lg">Thông tin cá nhân</p>
                            <p>Vui lòng điền thông tin đầy đủ.</p>
                        </div>
                        <div class="lg:col-span-2">
                            <form @submit.prevent="editProfile" method="POST"
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
                                    <label for="password" class="font-semibold text-[16px]">Mật khẩu mới</label>
                                    <input v-model="formData.password" type="password" name="password" id="password"
                                        class="h-10 border font-medium mt-1 rounded px-4 w-full bg-transparent" value=""
                                        placeholder="Nhập mật khẩu mới ..." />
                                    <p v-if="errors.password" class="text-red-500 text-sm my-2">{{ errors.password }}
                                    </p>
                                </div>
                                <div class="md:col-span-2 mb-2">
                                    <label for="ConfirmPassword" class="font-semibold text-[16px]">Nhập lại mật khẩu
                                        mới</label>
                                    <input v-model="formData.confirmPassword" type="password" name="ConfirmPassword"
                                        id="ConfirmPassword"
                                        class="h-10 border font-medium mt-1 rounded px-4 w-full bg-transparent" value=""
                                        placeholder="Nhập lại mật khẩu ..." />
                                    <p v-if="errors.confirmPassword" class="text-red-500 text-sm my-2">{{
                                        errors.confirmPassword }}</p>
                                </div>

                                <div class="md:col-span-5 my-2">
                                    <label for="city" class="font-semibold text-[16px]">Ảnh của bạn : </label>
                                    <input type="file" name="image" id="imageInput" @change="event => {
                                        formData.image = Array.from(event.target.files);
                                    }" />
                                </div>
                                <div
                                    class="border-2 md:col-span-5 p-5 h-[200px] rounded-md flex justify-center items-center">
                                    <div v-if="imageUrls.length > 0">
                                        <img v-for="(imageUrl, index) in imageUrls" :key="index" :src="imageUrl"
                                            class="w-40 h-40 object-cover" />
                                    </div>
                                    <div v-else class="text-[60px] text-slate-300" id="image_icon">
                                        <i class="fa-regular fa-image"></i>
                                    </div>
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