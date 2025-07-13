<script setup>
import { onMounted, ref, computed } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import EmtyState from '@/components/Notification/EmtyState.vue';
import axios from "axios";
import { useRouter } from 'vue-router';

const router = useRouter();
const idCustomer = ref('');
const listPost = ref([]);

const fetchCustomer = async (idKhachHang) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/khachhang/${idKhachHang}`);
        idCustomer.value = response.data.MaKhachHang;
    } catch (error) {
        console.log("Error fetching: ", error);
    }
}

const fetchCommunityPost = async (idKhachHang) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/baidang/danhsachbaidang/${idKhachHang}`);
        listPost.value = response.data.filter(post => {
            return post.TrangThaiDang === 'Đã duyệt'
        }).map(post => {
            return {
                ...post,
                ThoiGianDang: new Date(post.ThoiGianDang)
            }
        }).sort((a, b) => b.ThoiGianDang - a.ThoiGianDang);
    } catch (error) {
        console.log("Error fetching: ", message.error);
    }
}
const formatTime = (time) => {
    return new Date(time).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
};

onMounted(() => {
    const idKhachHang = router.currentRoute.value.params.maKhachHang;
    fetchCustomer(idKhachHang);
    fetchCommunityPost(idKhachHang);
})
</script>

<template>
    <div
        class="bg-gradient-to-br from-[#0F1419] via-[#1A1D27] to-[#0F1419] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="relative mb-5 mx-2 sm:mx-4 md:mx-8 lg:mx-[210px] xl:mx-[210px] flex flex-grow">
            <div class="w-full overflow-y-auto flex flex-col gap-6 mt-6">
                <div class="w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <h1
                        class="font-bold self-start text-[20px] uppercase text-white text-start border-b-2 border-[#DC143C] pb-2">
                        Danh sách bài đăng</h1>
                    <div class="w-full lg:w-auto flex justify-end">
                        <router-link :to="`/addCommunityPost/${idCustomer}`"
                            class="inline-block px-5 py-3 bg-[#4169E1] text-[14px] rounded-md font-bold text-white whitespace-nowrap">
                            <i class="fa-solid fa-plus"></i> Đăng bài
                        </router-link>
                    </div>
                </div>
                <div class="w-full">
                    <div v-if="listPost.length > 0" class="flex flex-col gap-4 sm:gap-6 w-full">
                        <div v-for="post in listPost" :key="post.MaBaiDang" class="w-full">
                            <router-link :to="`/commentCommunityPost/${post.MaBaiDang}`"
                                class="relative flex flex-col md:flex-row w-full cursor-pointer group hover:shadow-lg transition-all duration-300">
                                <div class="w-full md:w-48 lg:w-52 h-48 md:h-52 flex-shrink-0">
                                    <img :src="post.HinhAnh[0]"
                                        class="w-full h-full object-cover rounded-t-md md:rounded-l-md md:rounded-tr-none"
                                        alt="Post image">
                                </div>
                                <div
                                    class="bg-white border-b-4 border-[#DC143C] rounded-b-md md:rounded-r-md md:rounded-bl-none flex flex-col justify-center gap-2 sm:gap-3 p-4 sm:p-6 lg:p-8 w-full">
                                    <div class="flex flex-row gap-2 xs:gap-4">
                                        <p
                                            class="font-semibold text-[#DC143C] pb-1 border-b-2 border-[#DC143C] uppercase text-xs sm:text-sm self-start">
                                            {{ post.LoaiBaiDang }}
                                        </p>
                                        <p
                                            class="font-semibold text-gray-600 pb-1 border-b-2 border-gray-600 text-xs sm:text-sm self-start">
                                            {{ formatTime(post.ThoiGianDang) }}
                                        </p>
                                    </div>
                                    <h3
                                        class="text-base sm:text-lg lg:text-xl font-bold text-gray-800 line-clamp-2 group-hover:text-[#DC143C] transition-colors duration-200">
                                        {{ post.TieuDe }}
                                    </h3>
                                    <div
                                        class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-1">
                                        <p class="font-semibold text-base text-gray-700">
                                            Tác giả: <span class="text-[#DC143C]">{{ post.TenKhachHang }}</span>
                                        </p>
                                        <p class="font-semibold text-base text-[#DC143C]">{{ post.BinhLuan.length }}
                                            <span class="text-gray-700">Bình luận</span>
                                        </p>
                                    </div>
                                </div>
                            </router-link>
                        </div>
                    </div>
                    <div v-else
                        class="flex justify-center items-center w-full rounded-xl p-6 sm:p-8 border border-gray-100">
                        <div
                            class="flex flex-col items-center justify-center max-w-md mx-auto">
                            <EmtyState icon="fa-file-lines" title="Chưa có bài đăng nào" message="Không có bài đăng nào được tạo.
                                    Hãy bắt đầu viết bài đăng đầu tiên để chia sẻ nội dung thú vị!" />
                            <router-link :to="`/addCommunityPost/${idCustomer}`"
                                class="w-full">
                                <div
                                    class="flex-1 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                            <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M12 4v16m8-8H4"></path>
                                            </svg>
                                        </div>
                                        <span class="text-sm font-medium text-indigo-700">Tạo bài đăng mới</span>
                                    </div>
                                </div>
                            </router-link>
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