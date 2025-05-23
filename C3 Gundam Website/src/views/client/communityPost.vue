<script setup>
import { onMounted, ref, computed } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import axios from "axios";
import { useRouter } from 'vue-router';

const avatarCustomer = ref('');
const nameCustomer = ref('');
const fetchCustomer = async () => {
    const maKhachHang = localStorage.getItem("MaKhachHang");
    try {
        const response = await axios.get(`http://localhost:3000/api/khachhang/${maKhachHang}`);
        avatarCustomer.value = response.data.Image;
        nameCustomer.value = response.data.TenKhachHang;
    } catch (error) {
        console.log(error);
    }
}

const router = useRouter();

onMounted(() => {
    fetchCustomer();
})
</script>

<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="relative mb-5 m-2 lg:mx-[350px] flex items-center flex-col flex-grow gap-6">
            <div class="w-full flex gap-5 items-center bg-gray-700 p-3 rounded-lg border-2">
                <div class="lg:w-[7%] w-[20%]">
                    <img :src="`${avatarCustomer === 'null' ? '/src/assets/img/avatar.jpg' : avatarCustomer}`"
                        class="w-12 h-12 lg:w-12 lg:h-12 rounded-full object-cover" alt="">
                </div>
                <router-link to=""
                    class="w-full text-white text-[12px] lg:text-[16px] font-medium p-4 bg-gray-600 rounded-lg hover:bg-gray-500 transition-all duration-200">
                    {{ nameCustomer }} ơi, bạn đang nghĩ gì thế ?
                </router-link>
            </div>
            <div class="bg-gray-700 rounded-lg border-2 w-full flex flex-col gap-4">
                <div class="pt-4 px-4 flex flex-col gap-3">
                    <div class="flex items-center justify-between">
                        <div class="flex gap-2">
                            <img :src="`${avatarCustomer === 'null' ? '/src/assets/img/avatar.jpg' : avatarCustomer}`"
                                class="w-12 h-12 lg:w-12 lg:h-12 rounded-full object-cover" alt="">
                            <div class="flex flex-col">
                                <p class="text-white font-semibold text-[18px]">Hoàng Anh</p>
                                <p class="text-white text-[12px] font-medium">20/07/2003</p>
                            </div>
                        </div>
                        <button class="text-white text-[16px]">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                    <p class="text-white font-medium font-sans">CTU Media cám ơn tất cả vì một mùa hội diễn thành công,
                        chúng mình vinh dự khi được góp sức để lan tỏa những giá trị nhân văn của Hội diễn.</p>
                </div>
                <div class="grid grid-cols-2 gap-1">
                    <img src="../../assets/img/GD01.jpg" class="w-full h-full" alt="">
                    <img src="../../assets/img/GD01DT1.jpg" class="w-full h-full" alt="">
                    <img src="../../assets/img/GD01DT2.jpg" class="w-full h-full" alt="">
                    <img src="../../assets/img/GD01DT3.jpg" class="w-full h-full" alt="">
                </div>
                <div class="px-4 flex flex-col gap-2">
                    <div class="flex items-center justify-between">
                        <div class="flex gap-2 items-center">
                            <i class="fa-solid fa-heart text-[#DC143C] text-[18px]"></i>
                            <p class="text-white font-medium">300 lượt yêu thích</p>
                        </div>
                        <div class="flex gap-2 items-center">
                            <p class="text-white font-medium">30</p>
                            <i class="fa-solid fa-comment text-white text-[18px]"></i>
                        </div>
                    </div>
                    <hr class="mb-2">
                    <div class="flex items-center justify-between mb-3">
                        <button class="flex gap-2 items-center">
                            <i class="fa-solid fa-heart text-gray-500 text-[25px]"></i>
                            <p class="text-white text-[16px] font-medium">Thích</p>
                        </button>
                        <button class="flex gap-2 items-center">
                            <i class="fa-solid fa-comment text-gray-500 text-[25px]"></i>
                            <p class="text-white text-[16px] font-medium">Bình luận</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <Footer />
        <BackToTop />
    </div>
</template>

<style scoped></style>