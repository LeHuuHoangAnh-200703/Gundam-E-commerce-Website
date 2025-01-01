<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const comments = ref([
    {
        img: "/src/assets/img/avatar.jpg",
        name: "Lê Hữu Hoàng Anh",
        date: "20-07-2024",
        description: "Lần đầu tiên mua hàng tại shop nhưng rất hài lòng. Giao hàng nhanh 2 ngày là tới, test thử thì thấy âm thanh cũng khá ok so với tầm giá rẻ như thế, sài lâu dài mới biết là tai nghe có bền hay không. Giá rẻ nhưng thiết kế khá đẹp, màu xinh cực, nhìn khá sịn sò, dây tay nghe chắc chắn. Anh shipper dễ thương và thân thiện.",
        imgDetails: "/src/assets/img/DT1RG01.jpg"
    },
    {
        img: "/src/assets/img/avatar.jpg",
        name: "Lê Hữu Hoàng Anh",
        date: "20-07-2024",
        description: "Lần đầu tiên mua hàng tại shop nhưng rất hài lòng. Giao hàng nhanh 2 ngày là tới, test thử thì thấy âm thanh cũng khá ok so với tầm giá rẻ như thế, sài lâu dài mới biết là tai nghe có bền hay không. Giá rẻ nhưng thiết kế khá đẹp, màu xinh cực, nhìn khá sịn sò, dây tay nghe chắc chắn. Anh shipper dễ thương và thân thiện.",
        imgDetails: "/src/assets/img/DT1RG01.jpg"
    },
    {
        img: "/src/assets/img/avatar.jpg",
        name: "Lê Hữu Hoàng Anh",
        date: "20-07-2024",
        description: "Lần đầu tiên mua hàng tại shop nhưng rất hài lòng. Giao hàng nhanh 2 ngày là tới, test thử thì thấy âm thanh cũng khá ok so với tầm giá rẻ như thế, sài lâu dài mới biết là tai nghe có bền hay không. Giá rẻ nhưng thiết kế khá đẹp, màu xinh cực, nhìn khá sịn sò, dây tay nghe chắc chắn. Anh shipper dễ thương và thân thiện.",
        imgDetails: "/src/assets/img/DT1RG01.jpg"
    },
    {
        img: "/src/assets/img/avatar.jpg",
        name: "Lê Hữu Hoàng Anh",
        date: "20-07-2024",
        description: "Lần đầu tiên mua hàng tại shop nhưng rất hài lòng. Giao hàng nhanh 2 ngày là tới, test thử thì thấy âm thanh cũng khá ok so với tầm giá rẻ như thế, sài lâu dài mới biết là tai nghe có bền hay không. Giá rẻ nhưng thiết kế khá đẹp, màu xinh cực, nhìn khá sịn sò, dây tay nghe chắc chắn. Anh shipper dễ thương và thân thiện.",
        imgDetails: "/src/assets/img/DT1RG01.jpg"
    },
    {
        img: "/src/assets/img/avatar.jpg",
        name: "Lê Hữu Hoàng Anh",
        date: "20-07-2024",
        description: "Lần đầu tiên mua hàng tại shop nhưng rất hài lòng. Giao hàng nhanh 2 ngày là tới, test thử thì thấy âm thanh cũng khá ok so với tầm giá rẻ như thế, sài lâu dài mới biết là tai nghe có bền hay không. Giá rẻ nhưng thiết kế khá đẹp, màu xinh cực, nhìn khá sịn sò, dây tay nghe chắc chắn. Anh shipper dễ thương và thân thiện.",
        imgDetails: "/src/assets/img/DT1RG01.jpg"
    },
    {
        img: "/src/assets/img/avatar.jpg",
        name: "Lê Hữu Hoàng Anh",
        date: "20-07-2024",
        description: "Lần đầu tiên mua hàng tại shop nhưng rất hài lòng. Giao hàng nhanh 2 ngày là tới, test thử thì thấy âm thanh cũng khá ok so với tầm giá rẻ như thế, sài lâu dài mới biết là tai nghe có bền hay không. Giá rẻ nhưng thiết kế khá đẹp, màu xinh cực, nhìn khá sịn sò, dây tay nghe chắc chắn. Anh shipper dễ thương và thân thiện.",
        imgDetails: "/src/assets/img/DT1RG01.jpg"
    },
    {
        img: "/src/assets/img/avatar.jpg",
        name: "Lê Hữu Hoàng Anh",
        date: "20-07-2024",
        description: "Lần đầu tiên mua hàng tại shop nhưng rất hài lòng. Giao hàng nhanh 2 ngày là tới, test thử thì thấy âm thanh cũng khá ok so với tầm giá rẻ như thế, sài lâu dài mới biết là tai nghe có bền hay không. Giá rẻ nhưng thiết kế khá đẹp, màu xinh cực, nhìn khá sịn sò, dây tay nghe chắc chắn. Anh shipper dễ thương và thân thiện.",
        imgDetails: "/src/assets/img/DT1RG01.jpg"
    },
])

