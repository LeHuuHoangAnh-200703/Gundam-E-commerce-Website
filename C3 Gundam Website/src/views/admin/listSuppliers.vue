<script setup>
import { ref, onMounted } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import axios from 'axios';

// Hàm mã hóa đầu vào
const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const listSuppliers = ref([]);
const errors = ref({});
const formData = ref({
    nameSupplier: '',
    phone: '',
    address: '',
});

const notification = ref({
    message: '',
    type: ''
});

const addSupplier = async () => {
    errors.value = {};
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

    if (!formData.value.nameSupplier) {
        errors.value.nameSupplier = "Tên nhà cung cấp không để trống khi thêm!";
    } else {
        formData.value.nameSupplier = escapeHtml(formData.value.nameSupplier);
    }

    if (!formData.value.phone) {
        errors.value.phone = "Số điện thoại không để trống khi thêm tài khoản!";
    } else if (!phoneRegex.test(formData.value.phone)) {
        errors.value.phone = "Số điện thoại không đúng định dạng!";
    } else if (formData.value.phone.length !== 10) {
        errors.value.phone = "Số điện thoại phải có 10 ký tự!";
    }

    if (!formData.value.address) {
        errors.value.address = "Địa chỉ không để trống khi thêm tài khoản!";
    } else {
        formData.value.address = escapeHtml(formData.value.address);
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }

    try {
        const dataToSend = {
            TenNhaCungCap: formData.value.nameSupplier,
            DienThoai: formData.value.phone,
            DiaChi: formData.value.address,
        };

        const response = await axios.post('http://localhost:3000/api/nhacungcap', dataToSend);
        notification.value = {
            message: "Thêm nhà cung cấp thành công!",
            type: "success",
        };
        setTimeout(() => {
            router.push('/admin/listSuppliers');
        }, 3000);
    } catch (error) {
        notification.value = {
            message: error.response?.data?.message || "Thêm nhà cung cấp thất bại! Vui lòng kiểm tra lại thông tin.",
            type: "error",
        };
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
};

const fetchSuppliers = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/nhacungcap');
        listSuppliers.value = response.data.map(supplier => {
            return {
                ...supplier
            };
        });
    } catch (error) {
        console.error('Error fetching:', error);
    }
};

const deleteSupplier = async (maNCC) => {
    const confirmDelete = confirm("Bạn có chắc chắn muốn xóa không?");
    if (!confirmDelete) return;

    try {
        const response = await axios.delete(`http://localhost:3000/api/nhacungcap/${maNCC}`);
        notification.value = {
            message: "Xóa nhà cung cấp thành công!",
            type: "success",
        };
        setTimeout(() => {
            router.push('/admin/listSuppliers');
        }, 3000);
    } catch(err) {
        notification.value = {
            message: err.response?.data?.message || "Xóa nhà cung cấp thất bại!",
            type: "error",
        };
    }
}

