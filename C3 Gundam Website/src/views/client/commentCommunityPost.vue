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
const listReport = [
    {
        title: "Thông tin sản phẩm sai lệch.",
        value: "Thông tin sản phẩm sai lệch."
    },
    {
        title: "Spam/đăng quá nhiều lần bài đăng trùng lặp.",
        value: "Spam/đăng quá nhiều lần bài đăng trùng lặp."
    },
    {
        title: "Nội dung vi phạm quy định cộng đồng.",
        value: "Nội dung vi phạm quy định cộng đồng."
    },
    {
        title: "Ngôn từ thô tục/không lịch sự.",
        value: "Ngôn từ thô tục/không lịch sự."
    },
    {
        title: "Thông tin gây hiểu lầm.",
        value: "Thông tin gây hiểu lầm."
    },
]
const reportingReason = ref('');
const idCustomer = ref('');
const idCustomerLocal = localStorage.getItem('MaKhachHang');
const idPost = ref('');
const avatarCustomer = ref('');
const nameCustomer = ref('');
const emailCustomer = ref('');
const timePost = ref('');
const content = ref('');
const images = ref([]);
const comments = ref([]);
const newComment = ref('');
const showComments = ref(false);
const showReport = ref(false);

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

const toggleCommentSection = () => {
    showComments.value = !showComments.value;
}

const toggleReport = () => {
    showReport.value = !showReport.value;
}

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
        emailCustomer.value = response.data.EmailKhachHang;
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

const reportPost = async (maBaiDang) => {
    if (reportingReason.value === '') {
        return showNotification("Vui lòng chọn lý do báo cáo.", "error");
    }
    showConfirmDialog({
        title: 'Thông báo xác nhận',
        message: 'Bạn có chắc chắn báo cáo bài đăng này không?',
        type: 'info',
        confirmText: 'Báo cáo',
        cancelText: 'Hủy bỏ',
        onConfirm: async () => {
            try {
                const response = await axios.put(`http://localhost:3000/api/baidang/baocao/${maBaiDang}`, {
                    MaKhachHang: idCustomerLocal,
                    LyDoBaoCao: reportingReason.value
                });
                showNotification("Báo cáo bài đăng thành công!", "success");
                reportingReason.value = '';
                showReport.value = false;
            } catch (error) {
                showNotification(error.response.data.message, "error");
            }
        }
    });
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
    const idBaiDang = router.currentRoute.value.params.maBaiDang;
    fetchCommunityPost(idBaiDang);
})
</script>

