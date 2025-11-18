<script setup>
import { onMounted, ref } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import NotificationAdmin from "@/components/Notification/NotificationAdmin.vue";
import axios from "axios";
import { useRouter } from 'vue-router';

const router = useRouter();

// --- CẤU HÌNH URL ĐỘNG ---
// Tự động nhận diện môi trường: Netlify (Production) hoặc Localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// -------------------------

const TenAdmin = localStorage.getItem("TenAdmin");
const MaAdmin = localStorage.getItem("MaAdmin");
const ThoiGian = new Date();
const filterYear = ref("");
const filterMonth = ref("");
const filterDay = ref("");
const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString());
const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
const listSuppliers = ref([]);
const listEntryForms = ref([]);
const errors = ref({});
const formData = ref({
    idSupplier: '',
});

const notification = ref({
    message: '',
    type: ''
});
const showNotification = (msg, type) => {
    notification.value = { message: msg, type: type };
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
};

const fetchSuppliers = async () => {
    try {
        // SỬA 1: Dùng API_URL
        const response = await axios.get(`${API_URL}/api/nhacungcap`);
        listSuppliers.value = response.data.map(supplier => {
            return {
                ...supplier,
            }
        })
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

const addEntryForm = async () => {
    errors.value = {}

    if (!formData.value.idSupplier) {
        errors.value.idSupplier = "Nhà cung cấp không được trống.";
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }

    try {
        const selectedSupplier = listSuppliers.value.find(
            (supplier) => supplier.MaNhaCungCap === formData.value.idSupplier
        );

        formData.value.nameSupplier = selectedSupplier.TenNhaCungCap;
        const dataToSend = {
            MaNhaCungCap: formData.value.idSupplier,
            TenNhaCungCap: formData.value.nameSupplier,
            MaNhanVien: MaAdmin,
            TenNhanVien: TenAdmin,
            NgayNhap: ThoiGian,
        }

        // SỬA 2: Dùng API_URL
        const response = await axios.post(`${API_URL}/api/phieunhap`, dataToSend);
        
        const notificationData = {
            ThongBao: `${TenAdmin} vừa tạo phiếu nhập kho sản phẩm.`,
            NguoiChinhSua: TenAdmin,
            ThoiGian: ThoiGian,
        };

        // SỬA 3: Dùng API_URL
        await axios.post(`${API_URL}/api/thongbao`, notificationData);

        showNotification("Thêm phiếu nhập thành công!", "success");
        fetchEntryForm();
    } catch (err) {
        showNotification(err.response?.data?.message || "Thêm phiếu nhập thất bại!", "error");
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}

const fetchEntryForm = async () => {
    try {
        // SỬA 4: Dùng API_URL
        const response = await axios.get(`${API_URL}/api/phieunhap`);
        listEntryForms.value = response.data.map(entryForm => {
            return {
                ...entryForm,
                NgayNhap: new Date(entryForm.NgayNhap),
            }
        });
        listEntryForms.value.sort((a, b) => b.NgayNhap - a.NgayNhap);
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

const checkQuantityEntryForms = async (idPhieuNhap) => {
    try {
        // SỬA 5: Dùng API_URL
        const response = await axios.get(`${API_URL}/api/phieunhap/kiemtra/${idPhieuNhap}`);
        if (response.data.results) {
            showNotification("Đã có thông tin nhập kho, không thể sửa!", "error");
            return;
        } else {
            router.push(`/admin/editEntryForm/${idPhieuNhap}`)
        }
    } catch (err) {
        console.log("Error fetching: ", err);
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}

const fetchEntryformByDayMonth = async () => {
    try {
        const params = {};
        if (filterYear.value) params.year = filterYear.value;
        if (filterMonth.value) params.month = filterMonth.value;
        if (filterDay.value) params.day = filterDay.value;

        // SỬA 6: Dùng API_URL
        const response = await axios.get(`${API_URL}/api/phieunhap/locphieunhap/ngaythangnam`, { params });
        listEntryForms.value = response.data.map(entryform => ({
            ...entryform,
            NgayNhap: new Date(entryform.NgayNhap)
        })).sort((a, b) => b.NgayNhap - a.NgayNhap);
    } catch (err) {
        console.log("Lỗi khi lọc đơn hàng", err);
    }
}

const resetFilter = () => {
    filterYear.value = "";
    filterMonth.value = "";
    filterDay.value = "";
    fetchEntryForm();
};

const formatDate = (date) => {
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' };
    const formattedDate = date.toLocaleString('vi-VN', options);

    const [time, day] = formattedDate.split(', ');
    return `${time}`;
};

onMounted(() => {
    fetchSuppliers();
    fetchEntryForm();
})
</script>

<template>
    <div class="relative bg-[#F2F2F7] w-full h-screen font-sans flex">
        <SideBar />
        <div class="flex-1 flex flex-col h-screen overflow-hidden">
            <div class="flex-shrink-0 p-4">
                <Navbar />
            </div>
            <div class="flex-1 px-4 py-4 overflow-y-auto">
                <div class="flex flex-col gap-4">
                    <div class="flex lg:flex-row flex-col gap-4 justify-center items-center">
                        <h1 class="font-bold text-[20px] uppercase">Quản lý phiếu nhập</h1>
                    </div>
                    <div class="bg-white rounded-lg shadow-lg w-full lg:w-[70%] mx-auto p-4">
                        <form @submit.prevent="addEntryForm" method="POST">
                            <div class="w-full flex flex-col lg:flex-row gap-8">
                                <div class="w-full flex flex-col gap-4">
                                    <div class="flex flex-col gap-2">
                                        <label for="brandProduct" class="text-[15px] font-semibold">Nhà cung
                                            cấp</label>
                                        <select v-model="formData.idSupplier"
                                            class="p-2 border-2 cursor-pointer text-[#003171] rounded-md text-[14px] outline-none font-semibold w-full focus:ring focus:ring-[#1A1D27]"
                                            name="" id="brandProduct">
                                            <option value="" class="text-[#003171] font-semibold">Chọn nhà cung cấp
                                                phù hợp</option>
                                            <option v-for="(supplier, index) in listSuppliers" :key="index"
                                                :value="supplier.MaNhaCungCap" class="text-[#003171] font-semibold">{{
                                                    supplier.MaNhaCungCap }} -
                                                {{ supplier.TenNhaCungCap }}</option>
                                        </select>
                                        <p v-if="errors.idSupplier" class="text-red-500 text-sm mt-2">{{
                                            errors.idSupplier }}</p>
                                    </div>
                                    <div class="flex justify-center lg:justify-end">
                                        <button type="submit"
                                            class="px-5 py-2 rounded-md font-semibold text-white text-[14px] bg-[#1A1D27] transition-all duration-300 hover:bg-[#003171]">Thêm
                                            phiếu nhập</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="flex justify-end items-center gap-4">
                        <select v-model="filterDay" class="p-2 border-2 border-[#333] rounded-md font-semibold outline-none w-full">
                            <option value="">Chọn ngày (tùy chọn)</option>
                            <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
                        </select>
                        <select v-model="filterMonth" class="p-2 border-2 border-[#333] rounded-md font-semibold outline-none w-full">
                            <option value="">Chọn tháng (tùy chọn)</option>
                            <option v-for="month in months" :key="month" :value="month">Tháng {{ month }}
                            </option>
                        </select>
                        <select v-model="filterYear" class="p-2 border-2 border-[#333] rounded-md font-semibold outline-none w-full">
                            <option value="">Chọn năm (tùy chọn)</option>
                            <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                        </select>
                        <div class="flex gap-2">
                            <button @click="fetchEntryformByDayMonth"
                                class="px-4 py-2 bg-[#003171] text-white rounded-md hover:bg-[#1A1D27]">Lọc</button>
                            <button @click="resetFilter"
                                class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Reset</button>
                        </div>
                    </div>
                    <div class="shadow-lg rounded-lg border-2 border-gray-300">
                        <div class="w-full overflow-x-auto">
                            <table class="w-full bg-white whitespace-nowrap text-center text-gray-500">
                                <thead class="bg-[#1A1D27] text-white">
                                    <tr>
                                        <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mã phiếu nhập</th>
                                        <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mã nhà cung cấp</th>
                                        <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Tên nhà cung cấp
                                        </th>
                                        <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Mã nhân viên</th>
                                        <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Tên nhân viên</th>
                                        <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Ngày nhập</th>
                                        <th scope="col" class="px-6 py-4 font-semibold text-[12px]">Điều chỉnh</th>
                                    </tr>
                                </thead>
                                <tbody class="w-full">
                                    <tr class="border-t border-slate-500" v-for="(entryForm, index) in listEntryForms"
                                        :key="index">
                                        <td class="px-6 py-4 font-medium text-gray-900 text-[12px]">{{
                                            entryForm.MaPhieuNhap
                                        }}</td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                            {{ entryForm.MaNhaCungCap }}</td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-[12px] text-ellipsis overflow-hidden max-w-40">
                                            <p class="overflow-hidden text-ellipsis whitespace-nowrap">
                                                {{ entryForm.TenNhaCungCap }}</p>
                                        </td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                            {{ entryForm.MaNhanVien }}</td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                            {{ entryForm.TenNhanVien }}</td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-[12px] overflow-hidden text-ellipsis">
                                            {{ formatDate(entryForm.NgayNhap) }}</td>
                                        <td class="flex justify-center items-center gap-2 px-7 py-7 flex-col">
                                            <button @click="checkQuantityEntryForms(entryForm.MaPhieuNhap)"
                                                class="inline-block bg-[#00697F] text-white font-medium py-2 px-4 rounded-md transition-all duration-300 hover:bg-[#055565] whitespace-nowrap"><i
                                                    class="fa-solid fa-pen-to-square"></i></button>
                                            <router-link :to="`/admin/listEntryFormInfo/${entryForm.MaPhieuNhap}`"
                                                class="inline-block bg-[#003171] text-white font-medium py-2 px-4 rounded-md transition-all duration-300 hover:bg-[#0c2d58] whitespace-nowrap"><i
                                                    class="fa-solid fa-hashtag"></i></router-link>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <NotificationAdmin :message="notification.message" :type="notification.type" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.active-link {
    background: #DB3F4C;
    color: white;
}
</style>