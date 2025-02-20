<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import NotificationClient from "@/components/Notification/NotificationClient.vue";
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const comments = ref([]);

const relatedProducts = ref([]);
const idCustomer = localStorage.getItem('MaKhachHang');
const nameProduct = ref('');
const price = ref('');
const typeProduct = ref('');
const supplier = ref('');
const idProduct = ref('');
const images = ref([]);
const description = ref('');
const quantity = ref('');
const status = ref('');
const selectedImage = ref();
const orderQuantity = ref(1);

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
const fetchProduct = async (idSanPham) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/sanpham/${idSanPham}`);
        idProduct.value = response.data.MaSanPham;
        nameProduct.value = response.data.TenSanPham;
        description.value = response.data.MoTa;
        images.value = response.data.Images;
        price.value = response.data.GiaBan;
        supplier.value = response.data.TenNhaCungCap;
        typeProduct.value = response.data.LoaiSanPham;
        quantity.value = response.data.SoLuong;
        status.value = response.data.TrangThai;
        if (images.value.length > 0) {
            selectedImage.value = images.value[0];
        }
    } catch (err) {
        console.log("error feching: ", err);
    }
}

const fetchRelatedProducts = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/sanpham');
        relatedProducts.value = response.data.filter(relatedProduct =>
            relatedProduct.LoaiSanPham === typeProduct.value && relatedProduct.MaSanPham !== idProduct.value
        );
    } catch (err) {
        console.log("error feching: ", err);
    }
}

const fetchFeedBacks = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/danhgia');
        const allComments = response.data.filter(comment =>
            comment.SanPhamDaDanhGia &&
            Array.isArray(comment.SanPhamDaDanhGia) &&
            comment.SanPhamDaDanhGia.some(product => product.MaSanPham === idProduct.value)
        ).map(comment => ({
            ...comment,
            NgayDang: new Date(comment.NgayDang)
        }));

        const myComments = allComments.filter(comment => comment.MaKhachHang === idCustomer);
        const otherComments = allComments.filter(comment => comment.MaKhachHang !== idCustomer);

        comments.value = [...myComments, ...otherComments.sort((a, b) => b.NgayDang - a.NgayDang)];
    } catch (err) {
        console.log("Error fetching: ", err);
    }
};

const deleteFeedback = async (idDanhGia) => {
    const confirmUpdate = confirm('Bạn có chắc chắn muốn xóa đánh giá này?');
    if (!confirmUpdate) return;
    try {
        const response = await axios.delete(`http://localhost:3000/api/danhgia/${idDanhGia}`);
        showNotification("Xóa đánh giá thành công!", "success");
        await fetchFeedBacks();
    } catch (err) {
        showNotification(err.response?.data?.message || "Xóa đánh giá thất bại!", "error");
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}

const formatDate = (date) => {
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' };
    const formattedDate = date.toLocaleString('vi-VN', options);

    const [time, day] = formattedDate.split(', ');
    return `${time}`;
};

// Sản phẩm liên quan
const indexPage = ref(1);
const itemsPerPage = 4;

// Tính tổng số trang của danh sách sản phẩm liên quan
const totalPageProducts = computed(() => {
    // Dùng Math.ceil để làm tròn lên số trang, đảm bảo tất cả sản phẩm được hiển thị
    return Math.ceil(relatedProducts.value.length / itemsPerPage);
    // `relatedProducts.value.length`: Tổng số sản phẩm liên quan
    // `itemsPerPage`: Số lượng sản phẩm hiển thị trên mỗi trang
});

// Tính danh sách sản phẩm thuộc trang hiện tại
const paginatedProducts = computed(() => {
    const start = (indexPage.value - 1) * itemsPerPage;
    // `indexPage.value`: Số trang hiện tại (bắt đầu từ 1)
    // `start`: Chỉ số bắt đầu của sản phẩm trên trang hiện tại

    return relatedProducts.value.slice(start, start + itemsPerPage);
    // Lấy danh sách sản phẩm từ chỉ số `start` đến chỉ số `start + itemsPerPage` (không bao gồm `start + itemsPerPage`)
});

const nextPageProducts = () => {
    if (indexPage.value < totalPageProducts.value) {
        indexPage.value++;
    }
};

const prevPageProducts = () => {
    if (indexPage.value > 1) {
        indexPage.value--;
    }
};

// Đánh giá
const currentPage = ref(1);
const commentsPerPage = 5;

