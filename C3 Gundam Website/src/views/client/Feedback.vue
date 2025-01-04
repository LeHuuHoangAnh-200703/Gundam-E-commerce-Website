<script setup>
import { onMounted, ref, computed } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import axios from "axios";
import { useRouter } from 'vue-router';

const router = useRouter();
const listOrders = ref([]);
const avatar = ref('');
const errors = ref({});
const formData = ref({
    nameCustomer: '',
    idCustomer: '',
    description: '',
    images: [],
})
const rating = ref(0);

const notification = ref({
    message: '',
    type: ''
});
const setRating = (star) => {
    rating.value = star;
};

const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const fetchOrder= async (maDonHang) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/donhang/${maDonHang}`);
        listOrders.value = response.data.SanPhamDaMua;
        formData.value.nameCustomer = response.data.TenKhachHang;
        formData.value.idCustomer = response.data.MaKhachHang;
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

const fetchCustomer = async (maKhachHang) => {
    try {
        const result = await axios.get(`http://localhost:3000/api/khachhang/${maKhachHang}`);
        avatar.value = result.data.Image;
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

const handleFileUpload = (event) => {
    formData.value.images = Array.from(event.target.files);
};

const createFeedBack = async () => {
    errors.value = {};

    if (rating.value <= 0) {
        errors.value.rating = "Vui lòng đánh giá chất lượng.";
    }

    if (formData.value.description) {
        formData.value.description = escapeHtml(formData.value.description);
    }

    if (formData.value.images.length > 10) {
        errors.value.images = "Chỉ được thêm tối đa 10 hình ảnh."
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }

    const danhSachSanPham = listOrders.value.map(product => ({
        TenSanPham: product.TenSanPham || '',
        MaSanPham: product.MaSanPham || '',
        Gia: product.Gia || 0,
        SoLuong: product.SoLuong || 0,
        LoaiSanPham: product.LoaiSanPham || '',
        HinhAnh: product.HinhAnh || ''
    }))

    try {
        const dataToSend = new FormData();
        dataToSend.append('TenKhachHang', formData.value.nameCustomer);
        dataToSend.append('MaKhachHang', formData.value.idCustomer);
        dataToSend.append('ChatLuong', rating.value);
        dataToSend.append('HinhAnhKhachHang', avatar.value);
        dataToSend.append('MoTa', formData.value.description);
        dataToSend.append('NgayDang', new Date());
        dataToSend.append('SanPhamDaDanhGia', JSON.stringify(danhSachSanPham));
        formData.value.images.forEach(image => {
            dataToSend.append('HinhAnhSanPham', image);
        });

        const response = await axios.post('http://localhost:3000/api/danhgia', dataToSend);
        notification.value = {
            message: "Cảm ơn bạn đã góp ý về sản phẩm!",
            type: "success",
        };
        setTimeout(() => {
            router.push('/orders_history');
        }, 3000);
    } catch (error) {
        notification.value = {
            message: error.response?.data?.message || "Đánh giá thất bại!",
            type: "error",
        };
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}

const imageUrls = computed(() => {
    return formData.value.images.map(image => URL.createObjectURL(image));
});

onMounted(() => {
    const idDanhGia = router.currentRoute.value.params.maDanhGia;
    fetchOrder(idDanhGia);
    const maKhachHang = localStorage.getItem('MaKhachHang');
    fetchCustomer(maKhachHang);
})
</script>

<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="relative mb-5 m-2 lg:mx-[200px] flex items-center flex-col flex-grow">
            <div class="w-full m-4">
                <div
                    class="bg-[#242424] flex flex-col mb-5 overflow-hidden px-4 py-3 rounded [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                    <h1 class="text-white text-[20px] font-semibold">Thực hiện đánh giá</h1>
                    <hr class="my-2">
                    <div class="flex gap-4 border-b-2 pb-4 mb-3" v-for="(order, index) in listOrders" :key="index">
                        <img :src="`/src/assets/img/${order.HinhAnh}`" class="w-[60px]" alt="">
                        <div class="flex flex-col gap-1 justify-center">
                            <div class="lg:w-full w-56 whitespace-nowrap text-ellipsis overflow-hidden">
                                <p class="text-white text-[14px] overflow-hidden text-ellipsis whitespace-nowrap">{{
                                    order.TenSanPham }}</p>
                            </div>
                            <p class="text-[14px] text-white font-medium">Loại sản phẩm: {{ order.LoaiSanPham }}</p>
                        </div>
                    </div>
                    <form @submit.prevent="createFeedBack" method="POST" class="my-4 flex flex-col gap-4">
                        <div class="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                            <label for="rating" class="font-semibold text-white mr-4">Chất lượng sản phẩm: </label>
                            <div id="rating" class="flex items-center gap-2">
                                <span v-for="star in 5" :key="star" class="cursor-pointer">
                                    <i :class="['fa-star', rating >= star ? 'fas text-[#FFD700]' : 'far text-gray-400']"
                                        @click="setRating(star)"></i>
                                </span>
                            </div>
                            <p v-if="errors.rating" class="text-red-500 text-sm mt-2">{{ errors.rating }}</p>
                        </div>
                        <div class="flex flex-col gap-4">
                            <label for="description" class="font-semibold text-white mr-4">Mô tả:</label>
                            <textarea v-model="formData.description"
                                class="w-full h-[150px] rounded-md outline-none p-5 font-semibold"
                                placeholder="Đánh giá của bạn ..." name="description" id="description" cols="30"
                                rows="10"></textarea>
                            <p v-if="errors.description" class="text-red-500 text-sm mt-2">{{ errors.description }}</p>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label for="image_upload" class="text-[15px] font-semibold text-white">Hình ảnh sản phẩm <i
                                    class="fa-solid fa-circle-info text-gray-300"></i></label>
                            <label for="image_upload"
                                class="border-2 border-gray-400 cursor-pointer border-dashed rounded-md p-8 text-center flex flex-col items-center justify-center">
                                <div class="text-[18px] text-slate-300" id="image_icon">
                                    <i class="fa-regular fa-image"></i>
                                </div>
                                <label for="image_upload" class="text-[12px] text-gray-500 cursor-pointer">
                                    Thả hình ảnh vào đây, hoặc chọn <span class="text-[#003171] cursor-pointer">nhấp để
                                        duyệt</span>
                                </label>
                                <input type="file" class="hidden" id="image_upload" multiple @change="handleFileUpload">
                                <div class="flex flex-wrap justify-center gap-2 mt-2">
                                    <img v-for="(imageUrl, index) in imageUrls" :key="index" :src="imageUrl"
                                        class="w-24 h-24 object-cover border rounded-md" />
                                </div>
                            </label>
                            <p v-if="errors.images" class="text-red-500 text-sm mt-2">{{ errors.images }}</p>
                            <p class="text-white text-sm">Bạn có thể thêm tối đa 10 hình ảnh. Hãy chú ý đến
                                chất lượng của các bức ảnh bạn thêm.</p>
                        </div>
                        <div class="text-right mt-2">
                            <div class="inline-flex items-end">
                                <button type="submit"
                                    class="bg-[#333f48] hover:bg-[#DB3F4C] text-white font-bold py-2 px-5 rounded">Đánh
                                    giá</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <!-- <div class="flex justify-center items-center m-auto w-full">
            <div class="flex flex-col items-center justify-center gap-3">
                <p class="font-semibold text-white text-[18px] lg:text-[24px] text-center">Hiện tại không có đơn hàng nào!</p>
                <img src="../../assets/img/banner.png" class="w-[200px]" alt="">
            </div>
        </div> -->
        <Footer />
        <BackToTop />
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
</template>

<style scoped>
.fa-star {
    font-size: 24px;
    transition: color 0.2s;
}

.fa-star:hover {
    color: #ffd700;
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