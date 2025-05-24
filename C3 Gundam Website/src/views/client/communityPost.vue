<script setup>
import { onMounted, ref, computed } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import axios from "axios";
import { useRouter } from 'vue-router';

const router = useRouter();
const avatarCustomer = ref('');
const nameCustomer = ref('');
const idCustomer = ref('');
const listPost = ref([]);
const categoryPost = [
    {
        name: 'Hướng dẫn lắp ráp',
        type: 'Assemble'
    },
    {
        name: 'Gundam Sưu tầm',
        type: 'Collect'
    },
    {
        name: 'Gundam mới ra mắt',
        type: 'GundamNew'
    },
    {
        name: 'Custom Gundam',
        type: 'Custom'
    },
]
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
        console.log(listPost.value)
    } catch (error) {
        console.log("Error fetching: ", message.error);
    }
}

const formatTime = (time) => {
    return new Date(time).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
};

onMounted(() => {
    fetchCustomer();
    fetchCommunityPost();
})
</script>

<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="relative mb-5 m-2 lg:mx-[200px] flex flex-grow gap-6">
            <div class="w-full overflow-y-auto flex items-center flex-col gap-6">
                <div class="w-full flex gap-5 items-center bg-gray-700 p-3 rounded-lg border-2">
                    <div class="lg:w-[7%] w-[20%]">
                        <img :src="avatarCustomer ? `${avatarCustomer}` : '/src/assets/img/avatar.jpg'"
                            class="w-12 h-12 lg:w-12 lg:h-12 rounded-full object-cover" alt="">
                    </div>
                    <router-link :to="`/addCommunityPost/${idCustomer}`"
                        class="w-full text-white text-[12px] lg:text-[16px] font-medium p-4 bg-gray-600 rounded-lg hover:bg-gray-500 transition-all duration-200">
                        {{ nameCustomer }} ơi, bạn đang nghĩ gì thế ?
                    </router-link>
                </div>
                <div class="flex lg:flex-row flex-col gap-6">
                    <div class="hidden lg:flex flex-col items-start gap-6 w-[35%]">
                        <p class="text-white font-bold uppercase text-[20px] border-b-4 border-[#DC143C] pb-5">Cộng đồng
                            fan gundam của c3</p>
                        <button v-for="item in categoryPost" :key="item"
                            class="text-white font-semibold text-[18px] group">{{
                                item.name }}
                            <div
                                class="h-[2px] bg-[#DB3F4C] scale-x-0 group-hover:scale-100 rounded-full transition-all ease-out origin-left duration-500">
                            </div>
                        </button>
                    </div>
                    <select name="" id="" class="w-full p-4 font-semibold block lg:hidden">
                        <option value="All" class="uppercase">Cộng đồng fan gundam của c3</option>
                        <option :value="item.type" v-for="item in categoryPost" :key="item">{{ item.name }}</option>
                    </select>
                    <div class="flex flex-col gap-6 w-full lg:w-[65%]">
                        <div v-for="post in listPost" :key="post.MaBaiDang"
                            class="bg-gray-700 rounded-lg border-2 flex flex-col gap-4">
                            <div class="pt-4 px-4 flex flex-col gap-3">
                                <div class="flex items-center justify-between">
                                    <div class="flex gap-2">
                                        <img :src="post.HinhAnhKhachHang ? `${post.HinhAnhKhachHang}` : '/src/assets/img/avatar.jpg'"
                                            class="w-12 h-12 lg:w-12 lg:h-12 rounded-full object-cover" alt="">
                                        <div class="flex flex-col">
                                            <p class="text-white font-semibold text-[18px]">{{ post.TenKhachHang }}</p>
                                            <p class="text-white text-[12px] font-medium">{{
                                                formatTime(post.ThoiGianDang) }}</p>
                                        </div>
                                    </div>
                                    <button class="text-white text-[16px]">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                                <p class="text-white font-medium font-sans">{{ post.NoiDung }}</p>
                            </div>
                            <div class="grid grid-cols-2 gap-1">
                                <img v-for="(img, index) in post.HinhAnh" :key="index" :src="img" class="w-full h-full"
                                    alt="">
                            </div>
                            <div class="px-4 flex flex-col gap-2">
                                <div class="flex items-center justify-between">
                                    <div class="flex gap-2 items-center">
                                        <i class="fa-solid fa-heart text-[#DC143C] text-[18px]"></i>
                                        <p class="text-white font-medium">{{ post.LuotThich }} lượt yêu thích</p>
                                    </div>
                                    <div class="flex gap-2 items-center">
                                        <p class="text-white font-medium">{{ post.BinhLuan.length }}</p>
                                        <i class="fa-solid fa-comment text-white text-[18px]"></i>
                                    </div>
                                </div>
                                <hr class="mb-2">
                                <div class="flex items-center justify-between mb-3">
                                    <button class="flex gap-2 items-center">
                                        <i class="fa-solid fa-heart text-gray-500 text-[25px]"></i>
                                        <p class="text-white text-[16px] font-medium">Thích</p>
                                    </button>
                                    <router-link :to="`/commentCommunityPost/${post.MaBaiDang}`" class="flex gap-2 items-center">
                                        <i class="fa-solid fa-comment text-gray-500 text-[25px]"></i>
                                        <p class="text-white text-[16px] font-medium">Bình luận</p>
                                    </router-link>
                                </div>
                            </div>
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