// Tính toán danh sách bình luận thuộc trang hiện tại
const paginatedComments = computed(() => {
    const start = (currentPage.value - 1) * commentsPerPage; // Xác định chỉ số bắt đầu của bình luận
    return comments.value.slice(start, start + commentsPerPage); // Trả về danh sách bình luận thuộc trang hiện tại
});

// Tính tổng số trang dựa trên số lượng bình luận
const totalPages = computed(() => {
    return Math.ceil(comments.value.length / commentsPerPage); // Làm tròn lên để đảm bảo hiển thị đủ số trang
});

// Chuyển sang trang tiếp theo
const nextPage = () => {
    if (currentPage.value < totalPages.value) { // Kiểm tra nếu chưa phải trang cuối
        currentPage.value++; // Tăng giá trị trang hiện tại lên 1
    }
};

// Quay lại trang trước
const prevPage = () => {
    if (currentPage.value > 1) { // Kiểm tra nếu không phải trang đầu tiên
        currentPage.value--; // Giảm giá trị trang hiện tại xuống 1
    }
};

// Hiển thị và chuyển đổi hình ảnh sản phẩm
const showImage = ref(true); // Biến kiểm soát trạng thái hiển thị hình ảnh (true: hiện, false: ẩn)

// Hàm thay đổi hình ảnh được hiển thị
const changeImage = (newImage) => {
    if (newImage !== selectedImage.value) { // Nếu hình ảnh mới khác hình ảnh hiện tại
        showImage.value = false; // Ẩn hình ảnh hiện tại để tạo hiệu ứng chuyển đổi

        setTimeout(() => {
            selectedImage.value = newImage; // Cập nhật hình ảnh được chọn
            showImage.value = true; // Hiển thị hình ảnh mới
        }, 200); // Thời gian tạo hiệu ứng chuyển đổi là 200ms
    }
};

