<script setup>
import { ref, onMounted } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';
import Chat from '../../components/client/Chat.vue';
import ChatBot from '../../components/client/ChatBot.vue';
import axios from 'axios';

const name = ref('');
const email = ref('');
const maKhachHang = ref('');
const image = ref('');
const orderCount = ref(0);
const joinDate = ref('');
const listPost = ref([]);

const fetchCustomer = async (idKhachHang) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/khachhang/${idKhachHang}`);
        name.value = response.data.TenKhachHang;
        email.value = response.data.Email;
        maKhachHang.value = response.data.MaKhachHang;
        image.value = response.data.Image;
        orderCount.value = response.data.TongDonHang;
        console.log(response.data.NgayTao)
        joinDate.value = formatDate(response.data.NgayTao);
    } catch (err) {
        console.log("Error fetching:", err);
    }
}

const fetchCommunityPost = async (idKhachHang) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/baidang/danhsachbaidang/${idKhachHang}`);
        listPost.value = response.data.filter(post => {
            return post.TrangThaiDang === 'Đã duyệt'
        }).map(post => {
            return {
                ...post
            }
        });
    } catch (error) {
        console.log("Error fetching: ", message.error);
    }
}

const formatDate = (dateString) => {
    try {
        // Kiểm tra nếu dateString không tồn tại hoặc rỗng
        if (!dateString) return 'N/A';
        
        // Tạo Date object từ ISO string
        const date = new Date(dateString);
        
        // Kiểm tra xem Date object có hợp lệ không
        if (isNaN(date.getTime())) {
            console.log('Invalid date!');
            return 'N/A';
        }
        
        const options = { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            timeZone: 'Asia/Ho_Chi_Minh' 
        };
        
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        console.log('Formatted date (fallback):', formattedDate);
        
        return formattedDate;
    } catch (error) {
        console.log('Error formatting date:', error);
        return 'N/A';
    }
};

onMounted(() => {
    const MaKhachHang = localStorage.getItem('MaKhachHang');
    fetchCustomer(MaKhachHang);
    fetchCommunityPost(MaKhachHang);
})
</script>

