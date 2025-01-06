<script setup>
import { ref, onMounted, computed } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import axios from 'axios';

const comments = ref([]);
const fetchFeedBacks = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/danhgia');
        comments.value = response.data.map(feedback => {
            return {
                ...feedback,
                NgayDang: new Date(feedback.NgayDang)
            }
        })
        comments.value.sort((a, b) => b.NgayDang - a.NgayDang);
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

const formatDate = (date) => {
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' };
    const formattedDate = date.toLocaleString('vi-VN', options);

    const [time, day] = formattedDate.split(', ');
    return `${time}`;
};

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
    return comments.value.filter(comment => {
        const chooseStar = selectedStar.value === 6 || comment.ChatLuong === selectedStar.value;
        return chooseStar;
    });
})

const starCounts = computed(() => {  
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    comments.value.forEach(comment => {  
        if (comment.ChatLuong >= 1 && comment.ChatLuong <= 5) {  
            counts[comment.ChatLuong]++;  
        }  
    });  
    return counts;  
});  

onMounted(() => {
    fetchFeedBacks();
})
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full min-h-screen font-sans">
        <div class="flex gap-3">
            <SideBar />
            <div class="relative p-4 flex flex-col gap-4 w-full overflow-auto">
                <Navbar />
                <div class="flex lg:flex-row flex-col gap-4 justify-center lg:justify-between items-center">
                    <h1 class="font-bold text-[20px] uppercase">Quản lý đánh giá</h1>
                </div>
                <div class="w-full flex lg:flex-row flex-col gap-8 items-start">
                    <div class="flex flex-col gap-5 bg-white p-4 rounded-lg shadow-lg w-full lg:w-1/3">
                        <div class="flex flex-col gap-2">
                            <p class="text-[24px] font-semibold"><span class="text-[30px]">{{ totalQuality }}</span> trên 5 <i
                                    class="fa-solid fa-star text-[#FFD700]"></i></p>
                        </div>
                        <div class="flex flex-col gap-2">
                            <p class="font-semibold text-[18px]">Tìm kiếm theo sao</p>
                            <button @click.prevent="selected(6)"
                                class="border-2 px-5 py-3 flex justify-between font-semibold gap-2 rounded-md hover:border-[#003171] transition-all duration-300">Tất
                                cả đánh giá <span> ({{ comments.length }})</span></button>
                            <button @click.prevent="selected(5)"
                                class="border-2 px-5 py-3 flex justify-between gap-2 rounded-md hover:border-[#003171] transition-all duration-300">
                                <div class="flex gap-2 justify-start">
                                    <i v-for="star in 5" :key="star"
                                        :class="['fa-solid fa-star', star <= 5 ? 'text-[#FFD700]' : 'text-gray-300']"></i>
                                </div>
                                <p class="font-semibold text-[14px]">({{ starCounts[5] }})</p>
                            </button>
                            <button @click.prevent="selected(4)"
                                class="border-2 px-5 py-3 flex justify-between gap-2 rounded-md hover:border-[#003171] transition-all duration-300">
                                <div class="flex gap-2 justify-start">
                                    <i v-for="star in 5" :key="star"
                                        :class="['fa-solid fa-star', star <= 4 ? 'text-[#FFD700]' : 'text-gray-300']"></i>
                                </div>
                                <p class="font-semibold text-[14px]">({{ starCounts[4] }})</p>
                            </button>
                            <button @click.prevent="selected(3)"
                                class="border-2 px-5 py-3 flex justify-between gap-2 rounded-md hover:border-[#003171] transition-all duration-300">
                                <div class="flex gap-2 justify-start">
                                    <i v-for="star in 5" :key="star"
                                        :class="['fa-solid fa-star', star <= 3 ? 'text-[#FFD700]' : 'text-gray-300']"></i>
                                </div>
                                <p class="font-semibold text-[14px]">({{ starCounts[3] }})</p>
                            </button>
                            <button @click.prevent="selected(2)"
                                class="border-2 px-5 py-3 flex justify-between gap-2 rounded-md hover:border-[#003171] transition-all duration-300">
                                <div class="flex gap-2 justify-start">
                                    <i v-for="star in 5" :key="star"
                                        :class="['fa-solid fa-star', star <= 2 ? 'text-[#FFD700]' : 'text-gray-300']"></i>
                                </div>
                                <p class="font-semibold text-[14px]">({{ starCounts[2] }})</p>
                            </button>
                            <button @click.prevent="selected(1)"
                                class="border-2 px-5 py-3 flex justify-between gap-2 rounded-md hover:border-[#003171] transition-all duration-300">
                                <div class="flex gap-2 justify-start">
                                    <i v-for="star in 5" :key="star"
                                        :class="['fa-solid fa-star', star <= 1 ? 'text-[#FFD700]' : 'text-gray-300']"></i>
                                </div>
                                <p class="font-semibold text-[14px]">({{ starCounts[1] }})</p>
                            </button>
                        </div>
                    </div>
                    <div class="flex flex-col gap-4 w-full overflow-y-auto max-h-[calc(100vh-200px)]">
                        <div v-if="chooseFeedBackWithStar.length > 0"
                            class="bg-white p-4 w-full border-2 rounded-lg shadow-lg">
                            <div v-for="(comment, index) in chooseFeedBackWithStar" :key="index"
                                class="flex py-4 border-b flex-col gap-2 w-full">
                                <div class="flex gap-4 w-full">
                                    <img :src="`/src/assets/img/${comment.HinhAnhKhachHang}`"
                                        class="w-[60px] h-[60px] rounded-full object-cover" alt="">
                                    <div class="">
                                        <p class="text-[14px] font-semibold">{{ comment.TenKhachHang }}</p>
                                        <div class="flex gap-1 my-1">
                                            <i v-for="star in 5" :key="star" :class="{
                                                'fa-solid fa-star text-[#FFD700] text-[10px]': star <= comment.ChatLuong,
                                                'fa-solid fa-star text-[#C0C0C0] text-[10px]': star > comment.ChatLuong
                                            }"></i>
                                        </div>
                                        <p class="text-[12px] font-semibold mb-1">{{ formatDate(comment.NgayDang) }}</p>
                                    </div>
                                </div>
                                <div class="flex flex-col">
                                    <p class="my-4 text-justify">{{ comment.MoTa }}</p>
                                    <div class="flex gap-4">
                                        <img v-for="(img, index) in comment.HinhAnhSanPham" :key="index"
                                            :src="`/src/assets/img_feedback/${img}`"
                                            class="w-[80px] lg:w-[100px] border-2" alt="">
                                    </div>
                                </div>
                                <div class="flex flex-wrap" v-for="(product, index) in comment.SanPhamDaDanhGia"
                                    :key="index">
                                    <p class="text-gray-500 text-[12px] mr-1">{{ product.TenSanPham }}</p>
                                    <p class="text-gray-500 text-[12px] mr-1">/ {{ product.MaSanPham }}</p>
                                    <p class="text-gray-500 text-[12px] mr-1">/ {{ product.LoaiSanPham }}</p>
                                </div>
                            </div>
                        </div>
                        <div v-else class="bg-white p-4 w-full border-2 rounded-lg shadow-lg flex items-center justify-center">
                            <div class="flex justify-center items-center m-auto w-full h-full">
                                <div class="flex flex-col items-center justify-center gap-3">
                                    <p class="font-semibold text-[18px] lg:text-[24px] text-center">Hiện tại
                                        không có đánh giá nào!</p>
                                    <img src="../../assets/img/rb_4168.png" class="w-[200px] lg:w-[380px]" alt="">
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