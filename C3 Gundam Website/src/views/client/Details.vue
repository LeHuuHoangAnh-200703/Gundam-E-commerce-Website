<script setup>
import { ref, computed } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';

const images = [
    '/src/assets/img/RG01.jpg',
    '/src/assets/img/DT1RG01.jpg',
    '/src/assets/img/DT2RG01.jpg',
    '/src/assets/img/DT3RG01.jpg',
];

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

const selectedImage = ref(images[0]);
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
</script>


<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth">
        <Header />
        <div class="relative my-5 m-5 lg:mx-[210px]">
            <p class="text-gray-300 font-semibold text-[13px]">Trang chủ > <span class="text-[#DB3F4C]">RG 1/144 RX-0
                    UNICORN GUNDAM (BILIBILI 10TH ANNIVERSARY VER)</span></p>
            <div class="flex lg:flex-row flex-col gap-16 my-12">
                <div class="flex flex-col gap-3 w-full lg:w-[40%]">
                    <div class="overflow-hidden px-4 py-2 flex justify-center items-center relative">
                        <img :src="selectedImage"
                            :class="{ 'opacity-0': !showImage, 'transition-opacity duration-300': true }"
                            class="[box-shadow:0px_0px_6px_rgba(255,255,255,0.8)] w-full" alt="" />
                    </div>
                    <div class="flex gap-3 items-center justify-center">
                        <img v-for="(img, index) in images" :key="index" :src="img" @click="changeImage(img)"
                            class="w-[75px] border-2 transition-all hover:border-[#DB3F4C] cursor-pointer"
                            :class="{ 'border-[#DB3F4C]': img === selectedImage }" alt="" />
                    </div>
                </div>
                <div class="flex flex-col gap-4 w-full lg:w-[60%]">
                    <p class="text-white text-[20px] font-medium">RG 1/144 RX-0 UNICORN GUNDAM (BILIBILI 10TH
                        ANNIVERSARY VER)</p>
                    <div class="flex flex-col gap-1">
                        <p class="text-white font-medium">Mã sản phẩm: SP29234</p>
                        <p class="text-white font-medium">Thương hiệu: Bandai</p>
                        <p class="text-white font-medium">Loại sản phẩm: RG</p>
                        <p class="text-white font-medium">Còn lại: 20</p>
                    </div>
                    <p class="text-white font-medium">Giá bán: <span class="text-[#FFD700]">2.350.000 VNĐ</span></p>
                    <hr class="bg-gray-600">
                    <ul class="flex flex-col gap-2 text-white ml-4">
                        <li class="list-disc">Sản phẩm Gunpla chính hãng của Bandai, sản xuất tại Nhật Bản.</li>
                        <li class="list-disc">Sản phẩm giúp phát triển trí não và rèn luyện tính kiên nhẫn cho người
                            chơi.</li>
                        <li class="list-disc">Sản phẩm gắn với nhau bằng khớp nối, không dùng keo dán</li>
                        <li class="list-disc">Phân phối bởi C3 Gundam.</li>
                    </ul>
                    <button
                        class="bg-[#DB3F4C] px-5 py-3 text-center text-white transition-all duration-300 hover:bg-[#b25058]">
                        <p class="text-[16px] lg:text-[18px] uppercase font-semibold">Mua ngay với giá <span>2.350.000
                                VNĐ</span></p>
                        <p class="text-[12px] lg:text-[14px]">Đặt mua giao hàng tận nơi</p>
                    </button>
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
                <p class="my-8 text-gray-300 text-justify">RG 1/144 RX-0 UNICORN GUNDAM (BILIBILI 10TH ANNIVERSARY VER)
                    - Mô hình Gundam chính hãng Bandai sở hữu đôi cánh sắc sảo tạo thành từ DRAGOON System độc đáo. Đây
                    là một trong những mẫu Gundam cực kỳ nổi tiếng với lượng fan đông đảo, và bạn sẽ không khỏi ấn tượng
                    về độ ngầu, độ hoành tráng của nó.</p>
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
                        <div v-for="comment in paginatedComments" :key="comment.id" class="flex py-4 border-b flex-col gap-2 w-full">
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