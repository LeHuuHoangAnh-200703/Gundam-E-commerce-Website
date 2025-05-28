<script setup>
import { onMounted, ref, computed } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import axios from "axios";
import NotificationClient from "@/components/Notification/NotificationClient.vue";
import { useRouter } from 'vue-router';

const router = useRouter();

const idCustomer = ref('');
const idCustomerLocal = localStorage.getItem('MaKhachHang');
const idPost = ref('');
const avatarCustomer = ref('');
const nameCustomer = ref('');
const timePost = ref('');
const content = ref('');
const images = ref([]);
const idCustomerLikePost = ref([]);
const comments = ref([]);
const newComment = ref('');

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
const fetchCommunityPost = async (idBaiDang) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/baidang/${idBaiDang}`);
        idPost.value = response.data.MaBaiDang;
        idCustomer.value = response.data.MaKhachHang;
        avatarCustomer.value = response.data.HinhAnhKhachHang;
        nameCustomer.value = response.data.TenKhachHang;
        timePost.value = new Date(response.data.ThoiGianDang);
        content.value = response.data.NoiDung;
        images.value = response.data.HinhAnh;
        idCustomerLikePost.value = response.data.MaKhachHangDaThich;
        comments.value = response.data.BinhLuan;
        console.log(comments.value)
    } catch (error) {
        console.log(error)
    }
}

const addComment = async () => {
    if (!newComment.value.trim()) return;
    const maKhachHangBinhLuan = localStorage.getItem("MaKhachHang");
    try {
        const response = await axios.post(`http://localhost:3000/api/baidang/binhluan/${idPost.value}`, {
            MaKhachHang: maKhachHangBinhLuan,
            NoiDungBinhLuan: newComment.value
        })
        await fetchCommunityPost(idPost.value);
        newComment.value = '';
    } catch (error) {
        console.log("Error comment: ", error);
        showNotification(error.response?.data?.message, "error");
    }
}

const idCustomerReplay = localStorage.getItem('MaKhachHang');
const showReplyForm = ref({});
const replyContent = ref('');

const toggleReplyForm = (commentId) => {
    showReplyForm.value = {
        ...showReplyForm.value,
        [commentId]: !showReplyForm.value[commentId]
    };
    replyContent.value = '';
};

const submitReply = async (commentId) => {
    if (!replyContent.value.trim()) return;
    try {
        await axios.post(`http://localhost:3000/api/baidang/traloibinhluan/${idPost.value}/${commentId}`, {
            MaKhachHang: idCustomerReplay,
            NoiDungBinhLuan: replyContent.value
        });
        replyContent.value = '';
        showReplyForm.value[commentId] = false;
        await fetchCommunityPost(idPost.value);
    } catch (error) {
        console.error('Lỗi khi gửi trả lời:', error);
    }
};

const deleteComment = async (commentId) => {
    const confirmUpdate = confirm("Bạn có chắc chắn xóa bình luận này không?");
    if (!confirmUpdate) return;
    try {
        await axios.delete(`http://localhost:3000/api/baidang/xoabinhluan/${idPost.value}/${commentId}`);
        await fetchCommunityPost(idPost.value);
    } catch (error) {
        console.error('Lỗi khi xóa bình luận:', error);
    }
}

// Thu thập tất cả trả lời cho một bình luận gốc, không phân cấp
const replies = computed(() => (commentId) => {
    const result = [];
    const collectReplies = (id) => {
        const directReplies = comments.value.filter(c => c.TraLoiCho === id);
        directReplies.forEach(reply => {
            result.push(reply);
            collectReplies(reply.MaBinhLuan); // Thu thập trả lời của trả lời
        });
    };
    collectReplies(commentId);
    // Sắp xếp theo thời gian để trả lời mới hiển thị cuối
    return result.sort((a, b) => new Date(a.ThoiGian) - new Date(b.ThoiGian));
});

const formatTime = (time) => {
    return new Date(time).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
};

