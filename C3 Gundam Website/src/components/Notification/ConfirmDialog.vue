<template>
    <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div class="p-6">
                <div class="flex items-center mb-4">
                    <div class="flex-shrink-0 w-10 h-10 mx-auto rounded-full flex items-center justify-center"
                        :class="iconBgClass">
                        <i :class="iconClass"></i>
                    </div>
                    <div class="ml-4">
                        <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
                    </div>
                </div>
                <div class="mb-6">
                    <p class="text-sm text-gray-500">{{ message }}</p>
                </div>
                <div class="flex justify-end space-x-3">
                    <button @click="handleCancel"
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
                        {{ cancelText }}
                    </button>
                    <button @click="handleConfirm"
                        class="px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                        :class="confirmButtonClass">
                        {{ confirmText }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: 'Xác nhận'
    },
    message: {
        type: String,
        default: 'Bạn có chắc chắn muốn thực hiện hành động này?'
    },
    confirmText: {
        type: String,
        default: 'Xác nhận'
    },
    cancelText: {
        type: String,
        default: 'Hủy bỏ'
    },
    type: {
        type: String,
        default: 'warning', // warning, success, error, info
        validator: (value) => ['warning', 'success', 'error', 'info'].includes(value)
    }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

// Computed properties cho styling dựa trên type
const iconClass = computed(() => {
    const iconMap = {
        warning: 'fas fa-exclamation-triangle text-yellow-600',
        success: 'fas fa-check text-green-600',
        error: 'fas fa-times text-red-600',
        info: 'fas fa-info text-blue-600'
    }
    return iconMap[props.type]
})

const iconBgClass = computed(() => {
    const bgMap = {
        warning: 'bg-yellow-100',
        success: 'bg-green-100',
        error: 'bg-red-100',
        info: 'bg-blue-100'
    }
    return bgMap[props.type]
})

const confirmButtonClass = computed(() => {
    const buttonMap = {
        warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
        error: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    }
    return buttonMap[props.type]
})

const handleConfirm = () => {
    emit('confirm')
    emit('close')
}

const handleCancel = () => {
    emit('cancel')
    emit('close')
}
</script>