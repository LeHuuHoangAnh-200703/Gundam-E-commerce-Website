<script setup>
import { ref } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";

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
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full min-h-screen font-sans">
        <div class="flex gap-3">
            <SideBar />
            <div class="relative p-4 flex flex-col gap-4 w-full overflow-auto">
                <Navbar />
                <div class="flex lg:flex-row flex-col gap-4 justify-center lg:justify-between items-center">
                    <h1 class="font-bold text-[20px]">Quản lý đánh giá</h1>
                </div>
                <div class="w-full flex lg:flex-row flex-col gap-8 items-start">
                    <div class="flex flex-col gap-5 bg-white p-4 rounded-lg shadow-lg w-full lg:w-1/3">
                        <div class="flex flex-col gap-2">
                            <p class="text-[24px] font-semibold"><span class="text-[30px]">4.8 </span>trên 5</p>
                            <div class="flex gap-2">
                                <i v-for="star in 5" :key="star" class="fa-solid fa-star text-[#FFD700]"></i>
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            <p class="font-semibold text-[18px]">Tìm kiếm theo sao</p>
                            <button
                                class="border-2 px-5 py-3 flex justify-between gap-2 rounded-md hover:border-[#003171] transition-all duration-300">
                                <div class="flex gap-2 justify-start">
                                    <i v-for="star in 5" :key="star" 
                                       :class="['fa-solid fa-star', star <= 5 ? 'text-[#FFD700]' : 'text-gray-300']"></i>
                                </div>
                                <p class="font-semibold text-[14px]">(20)</p>
                            </button>
                            <button
                                class="border-2 px-5 py-3 flex justify-between gap-2 rounded-md hover:border-[#003171] transition-all duration-300">
                                <div class="flex gap-2 justify-start">
                                    <i v-for="star in 5" :key="star" 
                                       :class="['fa-solid fa-star', star <= 4 ? 'text-[#FFD700]' : 'text-gray-300']"></i>
                                </div>
                                <p class="font-semibold text-[14px]">(20)</p>
                            </button>
                            <button
                                class="border-2 px-5 py-3 flex justify-between gap-2 rounded-md hover:border-[#003171] transition-all duration-300">
                                <div class="flex gap-2 justify-start">
                                    <i v-for="star in 5" :key="star"
                                        :class="['fa-solid fa-star', star <= 3 ? 'text-[#FFD700]' : 'text-gray-300']"></i>
                                </div>
                                <p class="font-semibold text-[14px]">(20)</p>
                            </button>
                            <button
                                class="border-2 px-5 py-3 flex justify-between gap-2 rounded-md hover:border-[#003171] transition-all duration-300">
                                <div class="flex gap-2 justify-start">
                                    <i v-for="star in 5" :key="star"
                                        :class="['fa-solid fa-star', star <= 2 ? 'text-[#FFD700]' : 'text-gray-300']"></i>
                                </div>
                                <p class="font-semibold text-[14px]">(20)</p>
                            </button>
                            <button
                                class="border-2 px-5 py-3 flex justify-between gap-2 rounded-md hover:border-[#003171] transition-all duration-300">
                                <div class="flex gap-2 justify-start">
                                    <i v-for="star in 5" :key="star"
                                        :class="['fa-solid fa-star', star <= 1 ? 'text-[#FFD700]' : 'text-gray-300']"></i>
                                </div>
                                <p class="font-semibold text-[14px]">(20)</p>
                            </button>
                        </div>
                    </div>
                    <div class="flex flex-col gap-4 w-full overflow-y-auto max-h-[calc(100vh-200px)]">
                        <div class="bg-white p-4 w-full border-2 rounded-lg shadow-lg">
                            <div v-for="comment in comments" :key="comment.id"
                                class="flex py-4 border-b flex-col gap-2 w-full">
                                <div class="flex gap-4 w-full">
                                    <img :src="comment.img" class="w-[60px] rounded-full" alt="">
                                    <div class="">
                                        <p class="text-[14px] font-semibold">{{ comment.name }}</p>
                                        <p class="text-[12px] font-semibold mb-1">{{ comment.date }}</p>
                                        <div class="flex gap-1">
                                            <i v-for="star in 5" :key="star"
                                                class="fa-solid fa-star text-[#FFD700] text-[10px]"></i>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex flex-col">
                                    <p class="my-4 text-justify">{{ comment.description }}</p>
                                    <div class="flex gap-4">
                                        <img :src="comment.imgDetails" class="w-[80px] lg:w-[100px]" alt="">
                                        <img :src="comment.imgDetails" class="w-[80px] lg:w-[100px]" alt="">
                                        <img :src="comment.imgDetails" class="w-[80px] lg:w-[100px]" alt="">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.active-link {
    background: #DB3F4C;
    color: white;
}

.fixed {
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
}

.fixed.translate-x-0 {
    transform: translateX(0);
}
</style>