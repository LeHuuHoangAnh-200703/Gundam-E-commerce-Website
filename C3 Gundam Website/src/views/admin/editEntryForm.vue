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

const listSuppliers = ref([]);
const ngayNhap = ref("");
const errors = ref({});
const formData = ref({
    idEntryForm: '',
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

const fetchEntryForm = async (idPhieuNhap) => {
    try {
        // SỬA 2: Dùng API_URL
        const response = await axios.get(`${API_URL}/api/phieunhap/${idPhieuNhap}`);
        formData.value.idSupplier = response.data.MaNhaCungCap;
        formData.value.idEntryForm = response.data.MaPhieuNhap;
        const date = new Date(response.data.NgayNhap);
        const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        ngayNhap.value = localDate.toISOString().slice(0, 10);
    } catch (err) {
        console.log("Error fetching: ", err);
    }
}

const editEntryForm = async () => {
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
        }
        
        // SỬA 3: Dùng API_URL
        const response = await axios.put(`${API_URL}/api/phieunhap/${formData.value.idEntryForm}`, dataToSend);
        
        const notificationData = {
            ThongBao: `${TenAdmin} vừa cập nhật phiếu nhập.`,
            NguoiChinhSua: TenAdmin,
            ThoiGian: ThoiGian,
        };

        // SỬA 4: Dùng API_URL
        await axios.post(`${API_URL}/api/thongbao`, notificationData);
        
        showNotification("Cập nhật phiếu nhập thành công!", "success");
        setTimeout(() => {
            router.push('/admin/listEntryForms');
        }, 3000);

    } catch (err) {
        showNotification(err.response?.data?.message || "Cập nhật phiếu nhập thất bại!", "error");
    }
    setTimeout(() => {
        notification.value.message = '';
    }, 3000);
}

onMounted(() => {
    fetchSuppliers();
    const idPN = router.currentRoute.value.params.maPN;
    console.log(idPN)
    fetchEntryForm(idPN);
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
                        <h1 class="font-bold text-[20px] uppercase">Chỉnh sửa phiếu nhập</h1>
                    </div>
                    <div class="bg-white rounded-lg shadow-lg w-full lg:w-[70%] mx-auto p-4">
                        <form @submit.prevent="editEntryForm" method="POST">
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
                                    <div class="flex flex-col gap-2">
                                        <label for="date" class="text-[15px] font-semibold">Ngày nhập</label>
                                        <input type="date" id="date" v-model="ngayNhap" readonly
                                            class="p-2 border-2 rounded-md text-[14px] outline-none w-full focus:ring focus:ring-[#1A1D27]"
                                            placeholder="Nhập ngày nhập ...">
                                    </div>
                                    <div class="flex justify-center lg:justify-end">
                                        <button type="submit"
                                            class="px-5 py-2 rounded-md font-semibold text-white text-[14px] bg-[#1A1D27] transition-all duration-300 hover:bg-[#003171]">Chỉnh
                                            sửa
                                            phiếu nhập</button>
                                    </div>
                                </div>
                            </div>
                        </form>
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