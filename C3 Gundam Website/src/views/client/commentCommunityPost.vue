<script setup>
import { onMounted, ref, computed } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import axios from "axios";
import { useRouter } from 'vue-router';

const router = useRouter();

const fetchCustomer = async () => {
    const maKhachHang = localStorage.getItem("MaKhachHang");
    try {
        const response = await axios.get(`http://localhost:3000/api/khachhang/${maKhachHang}`);
        avatarCustomer.value = response.data.Image;
        nameCustomer.value = response.data.TenKhachHang;
        idCustomer.value = response.data.MaKhachHang;
    } catch (error) {
        console.log(error);
    }
}

onMounted(() => {
    fetchCustomer();
})
</script>

<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="relative mb-5 m-2 lg:mx-[200px] flex lg:flex-row flex-col flex-grow gap-2">
            <div class="bg-gray-700 rounded-lg border-2 w-full lg:w-[50%] flex flex-col gap-4">
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
                    </div>
                    <p class="text-white font-medium font-sans">CTU Media cám ơn tất cả vì một mùa hội diễn
                        thành
                        công,
                        chúng mình vinh dự khi được góp sức để lan tỏa những giá trị nhân văn của Hội diễn.</p>
                </div>
                <div class="grid grid-cols-2 gap-1">
                    <img src="../../assets/img/GD01.jpg" class="w-full h-full" alt="">
                    <img src="../../assets/img/GD01DT1.jpg" class="w-full h-full" alt="">
                    <img src="../../assets/img/GD01DT2.jpg" class="w-full h-full" alt="">
                    <img src="../../assets/img/GD01DT3.jpg" class="w-full h-full" alt="">
                </div>
                <div class="px-4 flex flex-col gap-2 mb-3">
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
                </div>
            </div>
            <div class="bg-gray-700 rounded-lg border-2 w-full lg:w-[50%] flex flex-col gap-4 p-4">
                <div class="flex flex-col gap-2">
                    <div class="flex gap-2 items-start">
                        <img :src="`${avatarCustomer === 'null' ? '/src/assets/img/avatar.jpg' : avatarCustomer}`"
                            class="w-10 h-10 rounded-full object-cover" alt="">
                        <div class="flex flex-col gap-2">
                            <div class="bg-gray-500 rounded-lg p-3">
                                <p class="text-white text-[14px]">Gundam này mua ở shop nào vậy, C3 GUNDAM STORE chưa
                                    có!</p>
                            </div>
                            <button class="text-white text-[12px] text-end">Trả lời</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Footer />
        <BackToTop />
    </div>
</template>

<style scoped></style>