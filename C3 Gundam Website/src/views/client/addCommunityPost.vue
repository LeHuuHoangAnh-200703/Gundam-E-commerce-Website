<script setup>
import { ref, onMounted, computed } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import NotificationClient from "@/components/Notification/NotificationClient.vue";
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

// --- CẤU HÌNH URL ĐỘNG ---
// Lấy link từ file .env hoặc Netlify. Nếu không có thì dùng localhost.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// -------------------------

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
    title: '',
    content: '',
    category: '',
    image: []
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

const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);

    // Giới hạn tối đa 4 ảnh
    const remainingSlots = 4 - formData.value.image.length;
    const filesToAdd = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
        showNotification(`Chỉ được đăng tối đa 4 ảnh. ${files.length - remainingSlots} ảnh đã bị bỏ qua.`, "error");
    }

    formData.value.image = [...formData.value.image, ...filesToAdd];
    event.target.value = '';
};

const removeImage = (index) => {
    formData.value.image.splice(index, 1);
};

const addCommunityPost = async () => {
    errors.value = {};

    if (!formData.value.title) {
        errors.value.title = "Tiêu đề không được để trống.";
    } else {
        formData.value.title = escapeHtml(formData.value.title);
    }

    if (!formData.value.content) {
        errors.value.content = "Nội dung không được để trống.";
    } else {
        formData.value.content = escapeHtml(formData.value.content);
    }

    if (!formData.value.category) {
        errors.value.category = "Loại bài đăng không được để trống.";
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }

    try {
        const dataToSend = new FormData();
        dataToSend.append('TieuDe', formData.value.title);
        dataToSend.append('NoiDung', formData.value.content);
        dataToSend.append('MaKhachHang', router.currentRoute.value.params.maKhachHang);
        dataToSend.append('LoaiBaiDang', formData.value.category);
        dataToSend.append('HinhAnh', img);
        formData.value.image.forEach(img => {
            dataToSend.append('HinhAnh', img);
        });

        // SỬA 1: Thay localhost bằng API_URL
        const response = await axios.post(`${API_URL}/api/baidang`, dataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        const nameCustomer = localStorage.getItem('TenKhachHang');
        const ThoiGian = new Date();

        const notificationData = {
            ThongBao: `${nameCustomer} vừa đăng bài!`,
            NguoiChinhSua: nameCustomer,
            ThoiGian: ThoiGian,
        };

        // SỬA 2: Thay localhost bằng API_URL
        await axios.post(`${API_URL}/api/thongbao`, notificationData);

        showNotification("Đăng bài thành công và chờ duyệt!", "success");
        setTimeout(() => {
            router.push('/communityPost');
        }, 3000);
    } catch (error) {
        // SỬA 3: Đổi 'err' thành 'error' cho khớp với khai báo catch(error)
        showNotification(error.response?.data?.message || "Thêm bài đăng thất bại!", "error"); // Đổi type thành 'error' cho đúng ngữ cảnh
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}

const imageUrls = computed(() => {
    return formData.value.image.map(img => URL.createObjectURL(img));
});
</script>

<template>
    <div class="bg-gradient-to-br from-[#0F1419] via-[#1A1D27] to-[#0F1419] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="relative my-5 m-2 lg:mx-[200px] flex flex-col flex-grow justify-center items-center">
            <div class="w-full m-4">
                <div
                    class="bg-[#242424] overflow-hidden px-6 py-3 rounded [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                    <div class="grid gap-8 lg:gap-5 text-sm text-white grid-cols-1 lg:grid-cols-3">
                        <div class="font-semibold">
                            <p class="text-lg uppercase">Đăng bài đến cộng đồng</p>
                            <p>Vui lòng điền thông tin đầy đủ.</p>
                        </div>
                        <div class="lg:col-span-2">
                            <form @submit.prevent="addCommunityPost" method="POST"
                                class="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5"
                                enctype="multipart/form-data">
                                <div class="md:col-span-5 mb-2 flex flex-col gap-2">
                                    <label for="title" class="font-semibold text-[16px]">Tiêu đề bài đăng</label>
                                    <input v-model="formData.title" type="text" name="title" id="title"
                                        placeholder="Nhập tiêu đề ..."
                                        class="h-10 border font-medium mt-1 rounded px-4 w-full bg-transparent"
                                        value="" />
                                    <p v-if="errors.title" class="text-red-500 text-sm my-2">{{ errors.title }}</p>
                                </div>
                                <div class="md:col-span-5 mb-2 flex flex-col gap-2">
                                    <label for="content" class="font-semibold text-[16px]">Nội dung bài đăng</label>
                                    <input v-model="formData.content" type="text" name="content" id="content"
                                        placeholder="Nhập nội dung ..."
                                        class="h-10 border font-medium mt-1 rounded px-4 w-full bg-transparent"
                                        value="" />
                                    <p v-if="errors.content" class="text-red-500 text-sm my-2">{{ errors.content }}</p>
                                </div>
                                <div class="md:col-span-5 mb-2 flex flex-col gap-2">
                                    <label for="category" class="font-semibold text-[16px]">Loại bài đăng</label>
                                    <select v-model="formData.category"
                                        class="p-2 border font-medium mt-1 rounded px-4 w-full bg-transparent" name=""
                                        id="category">
                                        <option value="" class="text-[#003171] font-semibold">Chọn loại bài đăng
                                            phù hợp</option>
                                        <option value="Assemble" class="text-[#003171] font-semibold">Hướng dẫn lắp ráp
                                        </option>
                                        <option value="Collect" class="text-[#003171] font-semibold">Gundam sưu tầm
                                        </option>
                                        <option value="GundamNew" class="text-[#003171] font-semibold">Gundam mới ra mắt
                                        </option>
                                        <option value="Custom" class="text-[#003171] font-semibold">Custom Gundam
                                        </option>
                                    </select>
                                    <p v-if="errors.category" class="text-red-500 text-sm my-2">{{ errors.category }}
                                    </p>
                                </div>
                                <div class="md:col-span-5 mb-2 flex flex-col gap-2">
                                    <label for="image_upload" class="text-[15px] font-semibold text-white">Hình ảnh <i
                                            class="fa-solid fa-circle-info text-gray-300"></i></label>
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
                                        <input type="file" class="hidden" name="image" multiple id="image_upload"
                                            @change="handleFileUpload" />
                                        <div class="flex flex-wrap justify-center gap-2 mt-2"
                                            v-if="formData.image.length > 0">
                                            <div v-for="(imageUrl, index) in imageUrls" :key="index"
                                                class="relative group">
                                                <img :src="imageUrl" class="w-24 h-24 object-cover border rounded-md" />
                                                <button type="button" @click="removeImage(index)"
                                                    class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <i class="fa-solid fa-xmark"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </label>
                                    <p class="text-gray-500 text-sm">Lưu ý, chỉ được đăng tối đa 4 ảnh.</p>
                                </div>
                                <div class="md:col-span-5 text-right mt-2">
                                    <div class="inline-flex items-end">
                                        <button type="submit"
                                            class="bg-[#333f48] hover:bg-[#DC143C] text-white font-bold py-2 px-4 rounded">Đăng
                                            bài</button>
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