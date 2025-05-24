<script setup>
import { onMounted, ref, computed } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import axios from "axios";
import { useRouter } from 'vue-router';

const router = useRouter();

const idCustomer = ref('');
const idPost = ref('');
const avatarCustomer = ref('');
const nameCustomer = ref('');
const timePost = ref('');
const content = ref ('');
const images = ref([]);
const likes = ref('');
const comments = ref([]);
const newComment = ref('');

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
        likes.value = response.data.LuotThich;
        comments.value = response.data.BinhLuan;
    } catch (error) {
        console.log(error)
    }
}

const addComment = async () => {
    if (!newComment.value.trim()) return;
    const maKhachHangBinhLuan = localStorage.getItem("MaKhachHang");
    try {
        const response = await axios.post(`http://localhost:3000/api/baidang/binhluan/${idPost.value}`,{
            MaKhachHang: maKhachHangBinhLuan,
            NoiDungBinhLuan: newComment.value
        })
        await fetchCommunityPost(idPost.value);
        newComment.value = '';
    } catch (error) {
        console.log("Error comment: ", error);
    }
}

// const props = defineProps({
//     comment: { type: Object, required: true },
//     post: { type: Object, required: true }
// });

// const emit = defineEmits(['update']);

// const currentUserId = localStorage.getItem('MaKhachHang') || 'current_user_id';
// const showReplyForm = ref(false);
// const replyContent = ref('');

// // const replies = computed(() => {
// //     return props.post.BinhLuan.filter(c => c.TraLoiCho === props.comment.MaBinhLuan);
// // });

// const toggleReplyForm = () => {
//     showReplyForm.value = !showReplyForm.value;
//     replyContent.value = '';
// };

// const submitReply = async () => {
//     if (!replyContent.value.trim()) return;
//     try {
//         await axios.post(`http://localhost:3000/api/community/posts/${props.post.MaBaiDang}/comment/${props.comment.MaBinhLuan}/reply`, {
//             MaKhachHang: currentUserId,
//             NoiDungBinhLuan: replyContent.value
//         }, {
//             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         });
//         replyContent.value = '';
//         showReplyForm.value = false;
//         emit('update');
//     } catch (error) {
//         console.error('Lỗi khi gửi trả lời:', error);
//     }
// };

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
                        <img v-for="(img, index) in images" :key="index" :src="img" class="w-full h-full" alt="">
                    </div>
                    <div class="px-4 flex flex-col gap-2 mb-3">
                        <div class="flex items-center justify-between">
                            <div class="flex gap-2 items-center">
                                <i class="fa-solid fa-heart text-[#DC143C] text-[18px]"></i>
                                <p class="text-white font-medium">{{ likes }} lượt yêu thích</p>
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
                <div class="flex flex-col gap-2 flex-grow overflow-y-auto">
                    <div v-for="(comment, index) in comments" :key="index" class="flex gap-2 items-start">
                        <img :src="comment.HinhAnhKhachHang ? `${comment.HinhAnhKhachHang}` : '/src/assets/img/avatar.jpg'"
                            class="w-8 h-8 rounded-full object-cover" alt="Avatar" />
                        <div class="flex flex-col gap-1 w-full">
                            <div class="bg-gray-600 rounded-lg p-2">
                                <p class="text-white text-[12px] font-semibold">{{ comment.TenKhachHang }}</p>
                                <p class="text-white text-[14px]">{{ comment.NoiDungBinhLuan }}</p>
                            </div>
                            <div class="flex justify-between items-center">
                                <p class="text-white text-[12px]">{{ formatTime(new Date(comment.ThoiGian)) }}</p>
                                <button @click="toggleReplyForm"
                                    class="text-gray-300 text-[12px] text-end hover:text-white">
                                    Trả lời
                                </button>
                            </div>
                            <div v-if="showReplyForm" class="mt-2 flex flex-col gap-2">
                                <textarea v-model="replyContent"
                                    class="bg-gray-600 border-2 p-2 rounded-lg items-center w-full h-full text-[12px] font-semibold tracking-wider text-white focus:outline-none"
                                    placeholder="Viết trả lời..." rows="2"></textarea>
                                <div class="flex gap-2 justify-end">
                                    <button @click="submitReply"
                                        class="bg-blue-500 text-white px-4 py-2 rounded font-semibold text-[12px] hover:bg-blue-600">Gửi</button>
                                    <button @click="toggleReplyForm"
                                        class="bg-gray-500 text-white px-4 py-2 rounded font-semibold text-[12px] hover:bg-gray-600">Hủy</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- <Comment v-for="reply in replies" :key="reply.MaBinhLuan" :comment="reply" :post="post"
                        @update="emit('update')" /> -->
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
    </div>
</template>

<style scoped></style>