function formatCurrency(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function decreaseQuantity() {
    if (orderQuantity.value > 1) {
        return orderQuantity.value--;
    }
}

function increaseQuantity() {
    if (orderQuantity.value < quantity.value) {
        orderQuantity.value++;
    }
};

function handleDisabledClick() {
    showNotification("Sản phẩm hiện tại đã ngừng kinh doanh!", "error");

    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}

const totalQuality = computed(() => {
    if (!comments.value.length) return 0;
    const total = comments.value.reduce((sum, comment) => sum + (comment.ChatLuong || 0), 0); // Tính tổng điểm
    const average = total / comments.value.length;
    return average.toFixed(1);
});

const selectedStar = ref(6);
const selected = (item) => {
    return selectedStar.value = item;
}

const chooseFeedBackWithStar = computed(() => {
    return paginatedComments.value.filter(comment => {
        const chooseStar = selectedStar.value === 6 || comment.ChatLuong === selectedStar.value;
        return chooseStar;
    });
})

const chatBox = () => {
    const MaKhachHang = localStorage.getItem('MaKhachHang');
    if (!MaKhachHang) {
        router.push('/login');
    } else {
        router.push('/chatbox');
    }
}

onMounted(async () => {
    const idSanPham = router.currentRoute.value.params.maSanPham;
    await fetchProduct(idSanPham);
    await fetchRelatedProducts();
    fetchFeedBacks();
    window.scrollTo(0, 0);
})

watch(() => router.currentRoute.value.params.maSanPham, async (newIdSanPham) => {
    if (newIdSanPham) {
        await fetchProduct(newIdSanPham);
        await fetchRelatedProducts();
        fetchFeedBacks();
        window.scrollTo(0, 0);
    }
});
</script>

<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth">
        <Header />
        <div class="relative my-5 m-5 lg:mx-[210px]">
            <p class="text-gray-300 font-semibold text-[13px]">Trang chủ > <span class="text-[#DB3F4C]">{{ nameProduct
                    }}</span></p>
            <div class="flex lg:flex-row flex-col gap-16 my-12">
                <div class="flex flex-col gap-3 w-full lg:w-[45%]">
                    <div class="overflow-hidden px-4 py-2 flex justify-center items-center relative">
                        <img :src="`${selectedImage}`"
                            :class="{ 'opacity-0': !showImage, 'transition-opacity duration-300': true }"
                            class="[box-shadow:0px_0px_6px_rgba(255,255,255,0.8)] w-full" alt="" />
                    </div>
                    <div class="flex gap-3 items-center justify-center">
                        <img v-for="(img, index) in images" :key="index" :src="`${img}`"
                            @click="changeImage(img)"
                            class="w-[75px] border-2 transition-all hover:border-[#DB3F4C] cursor-pointer"
                            :class="{ 'border-[#DB3F4C]': img === selectedImage }" alt="" />
                    </div>
                </div>
                <div class="flex flex-col gap-4 w-full lg:w-[55%]">
                    <p class="text-white text-[20px] font-medium">{{ nameProduct }}</p>
                    <div class="flex flex-col gap-1">
                        <p class="text-white font-medium">Mã sản phẩm: {{ idProduct }}</p>
                        <p class="text-white font-medium">Thương hiệu: {{ supplier }}</p>
                        <p class="text-white font-medium">Loại sản phẩm: {{ typeProduct }}</p>
                        <p class="text-white font-medium">Còn lại: {{ quantity }} sản phẩm</p>
                    </div>
                    <p class="text-white font-medium">Giá bán: <span class="text-[#FFD700]">{{ formatCurrency(price) }}
                            VNĐ</span></p>
                    <p class="text-white font-medium">Số lượng: </p>
                    <div class="flex gap-4 items-center">
                        <button @click="decreaseQuantity"
                            class="bg-gray-200 w-[40px] h-[40px] rounded-full flex justify-center items-center"><i
                                class="fa-solid fa-minus"></i></button>
                        <input type="number" v-model="orderQuantity" readonly min="1" :max="orderQuantity"
                            class="text-[20px] text-white bg-transparent border-b-2 w-[50px] text-center p-1">
                        <button @click="increaseQuantity"
                            class="bg-gray-200 w-[40px] h-[40px] rounded-full flex justify-center items-center"><i
                                class="fa-solid fa-plus"></i></button>
                    </div>
                    <hr class="bg-gray-600">
                    <ul class="flex flex-col gap-2 text-white ml-4">
                        <li class="list-disc">Sản phẩm Gunpla chính hãng của Bandai, sản xuất tại Nhật Bản.</li>
                        <li class="list-disc">Sản phẩm giúp phát triển trí não và rèn luyện tính kiên nhẫn cho người
                            chơi.</li>
                        <li class="list-disc">Sản phẩm gắn với nhau bằng khớp nối, không dùng keo dán</li>
                        <li class="list-disc">Phân phối bởi SOTSU-SUNRISE.</li>
                    </ul>
                    <router-link v-if="status === 'Đang bán' && quantity > 0"
                        :to="`/orders/${idProduct}?quantity=${orderQuantity}`"
                        class="bg-[#DB3F4C] px-5 py-3 text-center text-white transition-all duration-300 hover:bg-[#b25058]">
                        <p class="text-[16px] lg:text-[18px] uppercase font-semibold">Mua ngay với giá <span>{{
                            formatCurrency(price) }}
                                VNĐ</span></p>
                        <p class="text-[12px] lg:text-[14px]">Đặt mua giao hàng tận nơi</p>
                    </router-link>
                    <router-link to="" v-else-if="status === 'Ngừng kinh doanh'" @click.prevent="handleDisabledClick"
                        class="bg-gray-400 px-5 py-3 text-center text-white transition-all duration-300 hover:bg-gray-600">
                        <p class="text-[16px] lg:text-[18px] uppercase font-semibold">Sản phẩm hiện tại đã ngừng kinh
                            doanh</p>
                        <p class="text-[12px] lg:text-[14px]">Chọn sản phẩm khác nhé</p>
                    </router-link>
                    <router-link to="" v-else-if="quantity === 0"
                        class="bg-gray-400 px-5 py-3 text-center text-white transition-all duration-300 hover:bg-gray-600">
                        <p class="text-[16px] lg:text-[18px] uppercase font-semibold">Sản phẩm hiện tại đã hết hàng</p>
                        <p class="text-[12px] lg:text-[14px]">Chọn sản phẩm khác nhé</p>
                    </router-link>
                    <p class="text-white text-center font-medium">Hotline hỗ trợ: <span
                            class="text-[#FFD700] font-semibold"><i class="fa-solid fa-phone-square"></i>
                            079.965.8592</span> (7:30-22:30)</p>
                </div>
            </div>
            <div class="my-20">
                <div class="flex justify-center items-end">
                    <p
                        class="border-x-2 border-t-2 w-[40%] lg:w-[25%] text-center inline-block px-6 py-2 text-[14px] lg:text-[20px] font-semibold text-white">
                        Giới thiệu</p>
                    <span class="w-[60%] lg:w-[75%] h-[2px] bg-white"></span>
                </div>
                <p class="my-8 text-gray-300 text-justify">{{ description }}</p>
            </div>
            <div class="my-20 w-full">
                <div class="flex justify-center items-end">
                    <p
                        class="border-x-2 border-t-2 w-[40%] lg:w-[25%] text-center inline-block px-6 py-2 text-[14px] lg:text-[20px] font-semibold text-white">
                        Sản phẩm liên quan</p>
                    <span class="w-[60%] lg:w-[75%] h-[2px] bg-white"></span>
                </div>
                <div class="w-full my-6 overflow-x-auto">
                    <div class="flex items-center justify-between w-full px-3">
                        <button @click="prevPageProducts" :disabled="indexPage === 1"
                            class="px-5 py-2 text-white hidden lg:block cursor-pointer font-semibold ease-out duration-300 transition-all">
                            <i class="fa-solid fa-chevron-left text-[24px]"></i>
                        </button>
                        <div class="flex gap-5 transition-transform duration-300 pt-4">
                            <div v-for="(product, index) in paginatedProducts" :key="index"
                                class="flex flex-col gap-2 items-center w-[220px] sm:w-[180px] md:w-[200px] lg:w-[220px]">
                                <router-link :to="`/details/${product.MaSanPham}`">
                                    <img :src="`${product.Images[0]}`"
                                        class="w-full [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]" alt="">
                                </router-link>
                                <div
                                    class="whitespace-nowrap text-[14px] text-ellipsis overflow-hidden max-w-48 text-white">
                                    <router-link :to="`/details/${product.MaSanPham}`"
                                        class="overflow-hidden text-ellipsis whitespace-nowrap text-center flex-grow hover:text-[#DB3F4C] transition-all duration-300">
                                        {{ product.TenSanPham }}
                                    </router-link>
                                </div>
                                <p class="text-white text-[14px]">Giá: <span class="text-[#FFD700]">{{
                                    formatCurrency(product.GiaBan)
                                        }} VNĐ</span></p>
                                <p class="text-white text-[14px]">Tình trạng: <span class="">{{ product.TrangThai
                                        }}</span>
                                </p>
                            </div>
                        </div>
                        <button @click="nextPageProducts" :disabled="indexPage === totalPageProducts"
                            class="px-5 py-2 text-white hidden lg:block cursor-pointer font-semibold ease-out duration-300 transition-all">
                            <i class="fa-solid fa-chevron-right text-[24px]"></i>
                        </button>
                    </div>
                </div>
                <div class="flex gap-5 items-center justify-center lg:hidden my-4">
                    <button @click="prevPageProducts" :disabled="indexPage === 1"
                        class="px-5 py-2 cursor-pointer border-2 bg-white font-semibold hover:border-[#DB3F4C] hover:text-[#DB3F4C] ease-out duration-300 transition-all">
                        <i class="fa-solid fa-chevron-left text-[24px]"></i>
                    </button>
                    <button @click="nextPageProducts" :disabled="indexPage === totalPageProducts"
                        class="px-5 py-2 cursor-pointer border-2 bg-white font-semibold hover:border-[#DB3F4C] hover:text-[#DB3F4C] ease-out duration-300 transition-all">
                        <i class="fa-solid fa-chevron-right text-[24px]"></i>
                    </button>
                </div>
            </div>
            <div class="my-20">
                <div class="flex justify-center items-end">
                    <p
                        class="border-x-2 border-t-2 w-[40%] lg:w-[25%] text-center inline-block px-6 py-2 text-[14px] lg:text-[20px] font-semibold text-white">
                        Đánh giá</p>
                    <span class="w-[60%] lg:w-[75%] h-[2px] bg-white"></span>
                </div>
                <div class="bg-[#242424] py-4 px-4 lg:px-[40px] my-6 [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                    <div class="flex lg:flex-row flex-col gap-5 items-center justify-center lg:justify-between">
                        <div class="flex flex-col gap-2">
                            <p class="text-white text-[24px]"><span class="text-[30px]">{{ totalQuality }} </span> trên
                                5 <i class="fa-solid fa-star text-[#FFD700]"></i></p>
                        </div>
                        <div class="flex gap-4 justify-center flex-wrap">
                            <button @click.prevent="selected(6)"
                                class="px-10 py-2 border-2 bg-white font-semibold hover:border-[#DB3F4C] hover:text-[#DB3F4C] ease-out duration-300 transition-all">Tất
                                cả</button>
                            <button v-for="(star, index) in 5" :key="index" @click.prevent="selected(star)"
                                class="px-10 py-2 border-2 bg-white font-semibold hover:border-[#DB3F4C] hover:text-[#DB3F4C] ease-out duration-300 transition-all">{{
                                    star }}
                                sao</button>
                        </div>
                    </div>
                    <hr class="my-4">
                    <div class="flex flex-col w-full" v-if="chooseFeedBackWithStar.length > 0">
                        <div v-for="comment in chooseFeedBackWithStar" :key="comment.id"
                            class="flex py-4 border-b flex-col gap-2 w-full">
                            <div class="flex justify-between items-center">
                                <div class="flex gap-4 w-full">
                                    <img :src="`${comment.HinhAnhKhachHang !=='undefined' ? comment.HinhAnhKhachHang : 'https://res.cloudinary.com/dwcajbc6f/image/upload/v1739607250/avatar_sejn1n.jpg'}`"
                                        class="w-[60px] h-[60px] rounded-full object-cover" alt="">
                                    <div class="">
                                        <p class="text-white text-[14px] font-semibold">{{ comment.TenKhachHang }}</p>
                                        <div class="flex gap-1 my-1">
                                            <i v-for="star in 5" :key="star" :class="{
                                                'fa-solid fa-star text-[#FFD700] text-[10px]': star <= comment.ChatLuong,
                                                'fa-solid fa-star text-[#C0C0C0] text-[10px]': star > comment.ChatLuong
                                            }"></i>
                                        </div>
                                        <p class="text-gray-400 text-[14px] mb-1">{{ formatDate(comment.NgayDang) }}</p>
                                    </div>
                                </div>
                                <button type="submit" @click.prevent="deleteFeedback(comment.MaDanhGia)"
                                    :class="comment.MaKhachHang === idCustomer ? 'block' : 'hidden'"
                                    class="inline-block font-medium bg-white py-2 px-4 mb-4 border-2 rounded-md transition-all duration-300 hover:border-[#DC143C] hover:text-[#DC143C] whitespace-nowrap"><i
                                        class="fa-solid fa-trash"></i></button>
                            </div>
                            <div class="flex flex-col">
                                <p class="my-4 text-white text-justify">{{ comment.MoTa }}</p>
                                <div class="flex gap-4 flex-wrap">
                                    <img v-for="(img, index) in comment.HinhAnhSanPham" :key="index"
                                        :src="`${img}`" class="w-[80px] rounded" alt="">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="flex justify-center items-center m-auto w-full">
                        <div class="flex flex-col items-center justify-center gap-3">
                            <p class="font-semibold text-white text-[18px] lg:text-[24px] text-center">Hiện tại
                                không có đánh giá nào!</p>
                            <img src="https://res.cloudinary.com/dwcajbc6f/image/upload/v1739607250/cute-shiba-inu-dog-robot-cyborg-cartoon-vector-icon-illustration-animal-technology-isolated-flat_egpulq.png" class="w-[200px]" alt="">
                        </div>
                    </div>
                    <div class="flex justify-center items-center gap-4 mt-4">
                        <button @click="prevPage" :disabled="currentPage === 1"
                            class="px-5 py-2 cursor-pointer border-2 bg-white font-semibold hover:border-[#DB3F4C] hover:text-[#DB3F4C] ease-out duration-300 transition-all">Trước</button>
                        <button @click="nextPage" :disabled="currentPage === totalPages"
                            class="px-5 py-2 border-2 cursor-pointer bg-white font-semibold hover:border-[#DB3F4C] hover:text-[#DB3F4C] ease-out duration-300 transition-all">Sau</button>
                    </div>
                </div>
            </div>
        </div>
        <Footer />
        <BackToTop />
        <button @click.prevent="chatBox" to="/chatbox" class="fixed bottom-32 right-10 flex justify-center items-center [box-shadow:0px_0px_10px_rgba(255,255,255,0.8)] bg-[#003171] border-2 rounded-full w-[50px] h-[50px]">
            <i class="fa-solid fa-comments text-white"></i>
        </button>
        <NotificationClient :message="notification.message" :type="notification.type" />
    </div>
</template>