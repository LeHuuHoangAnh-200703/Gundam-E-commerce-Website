<script setup>
import { ref, onMounted, computed } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import axios from 'axios';

const listPost = ref([]);

const fetchCommunityPost = async () => {
    try {
        const response = await axios.get("http://localhost:3000/api/baidang");
        listPost.value = response.data.filter(post => {
            return post.TrangThaiDang !== 'Đã duyệt'
        }).map(post => {
            return {
                ...post,
                ThoiGianDang: new Date(post.ThoiGianDang)
            }
        })
    } catch (error) {
        console.log('Error fetching:', error);
    }
}

const updateStatus = async (maBaiDang, newStatus) => {
    const confirmUpdate = confirm("Bạn có chắc chắn duyệt bài đăng này không?");
    if (!confirmUpdate) return;
    const nextStatus = newStatus === 'Đang chờ duyệt' ? 'Đã duyệt' : 'Đang chờ duyệt';

    try {
        const response = await axios.patch(`http://localhost:3000/api/baidang/${maBaiDang}`, {
            TrangThaiDang: nextStatus,
        });
    } catch (error) {
        console.error('Error updating status:', error);
    }
};

const formatTime = (time) => {
    return new Date(time).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
};

onMounted(() => {
    fetchCommunityPost();
})
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full min-h-screen font-sans">
        <div class="flex gap-3">
            <SideBar />
            <div class="relative p-4 flex flex-col gap-4 w-full overflow-auto">
                <Navbar />
                <div class="w-full relative flex flex-col gap-4 max-h-[calc(100vh-120px)] pb-1 pt-2">
                    <h1 class="font-bold text-[20px] uppercase">Quản lý bài đăng</h1>
                </div>
                <div class="shadow-lg border-2 rounded-md overflow-auto p-4 bg-white">
                    <div v-if="listPost.length > 0" class="flex flex-col gap-4">
                        <div v-for="(post, index) in listPost" :key="index" class="flex flex-col gap-2 w-full">
                            <p class="font-semibold text-[14px]">Nội dung: <span class="font-medium">{{ post.NoiDung
                                    }}</span></p>
                            <p class="font-semibold text-[14px]">Loại bài đăng: <span class="font-medium">{{
                                post.LoaiBaiDang }}</span>
                            </p>
                            <p class="font-semibold text-[14px]">Trạng thái: <span class="font-medium text-[#DC143C]">{{
                                post.TrangThaiDang }}</span></p>
                            <p class="font-semibold text-[14px]">Thời gian đăng: <span class="font-medium">{{
                                formatTime(post.ThoiGianDang) }}</span></p>
                            <div class="block">
                                <p class="font-semibold text-[14px] mb-2">Hình ảnh bài đăng: </p>
                                <div class="flex gap-2 mb-2">
                                    <img v-for="(img, index) in post.HinhAnh" :key="index" :src="img"
                                        class="w-[65px] lg:w-[90px] border-2" alt="">
                                </div>
                            </div>
                            <div class="flex gap-2 items-end justify-end">
                                <button type="submit" @click="updateStatus(post.MaBaiDang, post.TrangThaiDang)"
                                    class="inline-block text-white font-medium bg-[#008B8B] py-2 px-4 rounded-md transition-all duration-300 hover:bg-[#008080] whitespace-nowrap"><i
                                        class="fa-solid fa-check"></i></button>
                                <button type="submit"
                                    class="inline-block text-white font-medium bg-[#DC143C] py-2 px-4 rounded-md transition-all duration-300 hover:bg-[#A52A2A] whitespace-nowrap"><i
                                        class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
                    <div v-else
                        class="bg-white p-4 w-full flex items-center justify-center">
                        <div class="flex justify-center items-center m-auto w-full h-full">
                            <div class="flex flex-col items-center justify-center gap-3">
                                <p class="font-semibold text-[18px] lg:text-[24px] text-center">Hiện tại
                                    không có bài đăng nào!</p>
                                <img src="../../assets/img/empty_admin.png" class="w-[350px]" alt="">
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