onMounted(() => {
    fetchSuppliers();
});
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full min-h-screen font-sans">
        <div class="flex gap-3">
            <SideBar />
            <div class="relative p-4 flex flex-col gap-4 w-full overflow-auto">
                <Navbar />
                <div class="w-full relative flex flex-col gap-4 overflow-auto max-h-[calc(100vh-100px)] pb-7">
                    <div class="flex lg:flex-row flex-col gap-4 justify-center items-center">
                        <h1 class="font-bold text-[20px]">Quản lý nhà cung cấp</h1>
                    </div>
                    <div class="bg-white rounded-lg shadow-lg w-full lg:w-[70%] mx-auto p-4">
                        <form @submit.prevent="addSupplier" method="POST">
                            <div class="w-full flex flex-col lg:flex-row gap-8">
                                <div class="w-full flex flex-col gap-4">
                                    <div class="flex flex-col gap-2">
                                        <label for="nameSupplier" class="text-[15px] font-semibold">Tên nhà cung
                                            cấp</label>
                                        <input type="text" v-model="formData.nameSupplier" id="nameSupplier"
                                            class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            placeholder="Nhập tên nhà cung cấp ...">
                                        <p v-if="errors.nameSupplier" class="text-red-500 text-sm mt-2">{{
                                            errors.nameSupplier }}</p>
                                    </div>
                                    <div class="flex flex-col gap-2">
                                        <label for="phoneSupplier" class="text-[15px] font-semibold">Số điện
                                            thoại</label>
                                        <input type="text" v-model="formData.phone" id="phoneSupplier"
                                            class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            placeholder="Nhập số điện thoại ...">
                                        <p v-if="errors.phone" class="text-red-500 text-sm mt-2">{{ errors.phone }}</p>
                                    </div>
                                    <div class="flex flex-col gap-2">
                                        <label for="addressSupplier" class="text-[15px] font-semibold">Địa chỉ</label>
                                        <input type="text" v-model="formData.address" id="addressSupplier"
                                            class="p-2 border-2 rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            placeholder="Nhập địa chỉ ...">
                                        <p v-if="errors.address" class="text-red-500 text-sm mt-2">{{ errors.address }}
                                        </p>
                                    </div>
                                    <div class="flex justify-center lg:justify-end">
                                        <button type="submit"
                                            class="px-5 py-2 rounded-md font-semibold text-white text-[14px] bg-[#1A1D27] transition-all duration-300 hover:bg-[#003171]">Thêm
                                            nhà cung cấp</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="shadow-lg rounded-lg border-2 border-gray-300">
                        <table class="w-full bg-white whitespace-nowrap text-center text-gray-500">
                            <thead class="bg-[#1A1D27] text-white">
                                <tr>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mã nhà cung cấp</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Tên nhà cung cấp</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Số điện thoại</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Địa chỉ</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Điều chỉnh</th>
                                </tr>
                            </thead>
                            <tbody class="w-full">
                                <tr class="border-t border-slate-500" v-for="(supplier, index) in listSuppliers" :key="index">
                                    <td class="px-6 py-4 font-medium text-gray-900 text-[12px]">{{ supplier.MaNhaCungCap }}</td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-[12px] text-ellipsis overflow-hidden max-w-40">
                                        <p class="overflow-hidden text-ellipsis whitespace-nowrap">{{ supplier.TenNhaCungCap }}</p>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                        {{ supplier.DienThoai }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                        {{ supplier.DiaChi }}</td>
                                    <td class="flex justify-center items-center gap-2 px-7 py-7 flex-col">
                                        <a :href="`/admin/editSupplier/${supplier.MaNhaCungCap}`"
                                            class="inline-block bg-[#00697F] text-white font-medium py-2 px-4 rounded-md transition-all duration-300 hover:bg-[#055565] whitespace-nowrap"><i
                                                class="fa-solid fa-pen-to-square"></i></a>
                                        <form @submit.prevent="deleteSupplier(supplier.MaNhaCungCap)">
                                            <button type="submit"
                                                class="inline-block text-white font-medium bg-[#DC143C] py-2 px-4 mb-4 rounded-md transition-all duration-300 hover:bg-[#B22222] whitespace-nowrap"><i
                                                    class="fa-solid fa-trash"></i></button>
                                        </form>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <transition name="slide-fade" mode="out-in">
                        <div v-if="notification.message" :class="['fixed top-4 left-1/2 right-10 transform p-4 bg-white shadow-lg border-t-4 rounded z-10 flex items-center space-x-2 w-full max-w-sm', {
                            'border-[#DB3F4C]': notification.type === 'error',
                            'border-[#40E0D0]': notification.type === 'success',
                        }]">
                            <div class="flex gap-2 justify-center items-center">
                                <img :src="notification.type === 'success' ? '/src/assets/img/rb_7710.png' : '/src/assets/img/rb_12437.png'"
                                    class="w-[50px]" alt="">
                                <p class="text-[16px] font-semibold"
                                    :class="notification.type === 'success' ? 'text-[#40E0D0]' : 'text-[#DB3F4C]'">{{
                                        notification.message }}</p>
                            </div>
                        </div>
                    </transition>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.active-link {
    background: #DB3F4C;
    color: white;
}

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