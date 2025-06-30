<script setup>
import { ref, onMounted, computed } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import ConfirmDialog from "@/components/Notification/ConfirmDialog.vue";
import NotificationAdmin from "@/components/Notification/NotificationAdmin.vue";
import axios from 'axios';

const listPost = ref([]);
const searchValue = ref('');
const notification = ref({
    message: '',
    type: ''
});
const showNotification = (msg, type) => {
    notification.value = { message: msg, type: type };
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
};

const dialogState = ref({
    visible: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy bỏ',
    onConfirm: null,
    onCancel: null
});

const showConfirmDialog = (config) => {
    dialogState.value = {
        visible: true,
        title: config.title || 'Xác nhận',
        message: config.message || 'Bạn có chắc chắn muốn thực hiện hành động này?',
        type: config.type || 'warning',
        confirmText: config.confirmText || 'Xác nhận',
        cancelText: config.cancelText || 'Hủy bỏ',
        onConfirm: config.onConfirm,
        onCancel: config.onCancel
    };
};

const handleDialogConfirm = () => {
    if (dialogState.value.onConfirm) {
        dialogState.value.onConfirm();
    }
    dialogState.value.visible = false;
};

const handleDialogCancel = () => {
    if (dialogState.value.onCancel) {
        dialogState.value.onCancel();
    }
    dialogState.value.visible = false;
};

const handleDialogClose = () => {
    dialogState.value.visible = false;
};

const fetchCommunityPost = async () => {
    try {
        const response = await axios.get("http://localhost:3000/api/baidang");
        listPost.value = response.data.map(post => {
            return {
                ...post,
                ThoiGianDang: new Date(post.ThoiGianDang)
            }
        });
        const postApproved = listPost.value.filter(post => post.TrangThaiDang === 'Đã duyệt');
        const postWaiting = listPost.value.filter(post => post.TrangThaiDang === 'Đang chờ duyệt');
        listPost.value = [...postWaiting.sort((a, b) => new Date(a.ThoiGianDang) - new Date(b.ThoiGianDang)), ...postApproved.sort((a, b) => new Date(b.ThoiGianDang) - new Date(a.ThoiGianDang))]
    } catch (error) {
        console.log('Error fetching:', error);
    }
}

const updateStatus = async (maBaiDang, newStatus) => {
    showConfirmDialog({
        title: 'Thông báo xác nhận',
        message: 'Bạn có chắc chắn duyệt bài đăng này không?',
        type: 'success',
        confirmText: 'Duyệt',
        cancelText: 'Hủy bỏ',
        onConfirm: async () => {
            const nextStatus = newStatus === 'Đang chờ duyệt' ? 'Đã duyệt' : 'Đang chờ duyệt';

            try {
                const response = await axios.patch(`http://localhost:3000/api/baidang/${maBaiDang}`, {
                    TrangThaiDang: nextStatus,
                });
                showNotification("Duyệt bài đăng thành công!", "success");
                await fetchCommunityPost();
            } catch (error) {
                console.error('Error updating status:', error);
            }
        }
    });
};

const deletePost = async (idBaiDang) => {
    showConfirmDialog({
        title: 'Thông báo xác nhận',
        message: 'Bạn có chắc chắn xóa bài đăng này không?',
        type: 'error',
        confirmText: 'Xóa',
        cancelText: 'Hủy bỏ',
        onConfirm: async () => {
            try {
                await axios.delete(`http://localhost:3000/api/baidang/xoabaidang/${idBaiDang}`);
                showNotification("Xóa bài đăng thành công!", "success");
                await fetchCommunityPost();
            } catch (error) {
                console.log("Error delete post: ", error);
            }
        }
    });
}

const findCommunityPost = computed(() => {
    return listPost.value.filter(post => {
        const matchesSearch = !searchValue.value ||
        post.TenKhachHang.toLowerCase().includes(searchValue.value.toLowerCase())
        return matchesSearch;
    });
})

const formatTime = (time) => {
    return new Date(time).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
};

