<script setup>
import { onMounted, ref, computed } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import NotificationClient from "@/components/Notification/NotificationClient.vue";
import axios from "axios";
import { useRouter } from 'vue-router';

const router = useRouter();
const listOrders = ref([]);
const idDonHang = ref('');
const selectedProduct = ref(null);
const reviewedProducts = ref(new Set()); // Lưu ID sản phẩm đã đánh giá
const errors = ref({});
const formData = ref({
    idCustomer: '',
    description: '',
    images: [],
})
const rating = ref(0);
const showReviewForm = ref(false);

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

const fetchOrder = async (maDonHang) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/donhang/${maDonHang}`);
        listOrders.value = response.data.SanPhamDaMua;
        formData.value.idCustomer = response.data.MaKhachHang;
        
        // Kiểm tra trạng thái đánh giá của đơn hàng
        await checkOrderReviewStatus(maDonHang);
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

const checkOrderReviewStatus = async (maDonHang) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/danhgia/order-status/${maDonHang}`);
        const reviewedProductIds = response.data.products
            .filter(product => product.isReviewed)
            .map(product => product.maSanPham);
        
        reviewedProducts.value = new Set(reviewedProductIds);
    } catch (err) {
        console.log("Error checking review status: ", err);
    }
}

const selectProductToReview = (product) => {
    if (reviewedProducts.value.has(product.MaSanPham)) {
        showNotification("Sản phẩm này đã được đánh giá rồi!", "error");
        return;
    }
    
    selectedProduct.value = product;
    console.log(selectedProduct.value)
    showReviewForm.value = true;
    rating.value = 0;
    formData.value.description = '';
    formData.value.images = [];
    errors.value = {};
};

const cancelReview = () => {
    selectedProduct.value = null;
    showReviewForm.value = false;
    rating.value = 0;
    formData.value.description = '';
    formData.value.images = [];
    errors.value = {};
};

const handleFileUpload = (event) => {
    formData.value.images = Array.from(event.target.files);
};

const createFeedBack = async () => {
    errors.value = {};

    if (!selectedProduct.value) {
        showNotification("Vui lòng chọn sản phẩm để đánh giá!", "error");
        return;
    }

    if (rating.value <= 0) {
        errors.value.rating = "Vui lòng đánh giá chất lượng.";
    }

    if (formData.value.description) {
        formData.value.description = escapeHtml(formData.value.description);
    } else if (formData.value.description === '') {
        errors.value.description = "Vui lòng không để trống."
    }

    if (formData.value.images.length > 10) {
        errors.value.images = "Chỉ được thêm tối đa 10 hình ảnh."
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }

    try {
        const dataToSend = new FormData();
        dataToSend.append('maDonHang', idDonHang.value);
        dataToSend.append('maSanPham', selectedProduct.value.MaSanPham);
        dataToSend.append('maKhachHang', formData.value.idCustomer);
        dataToSend.append('chatLuong', rating.value);
        dataToSend.append('moTa', formData.value.description);
        dataToSend.append('tenSanPham', selectedProduct.value.TenSanPham);
        dataToSend.append('loaiSanPham', selectedProduct.value.LoaiSanPham);
        dataToSend.append('hinhAnhSanPham', selectedProduct.value.HinhAnh);
        
        formData.value.images.forEach(image => {
            dataToSend.append('HinhAnhSanPham', image);
        });

        const response = await axios.post('http://localhost:3000/api/danhgia', dataToSend);
        showNotification(response.data.message, "success");
        
        // Thêm sản phẩm vào danh sách đã đánh giá
        reviewedProducts.value.add(selectedProduct.value.MaSanPham);
        
        // Đóng form đánh giá
        cancelReview();
        
        // Kiểm tra xem đã đánh giá hết tất cả sản phẩm chưa
        if (reviewedProducts.value.size === listOrders.value.length) {
            setTimeout(() => {
                showNotification("Bạn đã đánh giá xong tất cả sản phẩm!", "success");
                setTimeout(() => {
                    router.push('/orders_history');
                }, 2000);
            }, 1000);
        }
        
    } catch (error) {
        showNotification(error.response?.data?.message || "Đánh giá thất bại!", "error");
    }
}

const imageUrls = computed(() => {
    return formData.value.images.map(image => URL.createObjectURL(image));
});

const getReviewProgress = computed(() => {
    return `${reviewedProducts.value.size}/${listOrders.value.length}`;
});

const canCompleteOrder = computed(() => {
    return reviewedProducts.value.size === listOrders.value.length;
});

onMounted(() => {
    const idDanhGia = router.currentRoute.value.params.maDanhGia;
    idDonHang.value = idDanhGia;
    fetchOrder(idDanhGia);
    window.scrollTo(0, 0);
})
</script>

