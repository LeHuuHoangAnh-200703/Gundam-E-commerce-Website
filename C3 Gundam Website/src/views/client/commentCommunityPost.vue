<script setup>
import { onMounted, ref, computed } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import axios from "axios";
import NotificationClient from "@/components/Notification/NotificationClient.vue";
import ConfirmDialog from "@/components/Notification/ConfirmDialog.vue";
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
const comments = ref([]);
const newComment = ref('');

// Ẩn hiện hình ảnh
const showImageModal = ref(false);
const selectedImage = ref('');

// Thêm state cho việc mở rộng nội dung
const isContentExpanded = ref(false);

// Computed để kiểm tra nội dung có dài quá không
const isContentLong = computed(() => {
    return content.value && content.value.length > 130; // Hoặc bạn có thể dùng số ký tự khác
});

// Computed để hiển thị nội dung
const displayContent = computed(() => {
    if (!content.value) return '';
    if (!isContentLong.value || isContentExpanded.value) {
        return content.value;
    }
    // Cắt nội dung theo số ký tự (có thể điều chỉnh)
    return content.value.substring(0, 130) + '...';
});

const toggleContent = () => {
    isContentExpanded.value = !isContentExpanded.value;
};

const openImageModal = (imageSrc) => {
    selectedImage.value = imageSrc;
    showImageModal.value = true;
    document.body.style.overflow = 'hidden';
};

const closeImageModal = () => {
    showImageModal.value = false;
    selectedImage.value = '';
    document.body.style.overflow = 'auto';
};

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
        comments.value = response.data.BinhLuan;
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
const replyContent = ref({});

const toggleReplyForm = (commentId) => {
    showReplyForm.value = {
        ...showReplyForm.value,
        [commentId]: !showReplyForm.value[commentId]
    };
    // Reset content cho comment cụ thể
    if (!showReplyForm.value[commentId]) {
        replyContent.value[commentId] = '';
    }
};

const submitReply = async (commentId) => {
    const content = replyContent.value[commentId];
    if (!content || !content.trim()) {
        showNotification("Vui lòng nhập nội dung trả lời!", "error");
        return;
    }
    
    try {
        const response = await axios.post(`http://localhost:3000/api/baidang/traloibinhluan/${idPost.value}/${commentId}`, {
            MaKhachHang: idCustomerReplay,
            NoiDungBinhLuan: content
        });
        
        // Reset form sau khi thành công
        replyContent.value[commentId] = '';
        showReplyForm.value[commentId] = false;
        
        await fetchCommunityPost(idPost.value);
    } catch (error) {
        console.error('Lỗi khi gửi trả lời:', error);
        console.error('Error response:', error.response?.data);
        showNotification(error.response?.data?.message || "Có lỗi xảy ra khi gửi trả lời!", "error");
    }
};

const deleteComment = async (commentId) => {
    showConfirmDialog({
        title: 'Thông báo xác nhận',
        message: 'Bạn có chắc chắn xóa bình luận này không?',
        type: 'error',
        confirmText: 'Xóa',
        cancelText: 'Hủy bỏ',
        onConfirm: async () => {
            try {
                await axios.delete(`http://localhost:3000/api/baidang/xoabinhluan/${idPost.value}/${commentId}`);
                await fetchCommunityPost(idPost.value);
            } catch (error) {
                console.error('Lỗi khi xóa bình luận:', error);
            }
        }
    });
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
                            <button @click="deletePost(idPost)">
                                <i class="fa-solid fa-trash text-white text-[18px]"></i>
                            </button>
                        </div>
                        <div class="text-white font-medium font-sans">
                            <p :class="[
                                'transition-all duration-300',
                                !isContentExpanded && isContentLong ? 'line-clamp-3' : ''
                            ]">{{ displayContent }}</p>
                            <button 
                                v-if="isContentLong"
                                @click="toggleContent"
                                class="text-blue-400 hover:text-blue-300 text-sm mt-1 transition-colors duration-200"
                            >
                                {{ isContentExpanded ? 'Thu gọn' : 'Xem thêm' }}
                            </button>
                        </div>
                    </div>
                    <div :class="[
                        'grid gap-1',
                        images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                    ]">
                        <img v-for="(img, index) in images" :key="index" :src="img" @click="openImageModal(img)" :class="[
                            'w-full object-cover cursor-pointer hover:opacity-80 transition-opacity',
                            images.length === 1 ? 'max-h-[400px]' : 'max-h-[200px]',
                            images.length === 3 && index === 0 ? 'col-span-2' : ''
                        ]" alt="">
                    </div>
                    <div class="px-4 flex flex-col gap-2 mb-3">
                        <div class="flex items-center justify-between">
                            <div></div>
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
                                <textarea v-model="replyContent[comment.MaBinhLuan]"
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
                                        <textarea v-model="replyContent[reply.MaBinhLuan]"
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
                    <div v-if="comments.length <= 0"
                        class="flex justify-center items-center m-auto w-full rounded-md p-4">
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
        <div v-if="showImageModal" @click="closeImageModal"
            class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-2 sm:p-4 md:p-6 lg:p-8">
            <div
                class="relative w-full h-full max-w-[95vw] max-h-[95vh] sm:max-w-[90vw] sm:max-h-[90vh] md:max-w-[85vw] md:max-h-[85vh] lg:max-w-[80vw] lg:max-h-[80vh] xl:max-w-[70vw] xl:max-h-[70vh] flex items-center justify-center">
                <div class="relative inline-block">
                    <img :src="selectedImage" @click.stop
                        class="lg:max-w-[70vw] lg:max-h-[70vh] max-w-full max-h-full w-auto h-auto object-contain border-4 sm:border-6 md:border-8 border-white"
                        alt="Enlarged image">
                    <button @click="closeImageModal"
                        class="absolute -top-4 -right-2 text-white hover:text-gray-300 transition-colors z-10 bg-[#DC143C] hover:bg-red-600 rounded-full w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center shadow-lg">
                        <i class="fa-solid fa-xmark text-xs sm:text-sm md:text-base lg:text-lg"></i>
                    </button>
                </div>
            </div>
        </div>
        <Footer />
        <BackToTop />
        <NotificationClient :message="notification.message" :type="notification.type" />
        <ConfirmDialog :visible="dialogState.visible" :title="dialogState.title" :message="dialogState.message"
            :type="dialogState.type" :confirmText="dialogState.confirmText" :cancelText="dialogState.cancelText"
            @confirm="handleDialogConfirm" @cancel="handleDialogCancel" @close="handleDialogClose" />
    </div>
</template>

<style scoped></style>