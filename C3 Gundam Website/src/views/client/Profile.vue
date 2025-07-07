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

const fetchCustomer = async (idKhachHang) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/khachhang/${idKhachHang}`);
        name.value = response.data.TenKhachHang;
        email.value = response.data.Email;
        maKhachHang.value = response.data.MaKhachHang;
        image.value = response.data.Image;
    } catch (err) {
        console.log("Error fetching:", err);
    }
}

onMounted(() => {
    const MaKhachHang = localStorage.getItem('MaKhachHang');
    fetchCustomer(MaKhachHang);
})
</script>

<template>
    <div class="bg-gradient-to-br from-[#0F1419] via-[#1A1D27] to-[#0F1419] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="relative mt-5 m-2 lg:mx-[200px] flex items-center flex-col flex-grow">
            <div class="w-full">
                <div
                    class="image_profile relative w-full h-[350px] bg-center bg-cover bg-no-repeat rounded-md [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                    <div
                        class="bg-[#242424] w-[90%] z-10 absolute top-32 left-[50%] translate-x-[-50%] mx-auto shadow-lg rounded-md pt-[50px] px-2 sm:px-10 pb-10 sm:pb-0 h-fit [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                        <img :src="image ? `${image}` : '/src/assets/img/avatar.jpg'"
                            class="w-[100px] h-[100px] bg-[#fff] rounded-full shadow-lg absolute left-1/2 translate-x-[-50%] -top-[50px] bg-center bg-cover object-cover"
                            alt="">
                        <div class="flex justify-between items-center flex-col mt-4 lg:flex-row gap-4 px-2 lg:px-24">
                            <div class="flex gap-6">
                                <router-link :to="`/orders_history`"
                                    class="px-3 py-3 sm:px-5 bg-[#A0522D] text-sm sm:text-md rounded-md font-medium sm:font-bold text-white shadow-md">Đơn
                                    hàng của bạn</router-link>
                                <router-link :to="`/personalDirectory/${maKhachHang}`"
                                    class="px-3 py-3 sm:px-5 bg-[#008B8B] text-sm sm:text-md rounded-md font-medium sm:font-bold text-white shadow-md">
                                    Danh mục cá nhân
                                </router-link>
                            </div>
                            <div class="flex gap-6">
                                <router-link :to="`/yourPostLists/${maKhachHang}`"
                                    class="px-3 py-3 sm:px-5 bg-[#4169E1] text-sm sm:text-md rounded-md font-medium sm:font-bold text-white shadow-md">Bài
                                    đăng của bạn</router-link>
                                <router-link :to="`/editProfile/${maKhachHang}`"
                                    class="px-3 py-3 sm:px-5 bg-[#DB3F4C] text-sm sm:text-md rounded-md font-medium sm:font-bold text-white shadow-md">Chỉnh
                                    sửa hồ sơ</router-link>
                            </div>
                        </div>
                        <div class="text-center mt-12 pb-4">
                            <h3 class="text-2xl font-semibold leading-normal mb-2 text-blueGray-700 text-white">{{ name
                            }}</h3>
                            <div class="text-base leading-normal mt-0 mb-4 font-bold text-white"><i
                                    class="fa-solid fa-envelope text-[#FFD700]"></i> {{ email }}
                            </div>
                            <hr>
                            <div class="my-5 lg:text-[16px] text-[14px] font-medium text-white">
                                <p>
                                    Chào mừng <span class="font-semibold text-[#FFD700]">{{ name }}</span> đã đến với
                                    C3 Gundam, chúng tôi mong rằng tại đây sẽ thõa mãn được những nhu cầu
                                    của bạn. Chúng tôi luôn sẳn sàng hỗ trợ bạn , nếu cần thì mong
                                    bạn liên hệ đến Hotline. Xin cám ơn!!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="h-[150px]"></div>
        <Footer />
        <BackToTop />
        <Chat />
        <ChatBot />
    </div>
</template>

<style scoped>
.image_profile {
    background-image: url('../../assets/img/Banner02.jpg');
}
</style>