<template>
    <div class="bg-gradient-to-br from-[#0F1419] via-[#1A1D27] to-[#0F1419] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="relative mb-5 m-2 lg:mx-[200px] flex items-center flex-col flex-grow">
            <div class="w-full m-4">
                <div class="bg-[#242424] flex flex-col mb-5 overflow-hidden px-4 py-3 rounded [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                    <div class="flex justify-between items-center">
                        <h1 class="text-white text-[20px] font-semibold">Đánh giá sản phẩm</h1>
                        <div class="text-white text-sm">
                            Tiến độ: <span class="text-[#FFD700] font-semibold">{{ getReviewProgress }}</span>
                        </div>
                    </div>
                    <hr class="my-2">
                    <div class="mb-4">
                        <h3 class="text-white text-[16px] font-medium mb-3">Chọn sản phẩm để đánh giá:</h3>
                        <div class="space-y-3">
                            <div 
                                v-for="(order, index) in listOrders" 
                                :key="index"
                                class="flex gap-4 p-3 border rounded-lg cursor-pointer transition-all duration-200"
                                :class="{
                                    'border-green-500 bg-green-900/20': reviewedProducts.has(order.MaSanPham),
                                    'border-gray-400 hover:border-blue-400 hover:bg-blue-900/10': !reviewedProducts.has(order.MaSanPham),
                                    'border-blue-500 bg-blue-900/20': selectedProduct?.MaSanPham === order.MaSanPham
                                }"
                                @click="selectProductToReview(order)"
                            >
                                <img :src="`${order.HinhAnh}`" class="w-[60px] h-[60px] object-cover rounded" alt="">
                                <div class="flex flex-col gap-1 justify-center flex-grow">
                                    <div class="lg:w-[700px] w-40 whitespace-nowrap text-ellipsis overflow-hidden">
                                        <p class="text-white text-[14px] overflow-hidden text-ellipsis whitespace-nowrap">
                                            {{ order.TenSanPham }}
                                        </p>
                                    </div>
                                    <p class="text-[14px] text-white font-medium">Loại: {{ order.LoaiSanPham }}</p>
                                    <p class="text-[12px] text-gray-400">Số lượng: {{ order.SoLuong }}</p>
                                </div>
                                <div class="flex items-center">
                                    <span v-if="reviewedProducts.has(order.MaSanPham)" 
                                          class="text-green-400 text-sm flex items-center gap-1">
                                        <i class="fas fa-check-circle"></i> Đã đánh giá
                                    </span>
                                    <span v-else class="text-gray-400 text-sm">
                                        Chưa đánh giá
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="showReviewForm && selectedProduct" class="border-t pt-4">
                        <div class="bg-[#333333] p-4 rounded-lg mb-4">
                            <h3 class="text-white text-[16px] font-medium mb-2">
                                Đánh giá sản phẩm: {{ selectedProduct.TenSanPham }}
                            </h3>
                            <div class="flex gap-3">
                                <img :src="`${selectedProduct.HinhAnh}`" class="w-[50px] h-[50px] object-cover rounded" alt="">
                                <div>
                                    <p class="text-gray-300 text-sm">{{ selectedProduct.LoaiSanPham }}</p>
                                    <p class="text-gray-400 text-xs">Số lượng: {{ selectedProduct.SoLuong }}</p>
                                </div>
                            </div>
                        </div>
                        <form @submit.prevent="createFeedBack" method="POST" class="flex flex-col gap-4">
                            <div class="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                                <label for="rating" class="font-semibold text-white mr-4">Chất lượng sản phẩm: </label>
                                <div id="rating" class="flex items-center gap-2">
                                    <span v-for="star in 5" :key="star" class="cursor-pointer">
                                        <i :class="['fa-star', rating >= star ? 'fas text-[#FFD700]' : 'far text-gray-400']"
                                            @click="setRating(star)"></i>
                                    </span>
                                </div>
                                <p v-if="errors.rating" class="text-red-500 text-sm">{{ errors.rating }}</p>
                            </div>
                            <div class="flex flex-col gap-4">
                                <label for="description" class="font-semibold text-white">Mô tả:</label>
                                <textarea 
                                    v-model="formData.description"
                                    class="w-full h-[120px] rounded-md outline-none p-4 font-medium bg-[#333333] text-white border border-gray-600 focus:border-blue-400"
                                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..." 
                                    name="description" 
                                    id="description"
                                ></textarea>
                                <p v-if="errors.description" class="text-red-500 text-sm">{{ errors.description }}</p>
                            </div>
                            <div class="flex flex-col gap-2">
                                <label for="image_upload" class="text-[15px] font-semibold text-white">
                                    Hình ảnh sản phẩm <i class="fa-solid fa-circle-info text-gray-300"></i>
                                </label>
                                <label for="image_upload"
                                    class="border-2 border-gray-400 cursor-pointer border-dashed rounded-md p-6 text-center flex flex-col items-center justify-center">
                                    <div class="text-[18px] text-slate-300" id="image_icon">
                                        <i class="fa-regular fa-image"></i>
                                    </div>
                                    <label for="image_upload" class="text-[12px] text-gray-500 cursor-pointer">
                                        Thả hình ảnh vào đây, hoặc <span class="text-[#003171] cursor-pointer">nhấp để duyệt</span>
                                    </label>
                                    <input type="file" class="hidden" id="image_upload" multiple @change="handleFileUpload">
                                    <div class="flex flex-wrap justify-center gap-2 mt-2">
                                        <img v-for="(imageUrl, index) in imageUrls" :key="index" :src="imageUrl"
                                            class="w-20 h-20 object-cover border rounded-md" />
                                    </div>
                                </label>
                                <p v-if="errors.images" class="text-red-500 text-sm">{{ errors.images }}</p>
                                <p class="text-white text-sm">Tối đa 10 hình ảnh. Chú ý chất lượng ảnh.</p>
                            </div>
                            <div class="flex justify-end gap-3 mt-4">
                                <button 
                                    type="button" 
                                    @click="cancelReview"
                                    class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition-colors"
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit"
                                    class="bg-[#333f48] hover:bg-[#DB3F4C] text-white font-bold py-2 px-5 rounded transition-colors"
                                >
                                    Đánh giá sản phẩm
                                </button>
                            </div>
                        </form>
                    </div>
                    <div v-if="canCompleteOrder" class="mt-4 p-4 bg-green-900/20 border border-green-500 rounded-lg">
                        <div class="flex items-center gap-2 text-green-400">
                            <i class="fas fa-check-circle"></i>
                            <span class="font-medium">Bạn đã đánh giá xong tất cả sản phẩm trong đơn hàng!</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Footer />
        <BackToTop />
        <NotificationClient :message="notification.message" :type="notification.type" />
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
</style>