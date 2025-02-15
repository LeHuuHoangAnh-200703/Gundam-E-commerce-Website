<script setup>
import { onMounted, ref } from "vue";
import Navbar from "@/components/admin/Navbar.vue";
import SideBar from "@/components/admin/SideBar.vue";
import axios from "axios";
import { useRouter } from 'vue-router';

const router = useRouter();

const TenAdmin = localStorage.getItem("TenAdmin");
const Email = localStorage.getItem("Email");
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

const fetchSuppliers = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/nhacungcap');
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
        const response = await axios.get(`http://localhost:3000/api/phieunhap/${idPhieuNhap}`);
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
        const response = await axios.put(`http://localhost:3000/api/phieunhap/${formData.value.idEntryForm}`, dataToSend);
        
        const notificationData = {
            ThongBao: `${TenAdmin} vừa cập nhật phiếu nhập.`,
            NguoiChinhSua: TenAdmin,
            Email: Email,
            ThoiGian: ThoiGian,
        };

        await axios.post('http://localhost:3000/api/thongbao', notificationData);
        
        notification.value = {
            message: "Cập nhật phiếu nhập thành công!",
            type: "success",
        };
        setTimeout(() => {
            router.push('/admin/listEntryForms');
        }, 3000);

    } catch (err) {
        notification.value = {
            message: err.response?.data?.message || "Cập nhật phiếu nhập thất bại!",
            type: "error",
        };
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
    <div class="relative bg-[#F2F2F7] w-full min-h-screen font-sans">
        <div class="flex gap-3">
            <SideBar />
            <div class="relative p-4 flex flex-col gap-4 w-full overflow-auto">
                <Navbar />
                <div class="w-full relative flex flex-col gap-4 overflow-auto max-h-[calc(100vh-100px)] pb-7">
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