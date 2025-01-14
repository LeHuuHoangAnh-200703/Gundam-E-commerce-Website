<script setup>
import { ref, onMounted, computed } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const staffLists = ref([]);
const searchValue = ref('');
const idAdmin = localStorage.getItem('MaAdmin');
const notification = ref({
    message: '',
    type: ''
});

const fetchStaffs = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/admin');
        staffLists.value = response.data.filter(staff =>
            staff.MaAdmin !== idAdmin
        ).map(staff => ({
            ...staff,
            NgayTao: new Date(staff.NgayTao)
        }));
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

const updatedStatus = async (maAdmin, newStatus) => {
    const confirmUpdate = confirm('Bạn có chắc chắn cập nhật thông tin này chưa?');
    if (!confirmUpdate) return;
    const nextStatus = newStatus === 'Đang sử dụng' ? 'Đã vô hiệu hóa' : 'Đang sử dụng';
    try {
        const response = await axios.patch(`http://localhost:3000/api/admin/trangthai/${maAdmin}`, {
            TrangThai: nextStatus,
        });
        await fetchStaffs();
        console.log("Status updated successfully:", response.data);
    } catch (err) {
        console.log("Error updating status:", err);
    }
};

const findNameAdmin = computed(() => {
    if (!searchValue.value) {
        return staffLists.value;
    }
    return staffLists.value.filter(staff => {
        const chooseName = staff.TenAdmin.toLowerCase().includes(searchValue.value.toLowerCase());
        return chooseName;
    })
})

const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' };
    const formattedDate = date.toLocaleDateString('vi-VN', options);

    return formattedDate;
};

onMounted(() => {
    fetchStaffs();
})
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full min-h-screen font-sans">
        <div class="flex gap-3">
            <SideBar />
            <div class="relative p-4 flex flex-col gap-4 w-full overflow-auto">
                <Navbar />
                <div class="w-full relative flex flex-col gap-4 overflow-auto max-h-[calc(100vh-100px)] pb-7">
                    <div class="flex lg:flex-row flex-col gap-4 justify-center lg:justify-between items-center">
                        <h1 class="font-bold text-[20px] uppercase">Quản lý nhân viên</h1>
                        <div class="relative flex justify-center flex-1 gap-2 max-w-xl">
                            <input type="text" v-model="searchValue"
                                class="items-center w-full p-3 bg-white border border-gray-400 text-[12px] font-semibold tracking-wider text-black rounded-md focus:outline-none"
                                placeholder="Tìm kiếm nhân viên theo tên ..." />
                            <i
                                class="fa-solid fa-magnifying-glass absolute top-2 lg:top-3 right-3 text-[22px] text-[#003171]"></i>
                        </div>
                    </div>
                    <div class="shadow-lg rounded-lg border-2 border-gray-300">
                        <table class="w-full bg-white whitespace-nowrap text-center text-gray-500">
                            <thead class="bg-[#1A1D27] text-white">
                                <tr>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">STT</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mã nhân viên</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Tên nhân viên</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Email</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Chức vụ</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Ngày Tạo</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Tình trạng</th>
                                    <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Điều chỉnh</th>
                                </tr>
                            </thead>
                            <tbody class="w-full">
                                <tr class="border-t border-slate-500" v-for="(staff, index) in findNameAdmin"
                                    :key="index">
                                    <td class="px-6 py-4 font-medium text-gray-900 text-[12px]">{{ index + 1 }}</td>
                                    <td class="px-6 py-4 font-medium text-gray-900 text-[12px]">{{ staff.MaAdmin }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                        {{ staff.TenAdmin }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">{{
                                        staff.Email }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">{{
                                        staff.ChucVu }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">{{
                                        formatDate(staff.NgayTao) }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">{{
                                        staff.TrangThai }}</td>
                                    <td class="flex justify-center items-center gap-2 px-7 py-7">
                                        <router-link :to="`/admin/editStaff/${staff.MaAdmin}`"
                                            class="inline-block bg-[#00697F] text-white font-medium py-2 px-4 rounded-md transition-all duration-300 hover:bg-[#055565] whitespace-nowrap"><i
                                                class="fa-solid fa-pen-to-square"></i></router-link>
                                        <button type="submit" @click="updatedStatus(staff.MaAdmin, staff.TrangThai)"
                                            class="inline-block text-white font-medium bg-[#003171] py-2 px-4 rounded-md transition-all duration-300 hover:bg-[#1c5ab2] whitespace-nowrap"><i
                                                class="fa-solid fa-repeat"></i></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
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
</style>