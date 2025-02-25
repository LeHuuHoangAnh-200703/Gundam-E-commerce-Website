<script setup>

</script>

<template>
    <section class="flex items-center min-h-screen bg-[#1E1E2F]">
        <div class="container flex flex-col items-center justify-center px-5 mx-auto my-8">
            <div class="max-w-md text-center text-white">
                <h2 class="mb-8 font-extrabold text-8xl text-red-500">
                    404
                </h2>
                <p class="text-xl font-semibold md:text-2xl">Oops! Có vẻ như bạn đã đi nhầm đường.</p>
                <p class="mt-4 mb-8">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            </div>
            <router-link to="/" class="text-white font-bold text-[20px] bg-red-500 px-5 py-3 rounded-lg">Trang chủ</router-link>
        </div>
    </section>
</template>

<style></style>