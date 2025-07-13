<script setup>
import { defineProps } from 'vue';

const props = defineProps({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true,
    }
});
</script>

<template>
    <div class="flex justify-center items-center m-auto w-full min-h-[300px]">
        <div class="flex flex-col items-center justify-center gap-6 max-w-md mx-auto">
            <div class="relative">
                <div
                    class="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
                    <i :class="icon" class="fa-solid text-[46px] text-white"></i>
                </div>
                <div class="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full opacity-80 animate-bounce">
                </div>
                <div class="absolute -bottom-1 -left-2 w-3 h-3 bg-pink-400 rounded-full opacity-70">
                </div>
                <div class="absolute top-1 -left-3 w-2 h-2 bg-green-400 rounded-full opacity-60 animate-pulse">
                </div>
            </div>
            <div class="text-center space-y-3">
                <h3 class="font-bold text-white text-xl lg:text-2xl">
                    {{ title }}
                </h3>
                <p class="text-gray-300 text-sm lg:text-base leading-relaxed">
                    {{ message }}
                </p>
            </div>
        </div>
    </div>
</template>

<style></style>