<template>
    <div class="bg-gradient-to-br from-[#0F1419] via-[#1A1D27] to-[#0F1419] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="relative mt-6 mx-4 sm:mx-6 lg:mx-8 xl:mx-auto xl:max-w-7xl flex items-center flex-col flex-grow">
            <div class="w-full relative">
                <div class="profile-cover relative w-full h-48 sm:h-64 lg:h-80 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-3xl overflow-hidden shadow-2xl">
                    <div class="absolute inset-0 bg-black/30"></div>
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div class="absolute top-6 right-6 flex space-x-2">
                        <div class="w-3 h-3 bg-white/40 rounded-full animate-ping"></div>
                        <div class="w-3 h-3 bg-white/60 rounded-full animate-pulse"></div>
                        <div class="w-3 h-3 bg-white/80 rounded-full animate-bounce"></div>
                    </div>
                </div>
                <div class="relative -mt-16 sm:-mt-20 lg:-mt-36 mx-4 sm:mx-8">
                    <div class="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl">
                        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
                            <div class="relative group">
                                <div class="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 rounded-full blur opacity-75"></div>
                                <img :src="image ? `${image}` : '/src/assets/img/avatar.jpg'"
                                    class="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full object-cover border-4 border-white/20 shadow-2xl"
                                    alt="Profile Avatar">
                            </div>
                            <div class="flex-1 text-center sm:text-left">
                                <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
                                    {{ name }}
                                </h1>
                                <div class="flex items-center justify-center sm:justify-start gap-2 text-gray-300 mb-4">
                                    <i class="fa-solid fa-envelope text-yellow-400"></i>
                                    <span class="text-sm sm:text-base break-all">{{ email }}</span>
                                </div>
                                <div class="flex justify-center sm:justify-start gap-6 text-center">
                                    <div class="group">
                                        <div class="text-xl sm:text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{{ orderCount }}</div>
                                        <div class="text-xs text-gray-400">Đơn hàng</div>
                                    </div>
                                    <div class="group">
                                        <div class="text-xl sm:text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">{{ listPost.length }}</div>
                                        <div class="text-xs text-gray-400">Bài đăng</div>
                                    </div>
                                    <div class="group">
                                        <div class="text-xl sm:text-2xl font-bold text-white group-hover:text-teal-400 transition-colors">{{ joinDate }}</div>
                                        <div class="text-xs text-gray-400">Ngày tham gia</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mt-8 sm:mt-10">
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <router-link :to="`/orders_history`"
                                    class="group relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-4 rounded-2xl font-semibold text-center transition-all duration-300 transform hover:scale-105">
                                    <div class="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                                    <div class="relative flex items-center justify-center gap-2">
                                        <i class="fa-solid fa-bag-shopping text-lg"></i>
                                        <span class="text-sm sm:text-base">Đơn hàng</span>
                                    </div>
                                </router-link>
                                <router-link :to="`/personalDirectory/${maKhachHang}`"
                                    class="group relative overflow-hidden bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-6 py-4 rounded-2xl font-semibold text-center transition-all duration-300 transform hover:scale-105">
                                    <div class="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                                    <div class="relative flex items-center justify-center gap-2">
                                        <i class="fa-solid fa-folder text-lg"></i>
                                        <span class="text-sm sm:text-base">Danh mục</span>
                                    </div>
                                </router-link>
                                <router-link :to="`/yourPostLists/${maKhachHang}`"
                                    class="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-4 rounded-2xl font-semibold text-center transition-all duration-300 transform hover:scale-105">
                                    <div class="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                                    <div class="relative flex items-center justify-center gap-2">
                                        <i class="fa-solid fa-edit text-lg"></i>
                                        <span class="text-sm sm:text-base">Bài đăng</span>
                                    </div>
                                </router-link>
                                <router-link :to="`/editProfile/${maKhachHang}`"
                                    class="group relative overflow-hidden bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-4 rounded-2xl font-semibold text-center transition-all duration-300 transform hover:scale-105">
                                    <div class="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                                    <div class="relative flex items-center justify-center gap-2">
                                        <i class="fa-solid fa-user-edit text-lg"></i>
                                        <span class="text-sm sm:text-base">Chỉnh sửa</span>
                                    </div>
                                </router-link>
                            </div>
                        </div>
                        <div class="mt-8 sm:mt-10 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <div class="flex items-start gap-4">
                                <div class="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center flex-shrink-0">
                                    <i class="fa-solid fa-star text-white text-lg"></i>
                                </div>
                                <div class="flex-1">
                                    <h3 class="text-lg font-semibold text-white mb-2">Chào mừng bạn đến với C3 Gundam!</h3>
                                    <p class="text-gray-300 text-sm sm:text-base leading-relaxed">
                                        Chào mừng <span class="font-semibold text-yellow-400">{{ name }}</span> đã đến với
                                        C3 Gundam, chúng tôi mong rằng tại đây sẽ thõa mãn được những nhu cầu
                                        của bạn. Chúng tôi luôn sẳn sàng hỗ trợ bạn, nếu cần thì mong
                                        bạn liên hệ đến Hotline. Xin cám ơn!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="h-20 sm:h-24 lg:h-32"></div>
        <Footer />
        <BackToTop />
        <Chat />
        <ChatBot />
    </div>
</template>

<style scoped>
.profile-cover {
    background-image: url('../../assets/img/Banner02.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}

@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
}

@keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
    50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6); }
}

.backdrop-blur-2xl {
    backdrop-filter: blur(40px);
}

.bg-clip-text {
    -webkit-background-clip: text;
    background-clip: text;
}

html {
    scroll-behavior: smooth;
}

::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
}

::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
}

@media (max-width: 640px) {
    .profile-cover {
        border-radius: 1.5rem;
    }
}
</style>