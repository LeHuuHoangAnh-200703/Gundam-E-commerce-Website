<script setup>
import { ref } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';  
</script>


<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth flex flex-col">
        <Header />
        <div class="relative mt-5 m-2 mb-10 lg:mx-[200px] flex items-center flex-col flex-grow">
            <div class="w-full mb-[250px]">
                <div
                    class="image_profile relative w-full h-[350px] bg-center bg-cover bg-no-repeat rounded-md [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                    <div
                        class="bg-[#242424] w-[90%] z-10 absolute top-32 left-[50%] translate-x-[-50%] mx-auto shadow-lg rounded-md pt-[50px] px-2 sm:px-10 pb-10 sm:pb-0 h-fit [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                        <img src="../../assets/img/avatar.jpg"
                            class="w-[100px] h-[100px] bg-[#fff] rounded-full shadow-lg absolute left-1/2 translate-x-[-50%] -top-[50px] bg-center bg-cover"
                            alt="">
                        <div class="flex justify-between items-center flex-col lg:flex-row gap-4 px-2 lg:px-24">
                            <p class="font-semibold text-[18px] text-white my-2">Mã tài khoản: <span
                                    class="text-[#FFD700]">TK23345</span></p>
                            <a href=""
                                class="px-3 py-2 sm:px-5 sm:py-2 bg-[#DB3F4C] text-sm sm:text-md rounded-md font-medium sm:font-bold text-white shadow-md">Chỉnh
                                sửa hồ sơ</a>
                        </div>
                        <div class="text-center mt-12 pb-4">
                            <h3 class="text-2xl font-semibold leading-normal mb-2 text-blueGray-700 text-white">Lê Hữu
                                Hoàng Anh</h3>
                            <div class="text-base leading-normal mt-0 mb-2 font-bold text-white"><i
                                    class="fa-regular fa-envelope text-[#FFD700]"></i> lehuuhoanganhhg2003@gmail.com
                            </div>
                            <div class="mb-2 text-blueGray-600 mt-10 font-medium text-white">
                                <i class="fa-solid fa-location-dot text-[#FFD700]"></i>
                                Long Mỹ - Hậu Giang
                            </div>
                            <div class="text-base leading-normal mt-0 mb-2 text-white"><i
                                    class="fa-solid fa-phone-volume text-[#FFD700]"></i> 079-975-8592
                            </div>
                            <hr />
                            <div class="my-5 lg:text-[18px] text-[15px] font-medium text-white">
                                <p>
                                    Chào mừng <span class="font-semibold text-[#FFD700]">Hoàng Anh</span> đã đến với
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
    </div>
</template>

<style scoped>
.image_profile {
    background-image: url('../../assets/img/banner02.jpg');
}
</style>