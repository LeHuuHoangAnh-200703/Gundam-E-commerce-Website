<script setup>
import { ref } from 'vue';
import Header from '@/components/client/Header.vue';
import Footer from '@/components/client/Footer.vue';
import BackToTop from '@/components/client/BackToTop.vue';  
</script>


<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans scroll-smooth">
        <Header />
        <div class="relative my-5 m-2 lg:mx-[200px] flex justify-center items-center">
            <div class="w-full m-4">
                <div
                    class="bg-[#242424] overflow-hidden px-6 py-3 rounded [box-shadow:0px_0px_6px_rgba(255,255,255,0.8)]">
                    <div class="grid gap-8 lg:gap-5 text-sm text-white grid-cols-1 lg:grid-cols-3">
                        <div class="font-semibold">
                            <p class="text-lg">Thông tin cá nhân</p>
                            <p>Vui lòng điền thông tin đầy đủ.</p>
                        </div>

                        <div class="lg:col-span-2">
                            <form action="" method="post" class="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5"
                                enctype="multipart/form-data">
                                <div class="md:col-span-5 mb-2">
                                    <label for="full_name" class="font-semibold text-[16px]">Họ tên</label>
                                    <input type="text" name="name" id="full_name" placeholder="Nhập họ tên ..."
                                        class="h-10 border font-medium mt-1 rounded px-4 w-full bg-transparent"
                                        value="" />
                                </div>
                                <div class="md:col-span-5 mb-2">
                                    <label for="email" class="font-semibold text-[16px]">Địa chỉ email</label>
                                    <input type="text" name="email" id="email"
                                        class="h-10 border font-medium mt-1 rounded px-4 w-full bg-transparent" value=""
                                        placeholder="email@domain.com" />
                                </div>
                                <div class="md:col-span-3 mb-2">
                                    <label for="password" class="font-semibold text-[16px]">Mật khẩu mới</label>
                                    <input type="text" name="password" id="password"
                                        class="h-10 border font-medium mt-1 rounded px-4 w-full bg-transparent" value=""
                                        placeholder="Nhập mật khẩu mới ..." />
                                </div>
                                <div class="md:col-span-2 mb-2">
                                    <label for="ConfirmPassword" class="font-semibold text-[16px]">Nhập lại mật khẩu
                                        mới</label>
                                    <input type="text" name="ConfirmPassword" id="ConfirmPassword"
                                        class="h-10 border font-medium mt-1 rounded px-4 w-full bg-transparent" value=""
                                        placeholder="Nhập lại mật khẩu ..." />
                                </div>

                                <div class="md:col-span-5 my-2">
                                    <label for="city" class="font-semibold text-[16px]">Ảnh của bạn : </label>
                                    <input type="file" name="image" id="imageInput" />
                                </div>
                                <div
                                    class="border-2 md:col-span-5 p-5 h-[200px] rounded-md flex justify-center items-center">
                                    <img id="imagePreview" class="hidden" src="#" alt="Image Preview"
                                        style="max-width:200px; max-height:200px">
                                    <div class="text-[60px] text-slate-300" id="image_icon">
                                        <i class="fa-regular fa-image"></i>
                                    </div>
                                </div>
                                <div class="md:col-span-5 text-right mt-2">
                                    <div class="inline-flex items-end">
                                        <button type="submit"
                                            class="bg-[#333f48] hover:bg-[#DC143C] text-white font-bold py-2 px-4 rounded">Cập
                                            nhật</button>
                                    </div>
                                </div>
                            </form>
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