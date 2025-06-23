<script setup>
import { defineProps } from 'vue';

const props = defineProps({
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    }
});
</script>

<template>
    <transition name="slide-fade" mode="out-in">
        <div v-if="message" :class="['fixed top-4 left-1/2 right-10 transform p-4 bg-white shadow-lg border-t-4 rounded z-50 flex items-center space-x-2 w-full max-w-sm', {
            'border-[#DB3F4C]': type === 'error',
            'border-[#40E0D0]': type === 'success',
        }]">
            <div class="flex gap-2 justify-center items-center">
                <img :src="type === 'success' ? 'https://res.cloudinary.com/dwcajbc6f/image/upload/v1739607250/rb_7710_w7upkm.png' : 'https://res.cloudinary.com/dwcajbc6f/image/upload/v1739607250/rb_12437_ozptga.png'"
                    class="w-[50px]" alt="">
                <p class="text-[16px] font-semibold"
                    :class="type === 'success' ? 'text-[#40E0D0]' : 'text-[#DB3F4C]'">{{
                        message }}</p>
            </div>
        </div>
    </transition>
</template>

<style scoped>
.fixed {
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
}

.fixed.translate-x-0 {
    transform: translateX(0);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.5s ease;
}

.slide-fade-enter,
.slide-fade-leave-to {
    transform: translateX(100%);
    opacity: 0;
}
</style>