<script setup>
import { ref } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';  

const rating = ref(0);

const setRating = (star) => {
    console.log(star);
    rating.value = star;
};
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
                    <div class="flex gap-4 border-b-2 pb-4 mb-3">
                        <img src="../../assets/img/RG01.jpg" class="w-[60px]" alt="">
                        <div class="flex flex-col gap-1 justify-center">
                            <div class="w-44 block lg:hidden whitespace-nowrap text-ellipsis overflow-hidden">
                                <p class="text-white text-[14px] overflow-hidden text-ellipsis whitespace-nowrap">RG
                                    1/144 RX-0 UNICORN GUNDAM
                                    (BILIBILI
                                    10TH ANNIVERSARY VER)</p>
                            </div>
                            <p class="text-[14px] text-white font-medium hidden lg:block">RG 1/144 RX-0 UNICORN GUNDAM
                                (BILIBILI 10TH
                                ANNIVERSARY VER)</p>
                            <p class="text-[14px] text-white font-medium">Loại sản phẩm: RG</p>
                        </div>
                    </div>
                    <div class="flex gap-4 border-b-2 pb-4 mb-3">
                        <img src="../../assets/img/RG01.jpg" class="w-[60px]" alt="">
                        <div class="flex flex-col gap-1 justify-center">
                            <div class="w-44 block lg:hidden whitespace-nowrap text-ellipsis overflow-hidden">
                                <p class="text-white text-[14px] overflow-hidden text-ellipsis whitespace-nowrap">RG
                                    1/144 RX-0 UNICORN GUNDAM
                                    (BILIBILI
                                    10TH ANNIVERSARY VER)</p>
                            </div>
                            <p class="text-[14px] text-white font-medium hidden lg:block">RG 1/144 RX-0 UNICORN GUNDAM
                                (BILIBILI 10TH
                                ANNIVERSARY VER)</p>
                            <p class="text-[14px] text-white font-medium">Loại sản phẩm: RG</p>
                        </div>
                    </div>
                    <form action="" class="my-4 flex flex-col gap-4">
                        <div class="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                            <label for="rating" class="font-semibold text-white mr-4">Chất lượng sản phẩm: </label>
                            <div id="rating" class="flex items-center gap-2">
                                <span v-for="star in 5" :key="star" class="cursor-pointer">
                                    <i :class="['fa-star', rating >= star ? 'fas text-[#FFD700]' : 'far text-gray-400']"
                                        @click="setRating(star)"></i>
                                </span>
                            </div>
                        </div>
                        <div class="flex flex-col gap-4">
                            <label for="description" class="font-semibold text-white mr-4">Mô tả:</label>
                            <textarea class="w-full h-[150px] rounded-md outline-none p-5 font-semibold"
                                placeholder="Đánh giá của bạn ..." name="description" id="description" cols="30"
                                rows="10"></textarea>
                        </div>
                        <div class="my-2 text-white">
                            <label for="city" class="font-semibold text-[16px]">Ảnh sản phẩm : </label>
                            <input type="file" name="image" id="imageInput" />
                        </div>
                        <div class="border-2 p-5 h-[200px] rounded-md flex justify-center items-center">
                            <img id="imagePreview" class="hidden" src="#" alt="Image Preview"
                                style="max-width:200px; max-height:200px">
                            <div class="text-[60px] text-slate-300" id="image_icon">
                                <i class="fa-regular fa-image"></i>
                            </div>
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