onMounted(() => {
    fetchCommunityPost();
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
                    <div class="w-full relative flex flex-col lg:flex-row items-center justify-between gap-4 pb-1 pt-2">
                        <h1 class="font-bold text-[20px] uppercase">Quản lý bài đăng</h1>
                        <div class="relative w-full max-w-md">
                            <input type="text" v-model="searchValue"
                                class="w-full p-3 pr-12 bg-white border border-gray-400 text-[12px] sm:text-[13px] font-semibold tracking-wider text-black rounded-md focus:outline-none focus:border-[#003171] focus:ring-1 focus:ring-[#003171]"
                                placeholder="Tìm kiếm bài đăng ..." />
                            <i
                                class="fa-solid fa-magnifying-glass absolute top-1/2 transform -translate-y-1/2 right-3 text-[20px] sm:text-[22px] text-[#003171]"></i>
                        </div>
                    </div>
                    <div class="overflow-auto">
                        <div v-if="listPost.length > 0" class="flex flex-col gap-4">
                            <div v-for="(post, index) in findCommunityPost" :key="index"
                                class="flex flex-col gap-2 w-full bg-white p-4 rounded-md shadow-lg border-2">
                                <div class="flex items-center justify-between">
                                    <div class="flex gap-2 items-center">
                                        <img :src="post.HinhAnhKhachHang ? post.HinhAnhKhachHang : '/src/assets/img/avatar.jpg'"
                                            class="w-[50px] h-[50px] rounded-full object-cover" alt="">
                                        <div class="flex flex-col">
                                            <p class="font-semibold text-[16px]">{{ post.TenKhachHang }}</p>
                                            <p class="font-semibold text-[12px] text-gray-600">{{
                                                formatTime(post.ThoiGianDang) }}</p>
                                        </div>
                                    </div>
                                    <p :class="post.TrangThaiDang !== 'Đã duyệt' ? 'border-red-500 text-red-600' : 'border-green-500 text-green-600'"
                                        class="border-2 px-4 py-2 rounded-md font-semibold text-[14px]">{{
                                            post.TrangThaiDang }}</p>
                                </div>
                                <p class="font-semibold text-[14px]">Tiêu đề: <span class="font-medium">{{ post.TieuDe
                                }}</span></p>
                                <p class="font-semibold text-[14px]">Nội dung: <span class="font-medium">{{ post.NoiDung
                                }}</span></p>
                                <p class="font-semibold text-[14px]">Loại bài đăng: <span class="font-medium">{{
                                    post.LoaiBaiDang }}</span>
                                </p>
                                <div class="block">
                                    <p class="font-semibold text-[14px] mb-2">Hình ảnh bài đăng: </p>
                                    <div class="flex gap-2 mb-2">
                                        <img v-for="(img, index) in post.HinhAnh" :key="index" :src="img"
                                            class="w-[65px] lg:w-[90px] max-h-[65px] border-2" alt="">
                                    </div>
                                </div>
                                <hr class="my-2">
                                <div class="flex gap-2 items-end justify-end">
                                    <button type="submit" @click="deletePost(post.MaBaiDang)"
                                        class="inline-block text-white font-medium bg-[#DC143C] py-2 px-4 rounded-md transition-all duration-300 hover:bg-[#A52A2A] whitespace-nowrap"><i
                                            class="fa-solid fa-trash"></i></button>
                                    <button type="submit" @click="updateStatus(post.MaBaiDang, post.TrangThaiDang)"
                                        :class="post.TrangThaiDang !== 'Đã duyệt' ? 'inline-block' : 'hidden'"
                                        class="text-white font-medium bg-[#008B8B] py-2 px-4 rounded-md transition-all duration-300 hover:bg-[#008080] whitespace-nowrap"><i
                                            class="fa-solid fa-check"></i></button>
                                </div>
                            </div>
                        </div>
                        <div v-else class="bg-white p-4 w-full flex items-center justify-center">
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
                <NotificationAdmin :message="notification.message" :type="notification.type" />
            </div>
        </div>
        <ConfirmDialog :visible="dialogState.visible" :title="dialogState.title" :message="dialogState.message"
            :type="dialogState.type" :confirmText="dialogState.confirmText" :cancelText="dialogState.cancelText"
            @confirm="handleDialogConfirm" @cancel="handleDialogCancel" @close="handleDialogClose" />
    </div>
</template>

<style scoped>
.active-link {
    background: #DB3F4C;
    color: white;
}
</style>