const relatedProducts = ref([]);

const nameProduct = ref('');
const price = ref('');
const typeProduct = ref('');
const supplier = ref('');
const idProduct = ref('');
const images = ref([]);
const description = ref('');
const quantity = ref('');
const selectedImage = ref();
const orderQuantity = ref(1);
const fetchProduct = async (idSanPham) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/sanpham/${idSanPham}`);
        console.log(response.data)
        idProduct.value = response.data.MaSanPham;
        nameProduct.value = response.data.TenSanPham;
        description.value = response.data.MoTa;
        images.value = response.data.Images;
        price.value = response.data.GiaBan;
        supplier.value = response.data.NhaCungCap;
        typeProduct.value = response.data.LoaiSanPham;
        quantity.value = response.data.SoLuong;

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
        console.log(relatedProducts.value)
    } catch (err) {
        console.log("error feching: ", err);
    }
}

// Sản phẩm liên quan
const indexPage = ref(1);
const itemsPerPage = 4;

const totalPageProducts = computed(() => {
    return Math.ceil(relatedProducts.value.length / itemsPerPage);
});

const paginatedProducts = computed(() => {
    const start = (indexPage.value - 1) * itemsPerPage;
    return relatedProducts.value.slice(start, start + itemsPerPage);
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

const paginatedComments = computed(() => {
    const start = (currentPage.value - 1) * commentsPerPage;
    return comments.value.slice(start, start + commentsPerPage);
});

const totalPages = computed(() => {
    return Math.ceil(comments.value.length / commentsPerPage);
});

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
    }
};

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
    }
};

const showImage = ref(true);

const changeImage = (newImage) => {
    if (newImage !== selectedImage.value) {
        showImage.value = false;

        setTimeout(() => {
            selectedImage.value = newImage;
            showImage.value = true;
        }, 200);
    }
};

function formatCurrency(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function decreaseQuantity() {
    if (orderQuantity.value > 1) {
        return orderQuantity.value --;
    }
}

function increaseQuantity() {  
    if (orderQuantity.value < quantity.value) {  
        orderQuantity.value ++; 
    }  
};  

onMounted(() => {
    const idSanPham = router.currentRoute.value.params.maSanPham;
    fetchProduct(idSanPham);
    fetchRelatedProducts();
    window.scrollTo(0, 0);
})

watch(() => router.currentRoute.value.params.maSanPham, (newIdSanPham) => {
    if (newIdSanPham) {
        fetchProduct(newIdSanPham);
        fetchRelatedProducts();
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
                        <img :src="`/src/assets/img/${selectedImage}`"
                            :class="{ 'opacity-0': !showImage, 'transition-opacity duration-300': true }"
                            class="[box-shadow:0px_0px_6px_rgba(255,255,255,0.8)] w-full" alt="" />
                    </div>
                    <div class="flex gap-3 items-center justify-center">
                        <img v-for="(img, index) in images" :key="index" :src="`/src/assets/img/${img}`"
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
                        <button @click="decreaseQuantity" class="bg-gray-200 w-[40px] h-[40px] rounded-full flex justify-center items-center"><i class="fa-solid fa-minus"></i></button>
                        <input type="number" v-model="orderQuantity" min="1" :max="orderQuantity" class="text-[20px] text-white bg-transparent border-b-2 w-[50px] text-center p-1">
                        <button @click="increaseQuantity" class="bg-gray-200 w-[40px] h-[40px] rounded-full flex justify-center items-center"><i class="fa-solid fa-plus"></i></button>
                    </div>
                    <hr class="bg-gray-600">
                    <ul class="flex flex-col gap-2 text-white ml-4">
                        <li class="list-disc">Sản phẩm Gunpla chính hãng của Bandai, sản xuất tại Nhật Bản.</li>
                        <li class="list-disc">Sản phẩm giúp phát triển trí não và rèn luyện tính kiên nhẫn cho người
                            chơi.</li>
                        <li class="list-disc">Sản phẩm gắn với nhau bằng khớp nối, không dùng keo dán</li>
                        <li class="list-disc">Phân phối bởi SOTSU-SUNRISE.</li>
                    </ul>
                    <router-link :to="`/orders/${idProduct}?quantity=${orderQuantity}`"
                        class="bg-[#DB3F4C] px-5 py-3 text-center text-white transition-all duration-300 hover:bg-[#b25058]">
                        <p class="text-[16px] lg:text-[18px] uppercase font-semibold">Mua ngay với giá <span>{{
                                formatCurrency(price) }}
                                VNĐ</span></p>
                        <p class="text-[12px] lg:text-[14px]">Đặt mua giao hàng tận nơi</p>
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
            <div class="my-20">
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
                                    <img :src="`/src/assets/img/${product.Images[0]}`"
                                        class="w-full [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]" alt="">
                                </router-link>
                                <div
                                    class="whitespace-nowrap text-[14px] text-ellipsis overflow-hidden max-w-48 text-white">
                                    <router-link :to="`/details/${product.MaSanPham}`"
                                        class="overflow-hidden text-ellipsis whitespace-nowrap text-center flex-grow hover:text-[#DB3F4C] transition-all duration-300">
                                        {{ product.TenSanPham }}
                                    </router-link>
                                </div>
                                <p class="text-white text-[14px]">Giá: <span class="text-[#FFD700]">{{ formatCurrency(product.GiaBan)
                                        }} VNĐ</span></p>
                                <p class="text-white text-[14px]">Tình trạng: <span class="">{{ product.TrangThai }}</span>
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
                            <p class="text-white text-[24px]"><span class="text-[30px]">4.8 </span>trên 5</p>
                            <div class="flex gap-2">
                                <i v-for="star in 5" :key="star" class="fa-solid fa-star text-[#FFD700]"></i>
                            </div>
                        </div>
                        <div class="flex gap-4 justify-center flex-wrap">
                            <button
                                class="px-10 py-2 border-2 bg-white font-semibold hover:border-[#DB3F4C] hover:text-[#DB3F4C] ease-out duration-300 transition-all">Tất
                                cả</button>
                            <button
                                class="px-10 py-2 border-2 bg-white font-semibold hover:border-[#DB3F4C] hover:text-[#DB3F4C] ease-out duration-300 transition-all">5
                                sao</button>
                            <button
                                class="px-10 py-2 border-2 bg-white font-semibold hover:border-[#DB3F4C] hover:text-[#DB3F4C] ease-out duration-300 transition-all">4
                                sao</button>
                            <button
                                class="px-10 py-2 border-2 bg-white font-semibold hover:border-[#DB3F4C] hover:text-[#DB3F4C] ease-out duration-300 transition-all">3
                                sao</button>
                            <button
                                class="px-10 py-2 border-2 bg-white font-semibold hover:border-[#DB3F4C] hover:text-[#DB3F4C] ease-out duration-300 transition-all">2
                                sao</button>
                            <button
                                class="px-10 py-2 border-2 bg-white font-semibold hover:border-[#DB3F4C] hover:text-[#DB3F4C] ease-out duration-300 transition-all">1
                                sao</button>
                        </div>
                    </div>
                    <hr class="my-4">
                    <div class="flex flex-col w-full">
                        <div v-for="comment in paginatedComments" :key="comment.id"
                            class="flex py-4 border-b flex-col gap-2 w-full">
                            <div class="flex gap-4 w-full">
                                <img :src="comment.img" class="w-[60px] rounded-full" alt="">
                                <div class="">
                                    <p class="text-white text-[14px] font-semibold">{{ comment.name }}</p>
                                    <p class="text-white text-[14px] mb-1">{{ comment.date }}</p>
                                    <div class="flex gap-1">
                                        <i v-for="star in 5" :key="star"
                                            class="fa-solid fa-star text-[#FFD700] text-[10px]"></i>
                                    </div>
                                </div>
                            </div>
                            <div class="flex flex-col">
                                <p class="my-4 text-white text-justify">{{ comment.description }}</p>
                                <div class="flex gap-4">
                                    <img :src="comment.imgDetails" class="w-[80px] lg:w-[100px]" alt="">
                                    <img :src="comment.imgDetails" class="w-[80px] lg:w-[100px]" alt="">
                                    <img :src="comment.imgDetails" class="w-[80px] lg:w-[100px]" alt="">
                                </div>
                            </div>
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
    </div>
</template>

<style scoped></style>