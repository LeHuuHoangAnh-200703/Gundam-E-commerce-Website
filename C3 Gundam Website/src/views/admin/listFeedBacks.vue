<script setup>
import { ref, onMounted, computed } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import EmtyStateAdmin from '@/components/Notification/EmtyStateAdmin.vue';
import axios from 'axios';

const comments = ref([]);
const searchValue = ref("");
const selectedStar = ref(6);
const isToxic = ref(null);
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

const formatDate = (time) => {
    if (!time) return ''

    const now = new Date()
    const postTime = new Date(time)
    const diffInSeconds = Math.floor((now - postTime) / 1000)

    if (diffInSeconds < 60) return 'Vừa xong'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`

    return postTime.toLocaleDateString('vi-VN')
};

const totalQuality = computed(() => {
    // Lọc ra những bình luận không tiêu cực (isToxic !== true)
    const nonToxicComments = comments.value.filter(comment => comment.isToxic !== true);
    
    if (!nonToxicComments.length) return 0;
    
    const total = nonToxicComments.reduce((sum, comment) => sum + (comment.ChatLuong || 0), 0);
    const average = total / nonToxicComments.length;
    return average.toFixed(1);
});

const chooseFeedBackWithStar = computed(() => {
    return comments.value.filter(comment => {
        const matchesStar = selectedStar.value === 6 || comment.ChatLuong === selectedStar.value;
        const matchesSearch = !searchValue.value ||
            comment.TenKhachHang.toLowerCase().includes(searchValue.value.toLowerCase()) ||
            comment.SanPhamDaDanhGia.some(item =>
                item.TenSanPham.toLowerCase().includes(searchValue.value.toLowerCase()) ||
                item.MaSanPham.toLowerCase().includes(searchValue.value.toLowerCase())
            );
        const matchesToxic = isToxic.value === null ? comment.isToxic === false : comment.isToxic === isToxic.value;
        return matchesStar && matchesSearch && matchesToxic;
    });
});

const starCounts = computed(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, Toxic: 0, nonToxic: 0 };
    comments.value.forEach(comment => {
        if (comment.isToxic === true) {
            counts.Toxic++;
        } else {
            counts.nonToxic++;
            if (comment.ChatLuong >= 1 && comment.ChatLuong <= 5) {
                counts[comment.ChatLuong]++;
            }
        }
    });
    return counts;
});

const selected = (item) => {
    selectedStar.value = item;
    isToxic.value = null;
}

const selectedToxic = (item) => {
    isToxic.value = item;
    selectedStar.value = 6;
}

onMounted(() => {
    fetchFeedBacks();
})
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full h-screen font-sans flex">
        <SideBar />
        <div class="flex-1 flex flex-col h-screen overflow-hidden">
            <div class="flex-shrink-0 p-4">
                <Navbar />
            </div>
            <div class="flex-1 px-4 py-4 overflow-y-auto">
                <div class="flex flex-col gap-4">
                    <div class="flex lg:flex-row flex-col gap-4 justify-center lg:justify-between items-center">
                        <h1 class="font-bold text-[20px] uppercase">Quản lý đánh giá</h1>
                    </div>
                    <div class="w-full flex lg:flex-row flex-col gap-8 items-start">
                        <div class="flex flex-col gap-5 bg-white p-4 rounded-lg shadow-lg w-full lg:w-1/3">
                            <div class="flex flex-col gap-2">
                                <p class="text-[24px] xl:text-[20px] font-semibold"><span
                                        class="text-[30px] xl:text-[26px]">{{ totalQuality }}</span> trên 5 <i
                                        class="fa-solid fa-star text-[#FFD700]"></i></p>
                            </div>
                            <div class="flex flex-col gap-2">
                                <p class="font-semibold text-[18px] xl:text-[16px]">Tìm kiếm theo sao</p>
                                <button @click.prevent="selected(6)"
                                    class="border-2 px-5 py-3 xl:text-[12px] flex justify-between font-semibold gap-2 rounded-md hover:border-[#003171] transition-all duration-300">Tất
                                    cả đánh giá <span> ({{ starCounts.nonToxic }})</span></button>
                                <button @click.prevent="selected(5)"
                                    class="border-2 px-5 py-3 flex justify-between gap-2 rounded-md hover:border-[#003171] transition-all duration-300">
                                    <div class="flex gap-2 justify-start">
                                        <i v-for="star in 5" :key="star" class=" xl:text-[12px]"
                                            :class="['fa-solid fa-star', star <= 5 ? 'text-[#FFD700]' : 'text-gray-300']"></i>
                                    </div>
                                    <p class="font-semibold text-[14px] xl:text-[12px]">({{ starCounts[5] }})</p>
                                </button>
                                <button @click.prevent="selected(4)"
                                    class="border-2 px-5 py-3 flex justify-between gap-2 rounded-md hover:border-[#003171] transition-all duration-300">
                                    <div class="flex gap-2 justify-start">
                                        <i v-for="star in 5" :key="star" class=" xl:text-[12px]"
                                            :class="['fa-solid fa-star', star <= 4 ? 'text-[#FFD700]' : 'text-gray-300']"></i>
                                    </div>
                                    <p class="font-semibold text-[14px] xl:text-[12px]">({{ starCounts[4] }})</p>
                                </button>
                                <button @click.prevent="selected(3)"
                                    class="border-2 px-5 py-3 flex justify-between gap-2 rounded-md hover:border-[#003171] transition-all duration-300">
                                    <div class="flex gap-2 justify-start">
                                        <i v-for="star in 5" :key="star" class=" xl:text-[12px]"
                                            :class="['fa-solid fa-star', star <= 3 ? 'text-[#FFD700]' : 'text-gray-300']"></i>
                                    </div>
                                    <p class="font-semibold text-[14px] xl:text-[12px]">({{ starCounts[3] }})</p>
                                </button>
                                <button @click.prevent="selected(2)"
                                    class="border-2 px-5 py-3 flex justify-between gap-2 rounded-md hover:border-[#003171] transition-all duration-300">
                                    <div class="flex gap-2 justify-start">
                                        <i v-for="star in 5" :key="star" class=" xl:text-[12px]"
                                            :class="['fa-solid fa-star', star <= 2 ? 'text-[#FFD700]' : 'text-gray-300']"></i>
                                    </div>
                                    <p class="font-semibold text-[14px] xl:text-[12px]">({{ starCounts[2] }})</p>
                                </button>
                                <button @click.prevent="selected(1)"
                                    class="border-2 px-5 py-3 flex justify-between gap-2 rounded-md hover:border-[#003171] transition-all duration-300">
                                    <div class="flex gap-2 justify-start">
                                        <i v-for="star in 5" :key="star" class=" xl:text-[12px]"
                                            :class="['fa-solid fa-star', star <= 1 ? 'text-[#FFD700]' : 'text-gray-300']"></i>
                                    </div>
                                    <p class="font-semibold text-[14px] xl:text-[12px]">({{ starCounts[1] }})</p>
                                </button>
                                <button @click.prevent="selectedToxic(true)"
                                    class="border-2 px-5 py-3 flex justify-between gap-2 rounded-md hover:border-[#003171] transition-all duration-300">
                                    <p class="font-semibold text-[14px] xl:text-[12px]">Bình luận tiêu cực</p>
                                    <p class="font-semibold text-[14px] xl:text-[12px]">({{ starCounts.Toxic }})</p>
                                </button>
                            </div>
                        </div>
                        <div class="flex flex-col gap-6 w-full">
                            <div class="relative flex justify-center gap-2 w-full lg:max-w-[calc(100vw-200px)]">
                                <input type="text" v-model="searchValue"
                                    class="items-center w-full p-3 bg-white border pr-10 border-gray-400 text-[12px] font-semibold tracking-wider text-black rounded-md focus:outline-none"
                                    placeholder="Tìm kiếm đánh giá sản phẩm..." />
                                <i
                                    class="fa-solid fa-magnifying-glass absolute top-2 lg:top-3 right-3 text-[22px] text-[#003171]"></i>
                            </div>
                            <div class="flex flex-col gap-4 w-full overflow-y-auto max-h-[calc(100vh-200px)]">
                                <div v-if="chooseFeedBackWithStar.length > 0"
                                    class="bg-white p-4 w-full border-2 rounded-lg shadow-lg">
                                    <div v-for="(comment, index) in chooseFeedBackWithStar" :key="index"
                                        class="flex py-4 border-b flex-col gap-2 w-full">
                                        <div class="flex gap-4 w-full">
                                            <img :src="`${comment.HinhAnhKhachHang ? comment.HinhAnhKhachHang : '/src/assets/img/avatar.jpg'}`"
                                                class="w-[60px] h-[60px] xl:w-[50px] xl:h-[50px] rounded-full object-cover"
                                                alt="">
                                            <div class="">
                                                <p class="text-[14px] xl:text-[12px] font-semibold">{{
                                                    comment.TenKhachHang
                                                }}
                                                </p>
                                                <div class="flex gap-1 my-1">
                                                    <i v-for="star in 5" :key="star" :class="{
                                                        'fa-solid fa-star text-[#FFD700] text-[10px]': star <= comment.ChatLuong,
                                                        'fa-solid fa-star text-[#C0C0C0] text-[10px]': star > comment.ChatLuong
                                                    }"></i>
                                                </div>
                                                <p class="text-[12px] xl:text-[10px] font-semibold mb-1">{{
                                                    formatDate(comment.NgayDang) }}</p>
                                            </div>
                                        </div>
                                        <div class="flex flex-col">
                                            <p class="my-4 text-justify xl:text-[14px]">{{ comment.MoTa }}</p>
                                            <div class="flex gap-4">
                                                <img v-for="(img, index) in comment.HinhAnhSanPham" :key="index"
                                                    :src="`${img}`" class="w-[80px] lg:w-[100px] xl:w-[80px] border-2"
                                                    alt="">
                                            </div>
                                        </div>
                                        <div class="flex flex-wrap" v-for="(product, index) in comment.SanPhamDaDanhGia"
                                            :key="index">
                                            <p class="text-gray-500 text-[12px] xl:text-[10px] mr-1">{{
                                                product.TenSanPham
                                            }}
                                            </p>
                                            <p class="text-gray-500 text-[12px] xl:text-[10px] mr-1">/ {{
                                                product.MaSanPham
                                            }}
                                            </p>
                                            <p class="text-gray-500 text-[12px] xl:text-[10px] mr-1">/ {{
                                                product.LoaiSanPham }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div v-else
                                    class="bg-white p-4 w-full border-2 rounded-lg shadow-lg flex items-center justify-center">
                                    <EmtyStateAdmin icon="fa-comments" title="Chưa có đánh giá nào"
                                        message="Hiện tại chưa có đánh giá nào hoặc chưa có đánh giá nào phù hợp với trạng thái vừa chọn!" />
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
</style>