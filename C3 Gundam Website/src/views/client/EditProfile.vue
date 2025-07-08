<script setup>
import { ref, onMounted, computed } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import NotificationClient from "@/components/Notification/NotificationClient.vue";
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
const showNotification = (msg, type) => {
    notification.value = { message: msg, type: type };
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
};

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
    
    if (formData.value.name !== '') {
        formData.value.name = escapeHtml(formData.value.name);
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
        showNotification("Cập nhật thông tin thành công!", "success");
        setTimeout(() => {
            router.push('/profile');
        }, 3000);
    } catch (error) {
        showNotification(error.response?.data?.message || "Cập nhật thông tin thất bại!", "error");
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
    <div class="bg-gradient-to-br from-[#0F1419] via-[#1A1D27] to-[#0F1419] relative overflow-hidden min-h-screen font-sans scroll-smooth">
        <Header />
        <div class="relative my-5 m-2 lg:mx-[200px] flex justify-center items-center">
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
                                    <label for="email" class="font-semibold text-[16px]">Email</label>
                                    <input v-model="formData.email" readonly type="text" name="email" id="email"
                                        class="h-10 border font-medium mt-1 rounded px-4 w-full bg-transparent" value=""
                                        placeholder="Test@gmail.com" />
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
                                    <label for="image_upload" class="text-[15px] font-semibold text-white">Hình ảnh sản
                                        phẩm <i class="fa-solid fa-circle-info text-gray-300"></i></label>
                                    <label for="image_upload"
                                        class="border-2 border-gray-400 mt-2 cursor-pointer border-dashed rounded-md p-8 text-center flex flex-col items-center justify-center">
                                        <div class="text-[18px] text-slate-300" id="image_icon">
                                            <i class="fa-regular fa-image"></i>
                                        </div>
                                        <label for="image_upload" class="text-[12px] text-gray-500 cursor-pointer">
                                            Thả hình ảnh vào đây, hoặc chọn <span
                                                class="text-[#003171] cursor-pointer">nhấp để
                                                duyệt</span>
                                        </label>
                                        <input type="file" class="hidden" name="image" id="image_upload" @change="event => {
                                            formData.image = Array.from(event.target.files);
                                        }" />
                                        <div class="flex flex-wrap justify-center gap-2 mt-2">
                                            <img v-for="(imageUrl, index) in imageUrls" :key="index" :src="imageUrl"
                                                class="w-24 h-24 object-cover border rounded-md" />
                                        </div>
                                    </label>
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
            <NotificationClient :message="notification.message" :type="notification.type" />
        </div>
        <Footer />
        <BackToTop />
    </div>
</template>