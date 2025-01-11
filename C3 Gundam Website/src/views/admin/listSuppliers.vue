<script setup>
import { ref, onMounted } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const TenAdmin = localStorage.getItem("TenAdmin");
const ChucVu = localStorage.getItem("ChucVu");
const ThoiGian = new Date();
const listSuppliers = ref([]);

const notification = ref({
    message: '',
    type: ''
});

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

const deleteSupplier = async (maNCC, tenNCC) => {
    const confirmDelete = confirm("Bạn có chắc chắn muốn xóa không?");
    if (!confirmDelete) return;

    try {
        const response = await axios.delete(`http://localhost:3000/api/nhacungcap/${maNCC}`);

        const notificationData = {
            ThongBao: `Vừa xóa nhà cung cấp ${tenNCC}`,
            NguoiChinhSua: TenAdmin,
            ChucVu: ChucVu,
            ThoiGian: ThoiGian,
        };

        await axios.post('http://localhost:3000/api/thongbao', notificationData);

        notification.value = {
            message: "Xóa nhà cung cấp thành công!",
            type: "success",
        };
        setTimeout(() => {
            router.push('/admin/listSuppliers');
        }, 3000);
    } catch (err) {
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
                    <div class="flex gap-4 justify-between items-center">
                        <h1 class="font-bold text-[20px] uppercase">Quản lý nhà cung cấp</h1>
                        <router-link to="/admin/addSupplier"
                            class="bg-[#003171] text-white font-bold w-[50px] h-[50px] rounded-full flex justify-center items-center">
                            <i class="fa-solid fa-plus"></i>
                        </router-link>
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
                                <tr class="border-t border-slate-500" v-for="(supplier, index) in listSuppliers"
                                    :key="index">
                                    <td class="px-6 py-4 font-medium text-gray-900 text-[12px]">{{ supplier.MaNhaCungCap
                                        }}</td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-[12px] text-ellipsis overflow-hidden max-w-40">
                                        <p class="overflow-hidden text-ellipsis whitespace-nowrap">{{
                                            supplier.TenNhaCungCap }}</p>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                        {{ supplier.DienThoai }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                        {{ supplier.DiaChi }}</td>
                                    <td class="flex justify-center items-center gap-2 px-7 py-7 flex-col">
                                        <a :href="`/admin/editSupplier/${supplier.MaNhaCungCap}`"
                                            class="inline-block bg-[#00697F] text-white font-medium py-2 px-4 rounded-md transition-all duration-300 hover:bg-[#055565] whitespace-nowrap"><i
                                                class="fa-solid fa-pen-to-square"></i></a>
                                        <form
                                            @submit.prevent="deleteSupplier(supplier.MaNhaCungCap, supplier.TenNhaCungCap)">
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