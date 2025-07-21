<script setup>
import { onMounted, ref } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import EmtyState from '@/components/Notification/EmtyState.vue';
import axios from "axios";
import { useRouter } from 'vue-router';

const router = useRouter();
const avatarCustomer = ref('');
const nameCustomer = ref('');
const idCustomer = ref('');
const listPost = ref([]);
const listTopPost = ref([]);

const fetchCustomer = async () => {
    const maKhachHang = localStorage.getItem("MaKhachHang");
    try {
        const response = await axios.get(`http://localhost:3000/api/khachhang/${maKhachHang}`);
        avatarCustomer.value = response.data.Image;
        nameCustomer.value = response.data.TenKhachHang;
        idCustomer.value = response.data.MaKhachHang;
    } catch (error) {
        console.log("Error fetching: ", error);
    }
}

const fetchCommunityPost = async () => {
    try {
        const response = await axios.get("http://localhost:3000/api/baidang");
        listPost.value = response.data.filter(post => {
            return post.TrangThaiDang === 'Đã duyệt'
        }).map(post => {
            return {
                ...post,
                ThoiGianDang: new Date(post.ThoiGianDang)
            }
        }).sort((a, b) => b.ThoiGianDang - a.ThoiGianDang);
    } catch (error) {
        console.log("Error fetching: ", error);
    }
}

const fetchTopCommunityPost = async () => {
    try {
        const response = await axios.get("http://localhost:3000/api/baidang/top/topbinhluan");
        listTopPost.value = response.data.filter(post => {
            return post.TrangThaiDang === 'Đã duyệt'
        }).map(post => {
            return {
                ...post,
                ThoiGianDang: new Date(post.ThoiGianDang)
            }
        });
    } catch (error) {
        console.log("Error fetching: ", error);
    }
}