onMounted(() => {
    const idBaiDang = router.currentRoute.value.params.maBaiDang;
    fetchCommunityPost(idBaiDang);
})
</script>

<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="relative mb-5 m-2 lg:mx-[200px] flex lg:flex-row flex-col flex-grow gap-2">
            <div class="flex flex-col gap-5 w-full lg:w-[50%]">
                <div class="bg-gray-700 rounded-lg border-2 flex flex-col gap-4">
                    <div class="pt-4 px-4 flex flex-col gap-3">
                        <div class="flex items-center justify-between">
                            <div class="flex gap-2">
                                <img :src="avatarCustomer ? `${avatarCustomer}` : '/src/assets/img/avatar.jpg'"
                                    class="w-12 h-12 lg:w-12 lg:h-12 rounded-full object-cover" alt="">
                                <div class="flex flex-col">
                                    <p class="text-white font-semibold text-[18px]">{{ nameCustomer }}</p>
                                    <p class="text-white text-[12px] font-medium">{{ formatTime(timePost) }}</p>
                                </div>
                            </div>
                        </div>
                        <p class="text-white font-medium font-sans">{{ content }}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-1">
                        <img v-for="(img, index) in images" :key="index" :src="img"
                            class="w-full max-h-[200px] object-cover" alt="">
                    </div>
                    <div class="px-4 flex flex-col gap-2 mb-3">
                        <div class="flex items-center justify-between">
                            <div class="flex gap-2 items-center">
                                <i class="fa-solid fa-heart text-[#DC143C] text-[18px]"></i>
                                <p class="text-white font-medium">{{ idCustomerLikePost.length }} lượt yêu thích</p>
                            </div>
                            <div class="flex gap-2 items-center">
                                <p class="text-white font-medium">{{ comments ? comments.length : 0 }}</p>
                                <i class="fa-solid fa-comment text-white text-[18px]"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="bg-gray-700 rounded-lg border-2 w-full lg:w-[50%] flex flex-col gap-4 p-4 overflow-hidden">
                <div class="flex flex-col gap-2 flex-grow max-h-[calc(100vh-25vh)] overflow-y-auto">
                    <div v-for="(comment, index) in comments" :key="index"
                        :class="comment.TraLoiCho === null ? 'flex' : 'hidden'" class="gap-2">
                        <img :src="comment.HinhAnhKhachHang ? `${comment.HinhAnhKhachHang}` : '/src/assets/img/avatar.jpg'"
                            class="w-8 h-8 rounded-full object-cover" alt="Avatar" />
                        <div class="flex flex-col gap-1 w-full">
                            <div class="bg-gray-600 rounded-lg p-2">
                                <p class="text-white text-[12px] font-semibold">{{ comment.TenKhachHang }}</p>
                                <p class="text-white text-[14px]">{{ comment.NoiDungBinhLuan }}</p>
                            </div>
                            <div class="flex justify-between items-center">
                                <p class="text-white text-[12px]">{{ formatTime(new Date(comment.ThoiGian)) }}</p>
                                <div class="flex gap-2">
                                    <button @click="deleteComment(comment.MaBinhLuan)"
                                        :class="comment.MaKhachHang.includes(idCustomerLocal) ? 'block' : 'hidden'"
                                        class="text-gray-300 text-[12px] text-end hover:text-white">
                                        Xóa
                                    </button>
                                    <button @click="toggleReplyForm(comment.MaBinhLuan)"
                                        class="text-gray-300 text-[12px] text-end hover:text-white">
                                        Trả lời
                                    </button>
                                </div>
                            </div>
                            <div v-if="showReplyForm[comment.MaBinhLuan]" class="mt-2 ml-4 flex flex-col gap-2">
                                <textarea v-model="replyContent"
                                    class="bg-gray-600 border-2 p-2 rounded-lg items-center w-full h-full text-[12px] font-semibold tracking-wider text-white focus:outline-none"
                                    placeholder="Viết trả lời..." rows="2"></textarea>
                                <div class="flex gap-2 justify-end">
                                    <button @click="submitReply(comment.MaBinhLuan)"
                                        class="bg-blue-500 text-white px-4 py-2 rounded font-semibold text-[12px] hover:bg-blue-600">Gửi</button>
                                    <button @click="toggleReplyForm(comment.MaBinhLuan)"
                                        class="bg-gray-500 text-white px-4 py-2 rounded font-semibold text-[12px] hover:bg-gray-600">Hủy</button>
                                </div>
                            </div>
                            <div v-for="reply in replies(comment.MaBinhLuan)" :key="reply.MaBinhLuan"
                                class="ml-4 flex gap-2 items-start relative">
                                <img :src="reply.HinhAnhKhachHang ? `${reply.HinhAnhKhachHang}` : '/src/assets/img/avatar.jpg'"
                                    class="w-8 h-8 rounded-full object-cover" alt="Avatar" />
                                <div class="flex flex-col gap-1 w-full">
                                    <div class="bg-gray-600 rounded-lg p-2">
                                        <p class="text-white text-[12px] font-semibold">{{ reply.TenKhachHang }}</p>
                                        <p class="text-white text-[14px]"><span class="font-semibold mr-1">{{
                                            reply.ReplyToTenKhachHang }}</span>{{ reply.NoiDungBinhLuan }}</p>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <p class="text-white text-[12px]">{{ formatTime(new Date(reply.ThoiGian)) }}
                                        </p>
                                        <div class="flex gap-2">
                                            <button @click="deleteComment(reply.MaBinhLuan)"
                                                :class="reply.MaKhachHang.includes(idCustomerLocal) ? 'block' : 'hidden'"
                                                class="text-gray-300 text-[12px] text-end hover:text-white">
                                                Xóa
                                            </button>
                                            <button @click="toggleReplyForm(reply.MaBinhLuan)"
                                                class="text-gray-300 text-[12px] text-end hover:text-white">
                                                Trả lời
                                            </button>
                                        </div>
                                    </div>
                                    <div v-if="showReplyForm[reply.MaBinhLuan]" class="mt-2 ml-4 flex flex-col gap-2">
                                        <textarea v-model="replyContent"
                                            class="bg-gray-600 border-2 p-2 rounded-lg items-center w-full h-full text-[12px] font-semibold tracking-wider text-white focus:outline-none"
                                            placeholder="Viết trả lời..." rows="2"></textarea>
                                        <div class="flex gap-2 justify-end">
                                            <button @click="submitReply(reply.MaBinhLuan)"
                                                class="bg-blue-500 text-white px-4 py-2 rounded font-semibold text-[12px] hover:bg-blue-600">Gửi</button>
                                            <button @click="toggleReplyForm(reply.MaBinhLuan)"
                                                class="bg-gray-500 text-white px-4 py-2 rounded font-semibold text-[12px] hover:bg-gray-600">Hủy</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="comments.length <= 0" class="flex justify-center items-center m-auto w-full rounded-md p-4">
                        <div class="flex flex-col items-center justify-center gap-3">
                            <p class="font-semibold text-white text-[20px] text-center">Hiện tại không có bình luận nào!
                            </p>
                            <img src="../../assets/img/empty_client.png" class="w-[140px]" alt="">
                        </div>
                    </div>
                </div>
                <hr class="bg-white">
                <div class="flex gap-3">
                    <input type="text" v-model="newComment"
                        class="bg-gray-600 border-2 p-4 rounded-lg items-center w-full h-full text-[12px] font-semibold tracking-wider text-white focus:outline-none"
                        placeholder="Viết bình luận ..." />
                    <button @click="addComment" class="bg-gray-600 px-4 py-3 rounded-lg border-2"><i
                            class="fa-solid fa-arrow-up text-white text-[16px] font-bold"></i></button>
                </div>
            </div>
        </div>
        <Footer />
        <BackToTop />
        <NotificationClient :message="notification.message" :type="notification.type" />
    </div>
</template>

<style scoped></style>