<template>
    <div
        class="bg-gradient-to-br from-[#0F1419] via-[#1A1D27] to-[#0F1419] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="flex-1 flex flex-col mx-4 lg:mx-[200px] mt-6 mb-8">
            <div class="h-full">
                <div class="w-full lg:w-full flex flex-col">
                    <div
                        class="bg-gradient-to-br from-gray-800/90 to-gray-700/90 backdrop-blur-sm rounded-2xl border border-gray-600/30 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden group">
                        <div class="p-6 pb-4">
                            <div class="flex items-center justify-between mb-4">
                                <div class="flex items-center gap-4">
                                    <div class="relative">
                                        <img :src="avatarCustomer ? `${avatarCustomer}` : '/src/assets/img/avatar.jpg'"
                                            class="w-14 h-14 rounded-full object-cover ring-4 ring-blue-500/20 shadow-lg"
                                            alt="Avatar">
                                        <div
                                            class="absolute -bottom-0 -right-[2px] w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800">
                                        </div>
                                    </div>
                                    <div class="flex flex-col gap-2 lg:gap-0">
                                        <div class="flex gap-2 items-start lg:items-center flex-col lg:flex-row">
                                            <h3 class="text-white font-bold text-lg tracking-wide">{{ nameCustomer }}
                                            </h3>
                                            <p :class="emailCustomer === 'c3gundamstore@gmail.com' ? 'inline-flex' : 'hidden'"
                                                class="items-center gap-2 text-blue-400 hover:text-blue-300 text-sm px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                                                Quản trị viên</p>
                                        </div>
                                        <p class="text-gray-300 text-sm font-medium flex items-center gap-2">
                                            <i class="fa-regular fa-clock text-blue-400"></i>
                                            {{ formatTime(timePost) }}
                                        </p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <button @click="deletePost(idPost)"
                                        :class="idCustomer === idCustomerLocal ? 'block' : 'hidden'"
                                        class="w-12 h-12 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all duration-200">
                                        <i class="fa-solid fa-trash text-lg"></i>
                                    </button>
                                    <button @click="toggleReport"
                                        :class="idCustomer !== idCustomerLocal ? 'block' : 'hidden'"
                                        class="w-12 h-12 rounded-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 hover:text-yellow-300 transition-all duration-200">
                                        <i class="fa-solid fa-exclamation"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="text-gray-100 leading-relaxed">
                                <p class="text-base transition-all duration-300 ease-in-out">
                                    {{ displayContent }}
                                </p>
                                <button v-if="isContentLong" @click="toggleContent"
                                    class="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mt-3 px-3 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 transition-all duration-200 border border-blue-500/20">
                                    <span>{{ isContentExpanded ? 'Thu gọn' : 'Xem thêm' }}</span>
                                    <i :class="isContentExpanded ? 'fa-chevron-up' : 'fa-chevron-down'"
                                        class="fa-solid text-xs"></i>
                                </button>
                            </div>
                        </div>
                        <div v-if="images.length > 0" class="px-6 pb-4">
                            <div :class="[
                                'grid gap-2 rounded-xl overflow-hidden',
                                images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                            ]">
                                <div v-for="(img, index) in images" :key="index" :class="[
                                    'relative overflow-hidden rounded-lg group/img cursor-pointer',
                                    images.length === 3 && index === 0 ? 'col-span-2' : ''
                                ]" @click="openImageModal(img)">
                                    <img :src="img" :class="[
                                        'w-full object-cover transition-all duration-300 group-hover/img:scale-105',
                                        images.length === 1 ? 'max-h-[440px]' : 'max-h-[240px]'
                                    ]" alt="Post image">
                                    <div
                                        class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300">
                                    </div>
                                    <div
                                        class="absolute top-3 right-3 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300">
                                        <div class="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                                            <i class="fa-solid fa-expand text-gray-800 text-sm"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="px-6 pb-6">
                            <div class="flex items-center justify-between pt-4 border-t border-gray-600/30">
                                <div></div>
                                <button @click="toggleCommentSection"
                                    class="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-blue-500/10">
                                    <span class="text-sm font-medium">{{ comments ? comments.length : 0 }}</span>
                                    <i class="fa-solid fa-comment text-blue-400"></i>
                                    <span class="text-sm">bình luận</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="showComments" @click="toggleCommentSection"
            class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div @click.stop
                class="bg-gradient-to-br from-gray-800/95 to-gray-700/95 backdrop-blur-sm rounded-2xl border border-gray-600/30 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-fadeInUp">
                <div class="p-6 pb-4 border-b border-gray-600/30 flex-shrink-0">
                    <div class="flex items-center justify-between">
                        <h2 class="text-white font-bold text-xl flex items-center gap-3">
                            <i class="fa-solid fa-comments text-blue-400"></i>
                            Bình luận
                            <span
                                class="flex items-center justify-center text-sm font-normal text-gray-400 bg-gray-600/50 w-8 h-8 rounded-full">
                                {{ comments ? comments.length : 0 }}
                            </span>
                        </h2>
                        <button @click="toggleCommentSection"
                            class="w-10 h-10 rounded-full bg-gray-600/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all duration-200 flex items-center justify-center">
                            <i class="fa-solid fa-times text-lg"></i>
                        </button>
                    </div>
                </div>
                <div
                    class="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    <div v-for="(comment, index) in comments" :key="index"
                        :class="comment.TraLoiCho === null ? 'block' : 'hidden'">
                        <div class="flex gap-3 group/comment">
                            <div class="flex-shrink-0">
                                <img :src="comment.HinhAnhKhachHang ? `${comment.HinhAnhKhachHang}` : '/src/assets/img/avatar.jpg'"
                                    class="w-10 h-10 rounded-full object-cover ring-2 ring-gray-600/50" alt="Avatar" />
                            </div>
                            <div class="flex-1 space-y-2">
                                <div class="bg-gradient-to-r from-gray-700/80 to-gray-600/80 rounded-2xl p-4 shadow-md">
                                    <h4 class="text-white text-sm font-bold mb-1">{{ comment.TenKhachHang }}</h4>
                                    <p class="text-gray-200 text-sm leading-relaxed">{{ comment.NoiDungBinhLuan }}
                                    </p>
                                </div>
                                <div class="flex items-center justify-between px-2">
                                    <span class="text-gray-400 text-xs">{{ formatTime(new Date(comment.ThoiGian))
                                    }}</span>
                                    <div
                                        class="flex items-center gap-3 opacity-0 group-hover/comment:opacity-100 transition-opacity duration-200">
                                        <button @click="deleteComment(comment.MaBinhLuan)"
                                            :class="comment.MaKhachHang.includes(idCustomerLocal) ? 'block' : 'hidden'"
                                            class="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded-full bg-red-500/10 hover:bg-red-500/20 transition-all duration-200">
                                            <i class="fa-solid fa-trash mr-1"></i>Xóa
                                        </button>
                                        <button @click="toggleReplyForm(comment.MaBinhLuan)"
                                            class="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 transition-all duration-200">
                                            <i class="fa-solid fa-reply mr-1"></i>Trả lời
                                        </button>
                                    </div>
                                </div>
                                <div v-if="showReplyForm[comment.MaBinhLuan]"
                                    class="ml-4 mt-3 p-4 bg-gray-800/50 rounded-xl border border-gray-600/30 space-y-3">
                                    <textarea v-model="replyContent[comment.MaBinhLuan]"
                                        class="w-full bg-gray-700/80 border border-gray-600/50 rounded-lg p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all duration-200"
                                        placeholder="Viết trả lời của bạn..." rows="2"></textarea>
                                    <div class="flex gap-2 justify-end">
                                        <button @click="submitReply(comment.MaBinhLuan)"
                                            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors duration-200 flex items-center gap-2">
                                            <i class="fa-solid fa-paper-plane"></i>Gửi
                                        </button>
                                        <button @click="toggleReplyForm(comment.MaBinhLuan)"
                                            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium rounded-lg transition-colors duration-200">
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                                <div v-for="reply in replies(comment.MaBinhLuan)" :key="reply.MaBinhLuan"
                                    class="ml-6 flex gap-3 group/reply">
                                    <div class="flex-shrink-0">
                                        <img :src="reply.HinhAnhKhachHang ? `${reply.HinhAnhKhachHang}` : '/src/assets/img/avatar.jpg'"
                                            class="w-8 h-8 rounded-full object-cover ring-2 ring-gray-600/50"
                                            alt="Avatar" />
                                    </div>
                                    <div class="flex-1 space-y-2">
                                        <div
                                            class="bg-gradient-to-r from-gray-600/60 to-gray-500/60 rounded-xl p-3 shadow-sm">
                                            <h5 class="text-white text-xs font-bold mb-1">{{ reply.TenKhachHang }}
                                            </h5>
                                            <p class="text-gray-200 text-xs leading-relaxed">
                                                <span v-if="reply.ReplyToTenKhachHang"
                                                    class="text-blue-400 font-medium">@{{ reply.ReplyToTenKhachHang
                                                    }}</span>
                                                {{ reply.NoiDungBinhLuan }}
                                            </p>
                                        </div>
                                        <div class="flex items-center justify-between px-2">
                                            <span class="text-gray-400 text-xs">{{ formatTime(new
                                                Date(reply.ThoiGian)) }}</span>
                                            <div
                                                class="flex items-center gap-2 opacity-0 group-hover/reply:opacity-100 transition-opacity duration-200">
                                                <button @click="deleteComment(reply.MaBinhLuan)"
                                                    :class="reply.MaKhachHang.includes(idCustomerLocal) ? 'block' : 'hidden'"
                                                    class="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded-full bg-red-500/10 hover:bg-red-500/20 transition-all duration-200">
                                                    <i class="fa-solid fa-trash"></i>
                                                </button>
                                                <button @click="toggleReplyForm(reply.MaBinhLuan)"
                                                    class="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 transition-all duration-200">
                                                    <i class="fa-solid fa-reply"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div v-if="showReplyForm[reply.MaBinhLuan]"
                                            class="ml-4 mt-3 p-3 bg-gray-800/50 rounded-xl border border-gray-600/30 space-y-3">
                                            <textarea v-model="replyContent[reply.MaBinhLuan]"
                                                class="w-full bg-gray-700/80 border border-gray-600/50 rounded-lg p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all duration-200"
                                                placeholder="Viết trả lời..." rows="2"></textarea>
                                            <div class="flex gap-2 justify-end">
                                                <button @click="submitReply(reply.MaBinhLuan)"
                                                    class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors duration-200">
                                                    Gửi
                                                </button>
                                                <button @click="toggleReplyForm(reply.MaBinhLuan)"
                                                    class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium rounded-lg transition-colors duration-200">
                                                    Hủy
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="comments.length <= 0" class="flex flex-col items-center justify-center py-12 space-y-4">
                        <div class="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center">
                            <i class="fa-regular fa-comments text-gray-400 text-2xl"></i>
                        </div>
                        <div class="text-center">
                            <h3 class="text-white font-semibold text-lg mb-2">Chưa có bình luận nào</h3>
                            <p class="text-gray-400 text-sm">Hãy là người đầu tiên bình luận về bài đăng này!</p>
                        </div>
                    </div>
                </div>
                <div class="p-6 border-t border-gray-600/30 bg-gray-800/50 flex-shrink-0">
                    <div class="flex gap-3 items-end">
                        <div class="flex-1 relative">
                            <textarea v-model="newComment"
                                class="w-full bg-gray-700/80 border border-gray-600/50 rounded-xl p-4 pr-12 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all duration-200"
                                placeholder="Viết bình luận của bạn..." rows="2"
                                @keydown.enter.prevent="addComment"></textarea>
                            <button @click="addComment"
                                class="absolute right-3 bottom-4 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors duration-200">
                                <i class="fa-solid fa-paper-plane text-sm"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="showReport" @click="toggleReport"
            class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div @click.stop
                class="bg-gradient-to-br from-gray-800/95 to-gray-700/95 backdrop-blur-sm rounded-2xl border border-gray-600/30 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-fadeInUp">
                <div class="p-6 pb-4 border-b border-gray-600/30 flex-shrink-0">
                    <div class="flex items-center justify-between">
                        <h2 class="text-white font-bold text-xl flex items-center gap-3">
                            <div
                                class="w-10 h-10 flex items-center justify-center rounded-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 hover:text-yellow-300 transition-all duration-200">
                                <i class="fa-solid fa-exclamation text-yellow-500"></i>
                            </div>
                            Báo cáo bài đăng
                        </h2>
                        <button @click="toggleReport"
                            class="w-10 h-10 rounded-full bg-gray-600/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all duration-200 flex items-center justify-center">
                            <i class="fa-solid fa-times text-lg"></i>
                        </button>
                    </div>
                    <hr class="my-4">
                    <div class="flex flex-col items-start gap-2">
                        <p class="text-white text-[20px] font-semibold">Lý do báo cáo: </p>
                        <div class="flex gap-2 items-center" v-for="(report, index) in listReport" :key="index">
                            <input type="radio" class="cursor-pointer" :id="report.value" :value="report.value"
                                v-model="reportingReason">
                            <label :for="report.value" class="text-white font-medium text-[18px] cursor-pointer">{{
                                report.title }}</label>
                        </div>
                    </div>
                    <div class="flex justify-between items-center">
                        <div></div>
                        <button @click="reportPost(idPost)"
                            class="px-4 py-3 rounded-md text-white bg-blue-600/50 shadow-sm hover:bg-blue-600/30 transition-all duration-200">Gửi
                            báo cáo</button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="showImageModal" @click="closeImageModal"
            class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div class="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
                <div class="relative group">
                    <img :src="selectedImage" @click.stop
                        class="lg:max-w-[80vw] lg:max-h-[80vh] max-w-full max-h-full w-auto h-auto object-contain border-4 sm:border-6 md:border-8 border-white"
                        alt="Enlarged image">
                    <button @click="closeImageModal"
                        class="absolute -top-4 -right-4 w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110">
                        <i class="fa-solid fa-times text-lg"></i>
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

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
    width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
    background: #374151;
    border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
    background: #6B7280;
    border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #9CA3AF;
}

.shadow-3xl {
    box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.5);
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(100%);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.animate-fadeInUp {
    animation: fadeInUp 0.5s ease-out;
}

.animate-slideInRight {
    animation: slideInRight 0.4s ease-out;
}

.gradient-text {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hover-lift:hover {
    transform: translateY(-2px);
}

.glass-effect {
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>