const formatTime = (time) => {
    if (!time) return ''

    const now = new Date()
    const postTime = new Date(time)
    const diffInSeconds = Math.floor((now - postTime) / 1000)

    if (diffInSeconds < 60) return 'Vừa xong'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`

    return postTime.toLocaleDateString('vi-VN')
}

onMounted(() => {
    fetchCustomer();
    fetchCommunityPost();
    fetchTopCommunityPost();
})
</script>

<template>
    <div
        class="bg-gradient-to-br from-[#0F1419] via-[#1A1D27] to-[#0F1419] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="relative mb-5 mx-2 sm:mx-4 md:mx-8 lg:mx-[210px] xl:mx-[210px] flex flex-grow">
            <div class="w-full overflow-y-auto flex flex-col gap-4 sm:gap-6">
                <div class="w-full flex gap-3 sm:gap-5 items-center bg-gray-700 p-3 sm:p-4 rounded-md border-2">
                    <div class="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14">
                        <img :src="avatarCustomer ? `${avatarCustomer}` : '/src/assets/img/avatar.jpg'"
                            class="w-full h-full rounded-full object-cover" alt="Avatar">
                    </div>
                    <router-link :to="`/addCommunityPost/${idCustomer}`"
                        class="flex-1 min-w-0 text-white text-sm sm:text-base font-medium p-3 sm:p-4 bg-gray-600 rounded-md hover:bg-gray-500 transition-all duration-200 truncate">
                        {{ nameCustomer }} ơi, bạn đang nghĩ gì thế ?
                    </router-link>
                </div>
                <h1
                    class="font-bold self-start text-[20px] uppercase text-white text-start border-b-2 border-[#DC143C] pb-2">
                    Bài đăng được quan tâm nhiều nhất</h1>
                <div v-if="listPost.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <router-link :to="`/commentCommunityPost/${topPost.MaBaiDang}`" class="w-full flex flex-col group"
                        v-for="topPost in listTopPost" :key="topPost.MaBaiDang">
                        <div class="w-full flex-shrink-0">
                            <img :src="topPost.HinhAnh[0]"
                                class="w-full aspect-[4/3] object-cover rounded-t-md md:rounded-tl-md md:rounded-br-none"
                                alt="">
                        </div>
                        <div class="flex flex-col gap-4 p-4 lg:p-6 bg-white border-b-4 border-[#DC143C] rounded-b-md">
                            <div class="flex gap-3">
                                <p
                                    class="font-bold text-[#DC143C] pb-1 border-b-4 border-[#DC143C] uppercase text-[16px] self-start">
                                    {{ topPost.LoaiBaiDang }}
                                </p>
                                <p
                                    class="font-bold text-gray-600 pb-1 border-b-4 border-gray-600 text-[16px] self-start">
                                    {{ formatTime(topPost.ThoiGianDang) }}
                                </p>
                            </div>
                            <h3
                                class="text-base sm:text-lg lg:text-xl font-bold text-gray-800 line-clamp-2 group-hover:text-[#DC143C] transition-colors duration-200">
                                {{ topPost.TieuDe }}
                            </h3>
                            <p class="font-semibold text-sm text-gray-700">
                                Tác giả: <span class="text-[#DC143C]">{{ topPost.TenKhachHang }}</span>
                            </p>
                            <div class="w-auto flex justify-end items-center gap-1">
                                <p class="font-semibold text-base text-[#DC143C]">{{ topPost.BinhLuan.length }} <span
                                        class="text-gray-700">Bình
                                        luận</span></p>
                            </div>
                        </div>
                    </router-link>
                </div>
                <EmtyState v-else icon="fa-file-lines" title="Chưa có bài đăng nào" message="Không có bài đăng nào được tạo.
                                    Hãy bắt đầu viết bài đăng đầu tiên để chia sẻ nội dung thú vị!" />
                <h1
                    class="font-bold self-start text-[20px] uppercase text-white text-start border-b-2 border-[#DC143C] pb-2">
                    tất cả bài đăng tại cộng đồng c3 gundam</h1>
                <div class="w-full">
                    <div v-if="listPost.length > 0" class="flex flex-col gap-4 sm:gap-6 w-full">
                        <div v-for="post in listPost" :key="post.MaBaiDang" class="w-full">
                            <router-link :to="`/commentCommunityPost/${post.MaBaiDang}`"
                                class="flex flex-col md:flex-row w-full cursor-pointer group hover:shadow-lg transition-all duration-300">
                                <div class="w-full md:w-48 lg:w-52 h-48 md:h-52 flex-shrink-0">
                                    <img :src="post.HinhAnh[0]"
                                        class="w-full h-full object-cover rounded-t-md md:rounded-l-md md:rounded-tr-none"
                                        alt="Post image">
                                </div>
                                <div
                                    class="bg-white border-b-4 border-[#DC143C] rounded-b-md md:rounded-r-md md:rounded-bl-none flex flex-col justify-center gap-2 sm:gap-3 p-4 sm:p-6 lg:p-8 w-full">
                                    <div class="flex flex-row gap-2 xs:gap-4">
                                        <p
                                            class="font-bold text-[#DC143C] pb-1 border-b-4 border-[#DC143C] uppercase text-xs sm:text-sm self-start">
                                            {{ post.LoaiBaiDang }}
                                        </p>
                                        <p
                                            class="font-bold text-gray-600 pb-1 border-b-4 border-gray-600 text-xs sm:text-sm self-start">
                                            {{ formatTime(post.ThoiGianDang) }}
                                        </p>
                                    </div>
                                    <h3
                                        class="text-base sm:text-lg lg:text-xl font-bold text-gray-800 line-clamp-2 group-hover:text-[#DC143C] transition-colors duration-200">
                                        {{ post.TieuDe }}
                                    </h3>
                                    <p class="font-semibold text-sm text-gray-700">
                                        Tác giả: <span class="text-[#DC143C]">{{ post.TenKhachHang }}</span>
                                    </p>
                                </div>
                            </router-link>
                        </div>
                    </div>
                    <EmtyState v-else icon="fa-file-lines" title="Chưa có bài đăng nào" message="Không có bài đăng nào được tạo.
                                    Hãy bắt đầu viết bài đăng đầu tiên để chia sẻ nội dung thú vị!" />
                </div>
            </div>
        </div>
        <Footer />
        <BackToTop />
    </div>
</template>

<style scoped></style>