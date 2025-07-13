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
    <transition name="toast-slide" mode="out-in" enter-active-class="animate-slide-in"
        leave-active-class="animate-slide-out">
        <div v-if="message" :class="[
            'fixed top-6 right-6 max-w-md w-full z-50 transform transition-all duration-300 ease-out',
            'backdrop-blur-xl bg-white/90 dark:bg-gray-900/90',
            'rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50',
            'hover:scale-[1.02] cursor-pointer',
            'group overflow-hidden'
        ]">
            <div :class="[
                'absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300',
                {
                    'bg-gradient-to-r from-red-500 to-red-600': type === 'error',
                    'bg-gradient-to-r from-emerald-500 to-teal-500': type === 'success',
                }
            ]"></div>
            <div :class="[
                'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
                {
                    'from-red-500 to-red-600': type === 'error',
                    'from-emerald-500 to-teal-500': type === 'success',
                }
            ]"></div>
            <div class="relative p-5">
                <div class="flex items-start space-x-4">
                    <div :class="[
                        'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
                        'shadow-lg transform transition-all duration-300',
                        {
                            'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/25': type === 'error',
                            'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/25': type === 'success',
                        }
                    ]">
                        <img :src="type === 'success' ?
                            'https://res.cloudinary.com/dwcajbc6f/image/upload/v1752393672/success_2_saihnb.png' :
                            'https://res.cloudinary.com/dwcajbc6f/image/upload/v1752393672/error_2_cqwgmb.png'"
                            class="w-7 h-7 object-contain rounded-lg" alt="">
                    </div>
                    <div class="flex-1 min-w-0">
                        <p :class="[
                            'text-base font-semibold leading-relaxed transition-colors duration-300',
                            {
                                'text-red-700 dark:text-red-400': type === 'error',
                                'text-emerald-700 dark:text-emerald-400': type === 'success',
                            }
                        ]">
                            {{ message }}
                        </p>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 opacity-80">
                            {{ type === 'success' ? 'Thao tác thành công' : 'Có lỗi xảy ra' }}
                        </p>
                    </div>
                </div>
                <div v-if="showProgress"
                    class="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
                    <div :class="[
                        'h-full bg-gradient-to-r transition-all duration-100 ease-linear',
                        {
                            'from-red-500 to-red-600': type === 'error',
                            'from-emerald-500 to-teal-500': type === 'success',
                        }
                    ]" :style="{ width: progressWidth + '%' }"></div>
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped>
@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }

    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }

    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

.animate-slide-in {
    animation: slideIn 0.3s ease-out;
}

.animate-slide-out {
    animation: slideOut 0.3s ease-in;
}

.shadow-3xl {
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

@media (prefers-color-scheme: dark) {
    .backdrop-blur-xl {
        backdrop-filter: blur(16px);
    }
}
</style>