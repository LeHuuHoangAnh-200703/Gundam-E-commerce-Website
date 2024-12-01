<script setup>
import {ref, onMounted} from "vue"
import Header from "@/components/client/Header.vue";

onMounted(() => {
    const openMenu = $(".open-menu");
    const closeMenu = $(".close-menu");
    const sideBar = $(".sidebar");

    openMenu.click(() => {
        sideBar.animate({left: "0"}, 400);
    })

    closeMenu.click(() => {
        sideBar.animate({left: "-100%"}, 400);
    })
});
</script>

<template>
    <div class="bg-[#1A1D27] relative overflow-hidden min-h-screen font-sans">
        <Header />
        <div class="w-full h-[200px] bg-[#DB3F4C]">
            <div class="flex justify-between items-center w-full px-[180px]">
                <!-- <img src="../../assets/img/banner.png" alt=""> -->
            </div>
        </div>
    </div>
</template>

<style></style>