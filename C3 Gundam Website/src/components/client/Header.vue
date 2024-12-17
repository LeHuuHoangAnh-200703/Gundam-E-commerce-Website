<script setup>
import { ref, onMounted } from "vue"

onMounted(() => {
    const openMenu = $(".open-menu");
    const closeMenu = $(".close-menu");
    const sideBar = $(".sidebar");

    openMenu.click(() => {
        sideBar.animate({ left: "0" }, 400);
    })

    closeMenu.click(() => {
        sideBar.animate({ left: "-100%" }, 400);
    })
});
</script>

<template>
    <header>
        <div class="relative px-5 lg:px-10 py-5 flex justify-between items-center">
            <router-link to="/" class="font-bold text-white text-[24px] font-bungee"><span
                    class="text-[#DB3F4C]">C3</span>
                GunDam</router-link>
            <ul class="lg:flex hidden gap-5 items-center text-white font-semibold text-[16px]">
                <li class="group"><router-link to="/">Trang chủ</router-link>
                    <div
                        class="h-[2px] bg-[#DB3F4C] scale-x-0 group-hover:scale-100 rounded-full transition-all ease-out origin-left duration-500">
                    </div>
                </li>
                <li class="group"><router-link to="/orders_history">Lịch sử mua hàng</router-link>
                    <div
                        class="h-[2px] bg-[#DB3F4C] scale-x-0 group-hover:scale-100 rounded-full transition-all ease-out origin-left duration-500">
                    </div>
                </li>
                <li class="group"><router-link to="/profile">Tài khoản</router-link>
                    <div
                        class="h-[2px] bg-[#DB3F4C] scale-x-0 group-hover:scale-100 rounded-full transition-all ease-out origin-left duration-500">
                    </div>
                </li>
                <li class="group"><router-link to="/login">Đăng nhập</router-link>
                    <div
                        class="h-[2px] bg-[#DB3F4C] scale-x-0 group-hover:scale-100 rounded-full transition-all ease-out origin-left duration-500">
                    </div>
                </li>
            </ul>
            <div class="flex lg:gap-10 gap-7 items-end">
                <router-link to="/carts" class="relative">
                    <i class="fa-solid fa-cart-shopping text-white text-[24px]"></i>
                    <span
                        class="absolute -top-3 -right-2 flex items-center justify-center w-[24px] h-[24px] text-[15px] bg-[#DB3F4C] text-white font-semibold rounded-full">0</span>
                </router-link>
                <button class="open-menu lg:hidden block">
                    <i class="fa-solid fa-bars text-white text-[24px]"></i>
                </button>
            </div>
        </div>
        <div class="sidebar fixed top-0 -left-[100%] w-full h-full bg-[#1A1D27] p-4 z-10">
            <div class="flex justify-between items-center">
                <h1 class="font-bold text-white text-[24px] font-bungee"><span class="text-[#DB3F4C]">C3</span>
                    GunDam</h1>
                <button class="close-menu p-3 border-2 rounded-full w-[50px] h-[50px] flex items-center justify-center">
                    <i class="fa-solid fa-arrow-left text-white text-[24px]"></i>
                </button>
            </div>
            <ul class="flex flex-col gap-6 text-[20px] text-white font-semibold">
                <li class="group flex gap-3 items-center hover:text-[#DB3F4C] transition-all duration-300"><i
                        class="fa-solid fa-house"></i> <router-link to="/">Trang chủ</router-link></li>
                <li class="group flex gap-3 items-center hover:text-[#DB3F4C] transition-all duration-300"><i
                        class="fa-solid fa-bag-shopping"></i> <router-link to="/orders_history">Lịch sử mua hàng</router-link></li>
                <li class="group flex gap-3 items-center hover:text-[#DB3F4C] transition-all duration-300"><i
                        class="fa-solid fa-user"></i> <router-link to="/profile">Tài khoản</router-link></li>
                <li class="group flex gap-3 items-center hover:text-[#DB3F4C] transition-all duration-300"><i
                        class="fa-solid fa-globe"></i> <router-link to="/login">Đăng nhập</router-link></li>
            </ul>
        </div>
    </header>
</template>

<style></style>